type ParsedDeliveryAddress = {
  city: string;
  street: string;
  house: string;
};

function cleanupPart(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function looksLikeCity(value: string) {
  return /(москва|московская область|московская обл\.?)/i.test(value);
}

function looksLikeHouse(value: string) {
  return /(дом|д\.|корп|к\.|стр\.|строение|\d)/i.test(value);
}

function normalizeHouse(value: string) {
  return cleanupPart(value).replace(/^дом\s*/i, "");
}

export function parseDeliveryAddress(addressLine: string): ParsedDeliveryAddress | null {
  const normalizedLine = cleanupPart(addressLine);
  if (!normalizedLine) return null;

  const parts = normalizedLine
    .split(",")
    .map(cleanupPart)
    .filter(Boolean);

  let city = "Москва";
  let street = "";
  let house = "";

  if (parts.length >= 2) {
    const mutableParts = [...parts];

    if (looksLikeCity(mutableParts[0])) {
      city = mutableParts.shift() || city;
    }

    const lastPart = mutableParts[mutableParts.length - 1];
    if (lastPart && looksLikeHouse(lastPart)) {
      house = normalizeHouse(mutableParts.pop() || "");
    }

    street = cleanupPart(mutableParts.join(", "));
  }

  if (!street || !house) {
    const compactLine = looksLikeCity(parts[0] || "") ? cleanupPart(parts.slice(1).join(", ")) : normalizedLine;
    const match = compactLine.match(/^(.*?)[,\s]+(\d+[а-яa-z0-9\/-]*)$/i);

    if (match) {
      street = street || cleanupPart(match[1]);
      house = house || normalizeHouse(match[2]);
    }
  }

  if (!street || !house) {
    return null;
  }

  return {
    city,
    street,
    house,
  };
}
