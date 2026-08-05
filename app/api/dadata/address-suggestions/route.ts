import { NextRequest, NextResponse } from "next/server";
import { fetchDadataAddressSuggestions } from "@/lib/dadata-address";
import { assertRateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const query = typeof body?.query === "string" ? body.query.trim() : "";

  try {
    assertRateLimit(`dadata:${getClientIp(request)}`, 60, 60_000);
    const result = await fetchDadataAddressSuggestions(query, 6);
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("POST /api/dadata/address-suggestions error:", error);

    return NextResponse.json(
      { enabled: true, suggestions: [], error: "dadata_request_failed" },
      {
        status: error instanceof Error && error.message === "rate_limit_exceeded" ? 429 : 502,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  }
}
