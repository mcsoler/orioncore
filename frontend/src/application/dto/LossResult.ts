export interface LossRequest {
  hoursPerWeek: number;
  costPerHour: number;
}

export type LossResult =
  | { ok: true; monthlyLoss: string; annualLoss: string; hoursPerYear: string }
  | { ok: false; errors: Partial<Record<keyof LossRequest, string>> };
