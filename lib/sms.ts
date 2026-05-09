import { normalizePhone } from "@/lib/phone";

const DIRECT_SMS_SEND_URL = "https://direct.i-dgtl.ru/api/v1/message";

type DirectSmsSendResult = {
  errors: boolean;
  items?: Array<{
    messageUuid?: string;
    externalMessageId?: string;
    code?: number;
  }>;
  error?: {
    code: number;
    msg: string;
  };
};

type SendSmsInput = {
  phone: string;
  message: string;
};

function getDirectSmsApiKey() {
  return process.env.DIRECT_SMS_API_KEY?.trim() || "";
}

function getDirectSmsSenderName() {
  return process.env.DIRECT_SMS_SENDER_NAME?.trim() || "sms_promo";
}

function normalizeDirectSmsPhone(phone: string) {
  return normalizePhone(phone).replace(/^\+/, "");
}

export function isSmsConfigured() {
  return Boolean(getDirectSmsApiKey());
}

export async function sendSms({ phone, message }: SendSmsInput) {
  const apiKey = getDirectSmsApiKey();

  if (!apiKey) {
    throw new Error("sms_not_configured");
  }

  const normalizedPhone = normalizeDirectSmsPhone(phone);
  const externalMessageId = `otp-${normalizedPhone}-${Date.now()}`;

  const response = await fetch(DIRECT_SMS_SEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      {
        channelType: "SMS",
        senderName: getDirectSmsSenderName(),
        destination: normalizedPhone,
        content: message,
        externalMessageId,
      },
    ]),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as DirectSmsSendResult | null;

  if (!response.ok) {
    if (payload?.error?.code) {
      throw new Error(`direct_sms_${payload.error.code}`);
    }

    throw new Error("sms_gateway_unavailable");
  }

  if (!payload) {
    throw new Error("sms_invalid_response");
  }

  if (payload.error?.code) {
    throw new Error(`direct_sms_${payload.error.code}`);
  }

  if (payload.errors || !payload.items?.length) {
    throw new Error("sms_send_failed");
  }

  const item = payload.items[0];
  if (item?.code !== 201) {
    throw new Error(item?.code ? `direct_sms_item_${item.code}` : "sms_send_failed");
  }

  return {
    phone: normalizedPhone,
    messageUuid: item.messageUuid || null,
    externalMessageId: item.externalMessageId || externalMessageId,
  };
}
