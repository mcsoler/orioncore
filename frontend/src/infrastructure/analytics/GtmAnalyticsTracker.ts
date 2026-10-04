import type { AnalyticsEvent, AnalyticsTracker } from '../../application/ports/out/AnalyticsTracker';

/** Adapter para Google Tag Manager: empuja eventos a `window.dataLayer`. */
export class GtmAnalyticsTracker implements AnalyticsTracker {
  constructor(private readonly dataLayer: unknown[]) {}

  track(event: AnalyticsEvent): void {
    this.dataLayer.push({ event: event.name, ...event.params });
  }
}
