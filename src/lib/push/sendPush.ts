import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

// Initialize VAPID details
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:mason@bessjobs.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  badge?: string;
}

export async function sendPushToUser(userId: string, payload: PushPayload) {
  try {
    // Import supabase service client inside function to avoid edge issues
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get all push subscriptions for this user
    const { data: subs, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to fetch push subscriptions:', error);
      return [];
    }

    if (!subs || subs.length === 0) {
      console.log(`No push subscriptions found for user ${userId}`);
      return [];
    }

    // Construct push notification payload
    const payloadStr = JSON.stringify({
      ...payload,
      icon: payload.icon || '/icon-192.png',
      badge: '/icon-192.png'
    });

    // Send to all subscriptions
    const results = await Promise.allSettled(
      subs.map(sub =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth
            }
          },
          payloadStr
        ).catch(async (err) => {
          // Remove expired/invalid subscriptions (410 Gone, 404 Not Found)
          if (err.statusCode === 410 || err.statusCode === 404) {
            console.log(`Removing expired subscription: ${sub.endpoint}`);
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', sub.endpoint);
          }
          throw err;
        })
      )
    );

    // Log results
    const successful = results.filter(r => r.status === 'fulfilled').length;
    console.log(`Push sent to ${successful}/${subs.length} subscriptions for user ${userId}`);

    return results;
  } catch (error) {
    console.error('Error in sendPushToUser:', error);
    return [];
  }
}
