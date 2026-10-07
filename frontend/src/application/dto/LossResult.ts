export interface LossRequest {
  hoursPerWeek: number;
  costPerHour: number;
}

export type LossResult =
  | { ok: true; weeklyLoss: string; monthlyLoss: string; annualLoss: string }
  | { ok: false; errors: Partial<Record<keyof LossRequest, string>> };
