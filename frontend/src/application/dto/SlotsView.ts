export interface SlotsView {
  remaining: number;
  taken: number;
  total: number;
  /** Porcentaje de cupos tomados (0–100). */
  progress: number;
}
