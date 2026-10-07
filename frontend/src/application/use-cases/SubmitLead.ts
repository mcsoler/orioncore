import type { LeadRequest, SubmitLeadResult } from '../dto/LeadRequest';
import type { SubmitLeadUseCase } from '../ports/in/SubmitLeadUseCase';
import type { AnalyticsTracker } from '../ports/out/AnalyticsTracker';
import { LeadGatewayError, type LeadGateway } from '../ports/out/LeadGateway';
import { MESSAGES, validateLead } from './validateLead';

export { MESSAGES };

export class SubmitLead implements SubmitLeadUseCase {
  constructor(
    private readonly gateway: LeadGateway,
    private readonly analytics: AnalyticsTracker,
  ) {}

  async execute(request: LeadRequest): Promise<SubmitLeadResult> {
    const { errors, lead } = validateLead(request);
    if (!lead) return { ok: false, errors };

    try {
      await this.gateway.submit(lead);
    } catch (error) {
      if (!(error instanceof LeadGatewayError)) throw error;
      this.analytics.track({ name: 'lead_submit_error', params: {} });
      return { ok: false, errors: { form: MESSAGES.form } };
    }

    this.analytics.track({ name: 'generate_lead', params: { services: lead.services.join(',') } });
    return { ok: true };
  }
}
