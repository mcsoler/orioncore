import type { LossRequest, LossResult } from '../../dto/LossResult';

export interface CalculateLossUseCase {
  execute(request: LossRequest): LossResult;
}
