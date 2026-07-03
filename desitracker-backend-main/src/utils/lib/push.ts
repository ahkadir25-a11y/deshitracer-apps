import https from 'https';

export interface PushMessage {
  to: string | string[];
  title: string;
  body: string;
  sound?: 'default' | null;
  channelId?: string;
  data?: Record<string, any>;
}

// Send one or more messages to the Expo push service.
// Silently ignores invalid / unregistered tokens — no throw on partial failure.
export async function sendExpoPush(
  messages: PushMessage | PushMessage[],
): Promise<void> {
  const batch = Array.isArray(messages) ? messages : [messages];
  if (!batch.length) return;

  const payload = JSON.stringify(
    batch.map((m) => ({
      ...m,
      sound: m.sound ?? 'default',
      channelId: m.channelId ?? 'shift-reminders',
    })),
  );

  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: 'exp.host',
        path: '/--/api/v2/push/send',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        res.resume();
        res.on('end', resolve);
      },
    );
    req.on('error', (err) => {
      console.error('[push] Expo push error:', err.message);
      resolve();
    });
    req.write(payload);
    req.end();
  });
}
