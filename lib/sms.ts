import { normalizePhone } from "@/lib/phone";

const DIRECT_VERIFIER_SEND_URL = "https://direct.i-dgtl.ru/api/v1/verifier/send";
const DIRECT_VERIFIER_CHECK_URL = "https://direct.i-dgtl.ru/api/v1/verifier/check";

type DirectVerifierResponse = {
  uuid?: string;
  error?: {
    code: number;
    msg: string;
  };
};

type SendVerificationCodeInput = {
  phone: string;
};

type CheckVerificationCodeInput = {
  uuid: string;
  code: string;
};

function getDirectVerifierApiKey() {
  return process.env.DIRECT_VERIFIER_API_KEY?.trim() || "";
}

function getDirectVerifierGatewayId() {
  return process.env.DIRECT_VERIFIER_GATEWAY_ID?.trim() || "";
}

function normalizeVerifierPhone(phone: string) {
  return normalizePhone(phone).replace(/^\+/, "");
}

async function parseDirectVerifierResponse(response: Response) {
  const payload = (await response.json().catch(() => null)) as DirectVerifierResponse | null;

  if (!response.ok) {
    if (payload?.error?.code) {
      throw new Error(`direct_verifier_${payload.error.code}`);
    }

    throw new Error("sms_gateway_unavailable");
  }

  if (!payload) {
    throw new Error("sms_invalid_response");
  }

  if (payload.error?.code) {
    throw new Error(`direct_verifier_${payload.error.code}`);
  }

  return payload;
}

export function isSmsConfigured() {
  return Boolean(getDirectVerifierApiKey() && getDirectVerifierGatewayId());
}

export async function sendVerificationCode({ phone }: SendVerificationCodeInput) {
  const apiKey = getDirectVerifierApiKey();
  const gatewayId = getDirectVerifierGatewayId();

  if (!apiKey || !gatewayId) {
    throw new Error("sms_not_configured");
  }

  const normalizedPhone = normalizeVerifierPhone(phone);

  const response = await fetch(DIRECT_VERIFIER_SEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      channelType: "SMS",
      destination: normalizedPhone,
      gatewayId,
    }),
    cache: "no-store",
  });

  const payload = await parseDirectVerifierResponse(response);

  if (!payload.uuid) {
    throw new Error("sms_send_failed");
  }

  return {
    phone: normalizedPhone,
    uuid: payload.uuid,
  };
}

export async function checkVerificationCode({ uuid, code }: CheckVerificationCodeInput) {
  const apiKey = getDirectVerifierApiKey();

  if (!apiKey) {
    throw new Error("sms_not_configured");
  }

  const normalizedCode = String(code).replace(/\D/g, "").slice(0, 6);

  const response = await fetch(DIRECT_VERIFIER_CHECK_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      uuid,
      code: normalizedCode,
    }),
    cache: "no-store",
  });

  await parseDirectVerifierResponse(response);

  return { ok: true };
}
