import nodemailer from "nodemailer";

const RESEND_API_URL = "https://api.resend.com/emails";

function getResendApiKey() {
  return process.env.RESEND_API_KEY?.trim() || "";
}

function getEmailFrom() {
  return process.env.EMAIL_FROM?.trim() || "";
}

function getSmtpConfig() {
  const user = process.env.SMTP_USER?.trim() || "";
  const password = process.env.SMTP_PASSWORD?.replace(/\s+/g, "") || "";
  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || "465");

  return {
    user,
    password,
    host,
    port: Number.isFinite(port) ? port : 465,
  };
}

function isSmtpConfigured() {
  const smtp = getSmtpConfig();
  return Boolean(smtp.user && smtp.password);
}

export function isEmailDeliveryConfigured() {
  return isSmtpConfigured() || Boolean(getResendApiKey() && getEmailFrom());
}

export async function sendEmail(input: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}) {
  if (isSmtpConfigured()) {
    const smtp = getSmtpConfig();
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
      auth: {
        user: smtp.user,
        pass: smtp.password,
      },
    });

    try {
      const result = await transporter.sendMail({
        from: `KROOKIES <${smtp.user}>`,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
      });

      console.info("email accepted by smtp provider", { id: result.messageId });
      return { id: result.messageId };
    } catch (error) {
      console.error("smtp email send failed", {
        code: error instanceof Error && "code" in error ? error.code : undefined,
        message: error instanceof Error ? error.message : "unknown_error",
      });
      throw new Error("email_send_failed");
    }
  }

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

  console.info("email accepted by provider", { id: payload.id });

  return payload;
}
