export async function notifySlack(error: unknown, url?: string) {
  const webhook = process.env.SLACK_WEBHOOK;
  if (!webhook) return;

  const message =
    typeof error === "object" && error !== null
      ? JSON.stringify(error, null, 2)
      : String(error);

  const payload = {
    attachments: [
      {
        color: "#ff0000",
        text: "🚨 *Next.js 서버 에러 발생!*",
        fields: [
          { title: "Error", value: message.slice(0, 2000), short: false },
          { title: "URL", value: url ?? "-", short: true },
        ],
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  };

  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error("[Slack Notify Failed]", e);
  }
}
