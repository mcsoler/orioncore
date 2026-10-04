import { describe, expect, it } from 'vitest';
import { GtmAnalyticsTracker } from '../../../src/infrastructure/analytics/GtmAnalyticsTracker';
import { NoopAnalyticsTracker } from '../../../src/infrastructure/analytics/NoopAnalyticsTracker';

describe('GtmAnalyticsTracker', () => {
  it('envía el evento al dataLayer de Google Tag Manager', () => {
    const dataLayer: unknown[] = [];
    new GtmAnalyticsTracker(dataLayer).track({ name: 'generate_lead', params: { services: 'a,b' } });
    expect(dataLayer).toEqual([{ event: 'generate_lead', services: 'a,b' }]);
  });
});

describe('NoopAnalyticsTracker (Null Object)', () => {
  it('acepta eventos sin hacer nada ni fallar', () => {
    expect(() => new NoopAnalyticsTracker().track({ name: 'x', params: {} })).not.toThrow();
  });
});
