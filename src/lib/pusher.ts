import Pusher from 'pusher';

// Server-side Pusher instance (lazy initialization)
let pusherInstance: Pusher | null = null;

function getPusher(): Pusher {
  if (!pusherInstance) {
    pusherInstance = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      useTLS: true,
    });
  }
  return pusherInstance;
}

// Send notification to a specific user
export async function sendNotification(
  userId: string,
  event: string,
  data: Record<string, unknown>
) {
  try {
    const pusher = getPusher();
    await pusher.trigger(`user-${userId}`, event, data);
    return { success: true };
  } catch (error) {
    console.error('Pusher notification error:', error);
    return { success: false, error };
  }
}

// Send chat message to a conversation channel
export async function sendChatMessage(
  channel: string,
  data: Record<string, unknown>
) {
  try {
    const pusher = getPusher();
    await pusher.trigger(channel, 'new-message', data);
    return { success: true };
  } catch (error) {
    console.error('Pusher chat message error:', error);
    return { success: false, error };
  }
}
