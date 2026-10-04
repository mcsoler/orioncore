export interface AnalyticsEvent {
  name: string;
  params: Record<string, string | number>;
}

/** Puerto de salida: registro de eventos de analítica. */
export interface AnalyticsTracker {
  track(event: AnalyticsEvent): void;
}
