const DELIVERY_TIME_ZONE = "Europe/Moscow";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function getTimeZoneDateParts(date: Date, timeZone = DELIVERY_TIME_ZONE) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);
  return { year, month, day };
}

function formatUtcDateValue(date: Date) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function addDaysToDateValue(dateValue: string, days: number) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return formatUtcDateValue(date);
}

export function getTodayDateValue(date = new Date()) {
  const parts = getTimeZoneDateParts(date);
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
}

export function getMinimumDeliveryDateValue(date = new Date()) {
  return addDaysToDateValue(getTodayDateValue(date), 2);
}

export function isDeliveryDateTooEarly(dateValue?: string, date = new Date()) {
  if (!dateValue) return false;
  return dateValue < getMinimumDeliveryDateValue(date);
}

export function formatDeliveryDateLabel(dateValue: string) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function getMonthTitle(year: number, monthIndex: number) {
  const date = new Date(Date.UTC(year, monthIndex, 1));
  return new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function getDateValue(year: number, monthIndex: number, day: number) {
  return `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
}
