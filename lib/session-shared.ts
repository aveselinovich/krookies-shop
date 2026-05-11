export const SESSION_COOKIE_NAME = "krookies_session";

export type SessionPayload = {
  userId: string;
  role: "customer" | "admin";
};

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  if (typeof atob === "function") {
    return decodeURIComponent(
      Array.from(atob(padded))
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join("")
    );
  }
  return Buffer.from(value, "base64url").toString("utf8");
}

function base64UrlEncodeBytes(bytes: Uint8Array) {
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  const base64 =
    typeof btoa === "function"
      ? btoa(binary)
      : Buffer.from(bytes).toString("base64");

  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function signPayloadForVerification(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return base64UrlEncodeBytes(new Uint8Array(signature));
}

export function decodeSessionTokenWithoutVerification(token: string): SessionPayload | null {
  const [encodedPayload] = token.split(".");
  if (!encodedPayload) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionPayload;
    if (!payload.userId || !payload.role) return null;
    return { userId: payload.userId, role: payload.role };
  } catch {
    return null;
  }
}

export async function verifySessionToken(token: string, secret?: string): Promise<SessionPayload | null> {
  const [encodedPayload, signature] = token.split(".");
  const authSecret = secret || process.env.AUTH_SECRET || "";

  if (!encodedPayload || !signature || !authSecret) {
    return null;
  }

  try {
    const expectedSignature = await signPayloadForVerification(encodedPayload, authSecret);

    if (signature !== expectedSignature) {
      return null;
    }

    return decodeSessionTokenWithoutVerification(token);
  } catch {
    return null;
  }
}
