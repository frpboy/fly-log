import { toCalendarDay } from "./dateUtils";

export const FLIGHT_EXPORT_FIELDS = [
  "departure_date",
  "departure_time",
  "arrival_date",
  "arrival_time",
  "departure_airport_iata",
  "arrival_airport_iata",
  "airline_iata",
  "flight_number",
  "cabin_class",
  "aircraft_type_name",
] as const;

export type FlightExportField = (typeof FLIGHT_EXPORT_FIELDS)[number];
export type FlightExportRecord = Record<FlightExportField, string>;
export type FlightExportFormat = "csv" | "json";
export type FlightExportScope = "all" | "filtered";

type FlightLike = Partial<Record<FlightExportField, unknown>> & {
  departure_date?: unknown;
  arrival_date?: unknown;
};

const textValue = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
};

const dateValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "";
  return toCalendarDay(value) ?? textValue(value);
};

/** Export only stored flight fields, not client-side enrichment or private account data. */
export function buildFlightExportRecords(
  flights: readonly FlightLike[] | null | undefined,
): FlightExportRecord[] {
  if (!Array.isArray(flights)) return [];
  return flights.map((flight) => ({
    departure_date: dateValue(flight.departure_date),
    departure_time: textValue(flight.departure_time),
    arrival_date: dateValue(flight.arrival_date),
    arrival_time: textValue(flight.arrival_time),
    departure_airport_iata: textValue(flight.departure_airport_iata),
    arrival_airport_iata: textValue(flight.arrival_airport_iata),
    airline_iata: textValue(flight.airline_iata),
    flight_number: textValue(flight.flight_number),
    cabin_class: textValue(flight.cabin_class),
    aircraft_type_name: textValue(flight.aircraft_type_name),
  }));
}

const csvCell = (value: string): string => {
  // Prefix spreadsheet formula-like values so opening a CSV cannot execute them.
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
};

export function flightExportToCsv(
  flights: readonly FlightLike[] | null | undefined,
): string {
  const records = buildFlightExportRecords(flights);
  const header = FLIGHT_EXPORT_FIELDS.map(csvCell).join(",");
  const rows = records.map((record) =>
    FLIGHT_EXPORT_FIELDS.map((field) => csvCell(record[field])).join(","),
  );
  return [header, ...rows].join("\r\n");
}

export function flightExportToJson(
  flights: readonly FlightLike[] | null | undefined,
): string {
  return JSON.stringify(buildFlightExportRecords(flights), null, 2);
}

export function downloadFlightExport(
  flights: readonly FlightLike[] | null | undefined,
  format: FlightExportFormat,
  scope: FlightExportScope,
): void {
  const content =
    format === "csv" ? flightExportToCsv(flights) : flightExportToJson(flights);
  const mime =
    format === "csv" ? "text/csv;charset=utf-8" : "application/json;charset=utf-8";
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);

  anchor.href = url;
  anchor.download = `fly-log-${scope}-flights-${date}.${format}`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
