const RESEND_API_URL = "https://api.resend.com/emails";

function getResendApiKey() {
  return process.env.RESEND_API_KEY?.trim() || "";
}

function getEmailFrom() {
  return process.env.EMAIL_FROM?.trim() || "";
}

export function isEmailDeliveryConfigured() {
  return Boolean(getResendApiKey() && getEmailFrom());
}

export async function sendEmail(input: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}) {
  const apiKey = getResendApiKey();
  const from = getEmailFrom();

  if (!apiKey || !from) {
    throw new Error("email_not_configured");
  }

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "KROOKIES Shop/0.2.0",
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | { id?: string; message?: string; name?: string }
    | null;

  if (!response.ok) {
    console.error("email send failed", {
      status: response.status,
      payload,
    });
    throw new Error("email_send_failed");
  }

  if (!payload?.id) {
    throw new Error("email_send_failed");
  }

  return payload;
}
