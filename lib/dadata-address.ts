import { AddressSuggestion } from "@/types/dadata";

const DADATA_ADDRESS_URL = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address";
const DELIVERY_AREA_LOCATIONS = [{ region: "Москва" }, { region: "Московская" }] as const;

type DadataAddressSuggestion = {
  value: string;
  unrestricted_value: string;
  data?: {
    region?: string | null;
    city?: string | null;
    settlement?: string | null;
    street_with_type?: string | null;
    house?: string | null;
    block_type?: string | null;
    block?: string | null;
    flat?: string | null;
  } | null;
};

type DadataAddressResponse = {
  suggestions?: DadataAddressSuggestion[];
};

type DadataRequestLocation = {
  region?: string;
  city?: string;
  settlement?: string;
};

function cleanup(value?: string | null) {
  return value?.replace(/\s+/g, " ").trim() || "";
}

function normalizeForCompare(value?: string | null) {
  return cleanup(value).toLowerCase().replace(/ё/g, "е");
}

function formatHouse(suggestion: DadataAddressSuggestion) {
  const house = cleanup(suggestion.data?.house);
  const block = cleanup(suggestion.data?.block);
  const blockType = cleanup(suggestion.data?.block_type);

  if (!house) return "";
  if (!block) return house;
  if (!blockType) return `${house} ${block}`;

  return `${house} ${blockType} ${block}`;
}

export function isMoscowDeliveryArea(region?: string | null, city?: string | null) {
  const normalizedRegion = normalizeForCompare(region);
  const normalizedCity = normalizeForCompare(city);

  return (
    normalizedRegion === "москва" ||
    normalizedRegion === "московская" ||
    normalizedRegion === "московская область" ||
    normalizedRegion === "московская обл" ||
    normalizedCity === "москва"
  );
}

function uniqueByUnrestrictedValue(suggestions: AddressSuggestion[]) {
  const seen = new Set<string>();

  return suggestions.filter((suggestion) => {
    const key = suggestion.unrestrictedValue || suggestion.value;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mapSuggestion(suggestion: DadataAddressSuggestion): AddressSuggestion | null {
  const street = cleanup(suggestion.data?.street_with_type);
  const house = formatHouse(suggestion);
  const region = cleanup(suggestion.data?.region);
  const city = cleanup(suggestion.data?.city) || cleanup(suggestion.data?.settlement) || region || "Москва";

  if (!suggestion.value || !street) {
    return null;
  }

  return {
    value: cleanup(suggestion.value),
    unrestrictedValue: cleanup(suggestion.unrestricted_value),
    region,
    city,
    street,
    house,
    flat: cleanup(suggestion.data?.flat) || undefined,
    isDeliveryArea: isMoscowDeliveryArea(region, city),
  };
}

async function requestDadataAddressSuggestions(
  query: string,
  count: number,
  options?: {
    locations?: readonly DadataRequestLocation[];
    locationsBoost?: readonly DadataRequestLocation[];
  },
) {
  const token = process.env.DADATA_API_KEY?.trim();
  const normalizedQuery = query.trim();

  if (!token) {
    return { enabled: false, suggestions: [] as AddressSuggestion[] };
  }

  if (normalizedQuery.length < 3) {
    return { enabled: true, suggestions: [] as AddressSuggestion[] };
  }

  const response = await fetch(DADATA_ADDRESS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify({
      query: normalizedQuery,
      count,
      ...(options?.locations?.length ? { locations: options.locations } : {}),
      ...(options?.locationsBoost?.length ? { locations_boost: options.locationsBoost } : {}),
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await response.text();
    console.error("Dadata address upstream error:", response.status, details);
    throw new Error("dadata_request_failed");
  }

  const result = (await response.json()) as DadataAddressResponse;
  const suggestions =
    result.suggestions
      ?.map(mapSuggestion)
      .filter((suggestion): suggestion is AddressSuggestion => Boolean(suggestion))
      .slice(0, count) || [];

  return { enabled: true, suggestions };
}

export async function fetchDadataAddressSuggestions(query: string, count = 6) {
  const preferred = await requestDadataAddressSuggestions(query, count, {
    locations: DELIVERY_AREA_LOCATIONS,
  });

  if (preferred.suggestions.length >= count) {
    return {
      enabled: true,
      suggestions: preferred.suggestions.slice(0, count),
    };
  }

  const general = await requestDadataAddressSuggestions(query, Math.max(count, 10), {
    locationsBoost: DELIVERY_AREA_LOCATIONS,
  });

  return {
    enabled: true,
    suggestions: uniqueByUnrestrictedValue([...preferred.suggestions, ...general.suggestions]).slice(0, count),
  };
}

export async function findBestDadataAddressSuggestion(query: string) {
  const result = await requestDadataAddressSuggestions(query, 1, {
    locationsBoost: DELIVERY_AREA_LOCATIONS,
  });
  return result.suggestions[0] || null;
}
