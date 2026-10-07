import type { AnalyticsEvent, AnalyticsTracker } from '../../application/ports/out/AnalyticsTracker';

/** Null Object: se usa mientras no haya un ID de GTM configurado. */
export class NoopAnalyticsTracker implements AnalyticsTracker {
  track(_event: AnalyticsEvent): void {}
}
