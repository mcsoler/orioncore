import type { LeadRequest, SubmitLeadResult } from '../../dto/LeadRequest';

export interface SubmitLeadUseCase {
  execute(request: LeadRequest): Promise<SubmitLeadResult>;
}
