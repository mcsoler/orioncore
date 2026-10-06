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

  return (
    <div className="card p-7 flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-hours`} className="text-[15px]">
          Horas a la semana en tareas repetitivas: <strong className="block text-xl">{hours} h</strong>
        </label>
        <input
          id={`${id}-hours`}
          type="range"
          min={MIN_HOURS_PER_WEEK}
          max={MAX_HOURS_PER_WEEK}
          step={1}
          value={hours}
          aria-valuetext={`${hours} horas por semana`}
          onChange={(e) => setHours(Number(e.target.value))}
          className="w-full accent-brand-blue cursor-pointer"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-cost`} className="text-[15px]">
          Costo por hora de tu equipo (COP): <strong className="block text-xl">{copFormat.format(cost)}</strong>
        </label>
        <input
          id={`${id}-cost`}
          type="range"
          min={costPerHour.min}
          max={costPerHour.max}
          step={costPerHour.step}
          value={cost}
          aria-valuetext={`${copFormat.format(cost)} por hora`}
          onChange={(e) => setCost(Number(e.target.value))}
          className="w-full accent-brand-blue cursor-pointer"
        />
      </div>

      <div className="rounded-[14px] bg-navy border border-danger p-5" aria-live="polite">
        {result.ok ? (
          <>
            <p className="text-sm text-white/70">Estás perdiendo aproximadamente</p>
            <p className="font-poppins text-4xl md:text-[44px] font-bold text-danger">
              <span data-testid="annual-loss">{result.annualLoss}</span>{' '}
              <span className="text-lg text-white/70 font-normal">al año</span>
            </p>
            <p className="text-sm text-white/70">
              <span data-testid="monthly-loss">{result.monthlyLoss}</span> al mes ·{' '}
              <span data-testid="hours-per-year">{result.hoursPerYear}</span> horas al año
            </p>
          </>
        ) : (
          <p role="alert">{Object.values(result.errors).join(' ')}</p>
        )}
      </div>

      <a href={cta.href} className="btn-primary">
        {cta.label}
      </a>
    </div>
  );
}
