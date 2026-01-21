import { DateTime } from "luxon";

export function toUtcTimestamp(date, time, timezone) {
  const dt = DateTime.fromISO(
    `${date}T${time}`,
    { zone: timezone }
  );

  if (!dt.isValid) return null;

  return dt.toUTC().toMillis();
}
