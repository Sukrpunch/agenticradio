import { supabase } from '@/context/AuthContext';
import { NextRequest, NextResponse } from 'next/server';

const ADMIN_KEY = process.env.ADMIN_API_KEY || 'AgenticAdmin2026!';

export async function POST(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key');

  if (adminKey !== ADMIN_KEY) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { username, verified, note } = await req.json();

    if (!username || verified === undefined) {
      return NextResponse.json(
        { error: 'username and verified are required' },
        { status: 400 }
      );
    }

    // Find user by username
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    // Update verification status
    const updateData: any = {
      is_verified: verified,
    };

    if (verified) {
      updateData.verified_at = new Date().toISOString();
      updateData.verified_note = note || null;
    } else {
      updateData.verified_at = null;
      updateData.verified_note = null;
    }

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', profile.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      username,
      verified,
      message: `Creator ${verified ? 'verified' : 'unverified'} successfully`,
    });
  } catch (error) {
    console.error('Verify creator error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
