import { describe, expect, it } from "vitest";
import {
  buildFlightExportRecords,
  flightExportToCsv,
  flightExportToJson,
  FLIGHT_EXPORT_FIELDS,
} from "./flightExport";

describe("flight export", () => {
  it("exports the stored flight fields and preserves calendar days", () => {
    const record = {
      departure_date: "2026-07-10",
      departure_time: "09:00",
      arrival_date: "2026-07-11",
      arrival_time: "05:40",
      departure_airport_iata: "SYD",
      arrival_airport_iata: "SIN",
      airline_iata: "QF",
      flight_number: "123",
      cabin_class: "business",
      aircraft_type_name: "Airbus A380",
      distance_km: 6300,
      departure_country: "AU",
    };

    expect(buildFlightExportRecords([record])).toEqual([
      {
        departure_date: "2026-07-10",
        departure_time: "09:00",
        arrival_date: "2026-07-11",
        arrival_time: "05:40",
        departure_airport_iata: "SYD",
        arrival_airport_iata: "SIN",
        airline_iata: "QF",
        flight_number: "123",
        cabin_class: "business",
        aircraft_type_name: "Airbus A380",
      },
    ]);
    expect(FLIGHT_EXPORT_FIELDS).not.toContain("distance_km");
  });

  it("returns empty exports for missing data", () => {
    expect(buildFlightExportRecords(undefined)).toEqual([]);
    expect(JSON.parse(flightExportToJson(null))).toEqual([]);
    expect(flightExportToCsv([]).split("\r\n")).toHaveLength(1);
  });

  it("quotes commas, newlines and quotes in CSV fields", () => {
    const csv = flightExportToCsv([
      {
        departure_date: "2026-07-10",
        departure_airport_iata: "SYD",
        arrival_airport_iata: "SIN",
        airline_iata: "QF",
        aircraft_type_name: 'Test "Long, Model"\nSeries',
      },
    ]);
    expect(csv).toContain('"Test ""Long, Model""\nSeries"');
  });

  it("neutralizes spreadsheet formula cells", () => {
    const csv = flightExportToCsv([
      {
        departure_date: "2026-07-10",
        departure_airport_iata: "SYD",
        arrival_airport_iata: "SIN",
        airline_iata: "=IMPORTXML(A1)",
      },
    ]);
    expect(csv).toContain('"\'=IMPORTXML(A1)"');
  });
});
