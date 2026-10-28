import { beforeEach, describe, expect, it, vi } from "vitest";

const webVitalsMocks = vi.hoisted(() => ({
  onCLS: vi.fn(),
  onFCP: vi.fn(),
  onINP: vi.fn(),
  onLCP: vi.fn(),
  onTTFB: vi.fn(),
}));

vi.mock("web-vitals", () => webVitalsMocks);

import {
  initializeWebVitals,
  reportWebVital,
} from "./webVitals";

describe("real-user web vital reporting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (window as Window & { gtag?: unknown }).gtag = vi.fn();
  });

  it("registers core and supporting performance metrics", () => {
    initializeWebVitals();
    expect(webVitalsMocks.onCLS).toHaveBeenCalledWith(reportWebVital);
    expect(webVitalsMocks.onINP).toHaveBeenCalledWith(reportWebVital);
    expect(webVitalsMocks.onLCP).toHaveBeenCalledWith(reportWebVital);
    expect(webVitalsMocks.onFCP).toHaveBeenCalledWith(reportWebVital);
    expect(webVitalsMocks.onTTFB).toHaveBeenCalledWith(reportWebVital);
  });

  it("sends aggregate metric values without flight or account data", () => {
    const gtag = (window as Window & { gtag: ReturnType<typeof vi.fn> }).gtag;
    reportWebVital({
      name: "CLS",
      value: 0.124,
      delta: 0.124,
      rating: "needs-improvement",
    });

    expect(gtag).toHaveBeenCalledWith(
      "event",
      "web_vital",
      expect.objectContaining({
        metric_name: "CLS",
        value: 124,
        metric_value: 0.124,
        metric_delta: 0.124,
        metric_rating: "needs-improvement",
        non_interaction: true,
      }),
    );
    const parameters = gtag.mock.calls[0]?.[2] as Record<string, unknown>;
    expect(parameters).not.toHaveProperty("uid");
    expect(parameters).not.toHaveProperty("flight_number");
    expect(parameters).not.toHaveProperty("departure_airport_iata");
    expect(parameters).not.toHaveProperty("page_path");
  });

  it("does not throw when analytics is unavailable", () => {
    delete (window as Window & { gtag?: unknown }).gtag;
    expect(() =>
      reportWebVital({
        name: "LCP",
        value: 2100,
        delta: 2100,
        rating: "needs-improvement",
      }),
    ).not.toThrow();
  });
});
