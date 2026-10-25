import { parseIsoDate } from "@/lib/home/store";

/** The app stores plain calendar dates; the MCP server reads "today" in the owner's time zone. */
export const MCP_TIME_ZONE = process.env.PROGRESS_PAD_TIME_ZONE || "Europe/London";

export function todayIso(timeZone = MCP_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function resolveDate(value: string | undefined) {
  if (!value || value === "today") {
    return todayIso();
  }

  if (value === "yesterday") {
    return addDays(todayIso(), -1);
  }

  if (!parseIsoDate(value)) {
    throw new Error(`"${value}" is not a date. Use YYYY-MM-DD, "today" or "yesterday".`);
  }

  return value.slice(0, 10);
}

export function addDays(isoDate: string, days: number) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
