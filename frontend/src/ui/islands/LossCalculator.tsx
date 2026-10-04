import { useId, useMemo, useState } from 'react';
import type { LossRequest, LossResult } from '../../application/dto/LossResult';
import { interactiveUseCases } from '../../composition/interactive';
import { MAX_HOURS_PER_WEEK, MIN_HOURS_PER_WEEK } from '../../domain/value-objects/Hours';
import { copFormat } from '../../domain/value-objects/Money';

export interface LossCalculatorProps {
  defaultHours: number;
  costPerHour: { default: number; min: number; max: number; step: number };
  cta: { label: string; href: string };
  /** Inyectable para pruebas; por defecto, el caso de uso CalculateLoss. */
  calculate?: (request: LossRequest) => LossResult;
}

const defaultCalculate = (request: LossRequest) => interactiveUseCases().calculateLoss.execute(request);

export default function LossCalculator({ defaultHours, costPerHour, cta, calculate = defaultCalculate }: LossCalculatorProps) {
  const id = useId();
  const [hours, setHours] = useState(defaultHours);
  const [cost, setCost] = useState(costPerHour.default);
  const result = useMemo(() => calculate({ hoursPerWeek: hours, costPerHour: cost }), [calculate, hours, cost]);

  const hoursText = `${hours} horas por semana`;
  const costText = `${copFormat.format(cost)} por hora`;

  return (
    <div className="grid gap-8 lg:grid-cols-2 items-stretch">
      <div className="rounded-2xl bg-white border border-ink/10 p-6 md:p-8 space-y-8">
        <div>
          <div className="flex items-baseline justify-between gap-4 mb-3">
            <label htmlFor={`${id}-hours`} className="font-semibold text-ink">
              Horas por semana en tareas manuales
            </label>
            <span className="font-poppins font-bold text-brand-blue text-lg" aria-hidden="true">
              {hours} h
            </span>
          </div>
          <input
            id={`${id}-hours`}
            type="range"
            min={MIN_HOURS_PER_WEEK}
            max={MAX_HOURS_PER_WEEK}
            step={1}
            value={hours}
            aria-valuetext={hoursText}
            onChange={(e) => setHours(Number(e.target.value))}
            className="w-full accent-brand-blue h-2 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-4 mb-3">
            <label htmlFor={`${id}-cost`} className="font-semibold text-ink">
              Costo por hora de tu equipo
            </label>
            <span className="font-poppins font-bold text-brand-blue text-lg" aria-hidden="true">
              {copFormat.format(cost)}
            </span>
          </div>
          <input
            id={`${id}-cost`}
            type="range"
            min={costPerHour.min}
            max={costPerHour.max}
            step={costPerHour.step}
            value={cost}
            aria-valuetext={costText}
            onChange={(e) => setCost(Number(e.target.value))}
            className="w-full accent-brand-blue h-2 cursor-pointer"
          />
        </div>
      </div>

      <div className="rounded-2xl bg-navy p-6 md:p-8 flex flex-col justify-between gap-6" aria-live="polite">
        {result.ok ? (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-5">
            <div className="col-span-2">
              <dt className="text-sm text-white/75">Pierdes cada mes</dt>
              <dd className="font-poppins font-extrabold text-4xl md:text-5xl text-white" data-testid="monthly-loss">
                {result.monthlyLoss}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-white/75">Al año</dt>
              <dd className="font-poppins font-bold text-2xl text-secondary" data-testid="annual-loss">
                {result.annualLoss}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-white/75">Horas al año</dt>
              <dd className="font-poppins font-bold text-2xl text-secondary" data-testid="hours-per-year">
                {result.hoursPerYear}
              </dd>
            </div>
          </dl>
        ) : (
          <p role="alert" className="text-white">
            {Object.values(result.errors).join(' ')}
          </p>
        )}
        <a href={cta.href} className="btn-primary text-center">
          {cta.label}
        </a>
      </div>
    </div>
  );
}
