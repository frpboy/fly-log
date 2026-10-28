import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";

type WebVitalMetric = {
  name: string;
  value: number;
  delta: number;
  rating?: string;
};

type AnalyticsWindow = Window & {
  gtag?: (
    command: "event",
    eventName: string,
    parameters: Record<string, string | number | boolean>,
  ) => void;
};

/**
 * Send aggregate Core Web Vitals and supporting timing metrics to the GA4
 * property already configured by index.html. Do not attach route query
 * strings, flight records, user IDs, airport codes, or other application data.
 */
export function reportWebVital(metric: WebVitalMetric): void {
  if (typeof window === "undefined") return;
  const gtag = (window as AnalyticsWindow).gtag;
  if (typeof gtag !== "function") return;

  const value =
    metric.name === "CLS" ? Math.round(metric.value * 1000) : Math.round(metric.value);
  gtag("event", "web_vital", {
    metric_name: metric.name,
    value,
    metric_value: metric.value,
    metric_delta: metric.delta,
    metric_rating: metric.rating ?? "unknown",
    non_interaction: true,
  });
}

/** Initialize one set of field measurements per app page load. */
export function initializeWebVitals(): void {
  if (typeof window === "undefined") return;
  onCLS(reportWebVital);
  onINP(reportWebVital);
  onLCP(reportWebVital);
  onFCP(reportWebVital);
  onTTFB(reportWebVital);
}
