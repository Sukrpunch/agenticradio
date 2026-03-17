import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get conversations for this user
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        id,
        participant_1,
        participant_2,
        last_message_at,
        unread_1,
        unread_2,
        created_at,
        messages (
          id,
          body,
          sender_id,
          created_at
        )
      `)
      .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Conversations fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Enrich with other participant info and last message
    const enrichedConversations = await Promise.all(
      (conversations || []).map(async (conv: any) => {
        const otherParticipantId = conv.participant_1 === user.id ? conv.participant_2 : conv.participant_1;
        const unreadCount = conv.participant_1 === user.id ? conv.unread_1 : conv.unread_2;
        
        const { data: otherProfile } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .eq('id', otherParticipantId)
          .single();

        const lastMessage = conv.messages?.[0];

        return {
          id: conv.id,
          otherParticipant: otherProfile,
          lastMessage: lastMessage?.body || '',
          lastMessageAt: conv.last_message_at,
          unreadCount,
          createdAt: conv.created_at,
        };
      })
    );

    return NextResponse.json({ conversations: enrichedConversations });
  } catch (error) {
    console.error('Conversations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { recipient_id, body: messageBody } = body;

    if (!recipient_id || !messageBody) {
      return NextResponse.json({ error: 'Missing recipient_id or body' }, { status: 400 });
    }

    if (messageBody.length > 1000) {
      return NextResponse.json({ error: 'Message too long (max 1000 chars)' }, { status: 400 });
    }

    // Upsert conversation (ensure both participants, deterministic order)
    const p1 = user.id < recipient_id ? user.id : recipient_id;
    const p2 = user.id < recipient_id ? recipient_id : user.id;

    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .upsert(
        {
          participant_1: p1,
          participant_2: p2,
          last_message_at: new Date().toISOString(),
        },
        { onConflict: 'participant_1,participant_2' }
      )
      .select()
      .single();

    if (convError) {
      console.error('Conversation upsert error:', convError);
      return NextResponse.json({ error: convError.message }, { status: 500 });
    }

    // Insert message
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        sender_id: user.id,
        body: messageBody,
      })
      .select()
      .single();

    if (msgError) {
      console.error('Message insert error:', msgError);
      return NextResponse.json({ error: msgError.message }, { status: 500 });
    }

    // Update unread count and last_message_at for recipient
    const unreadCol = p1 === user.id ? 'unread_2' : 'unread_1';
    await supabase
      .from('conversations')
      .update({
        [unreadCol]: conversation[unreadCol] + 1,
        last_message_at: new Date().toISOString(),
      })
      .eq('id', conversation.id);

    // Create notification for recipient
    const { data: senderProfile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single();

    await supabase
      .from('notifications')
      .insert({
        user_id: recipient_id,
        actor_id: user.id,
        type: 'message',
        entity_id: conversation.id,
        entity_type: 'conversation',
        message: `${senderProfile?.display_name || 'Someone'} sent you a message`,
      });

    return NextResponse.json({ conversation, message });
  } catch (error) {
    console.error('Message send error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
