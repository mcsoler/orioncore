import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import type { LeadField, LeadRequest } from '../../application/dto/LeadRequest';
import type { SubmitLeadUseCase } from '../../application/ports/in/SubmitLeadUseCase';
import { STEP_FIELDS, validateLead } from '../../application/use-cases/validateLead';
import { interactiveUseCases } from '../../composition/interactive';

export interface LeadFormProps {
  /** Opciones de "¿Qué quieres mejorar primero?". */
  options: { value: string; label: string }[];
  privacyHref: string;
  /** Inyectable para pruebas; por defecto, el caso de uso SubmitLead. */
  submitLead?: SubmitLeadUseCase;
}

type Errors = Partial<Record<LeadField, string>>;

const EMPTY: LeadRequest = { name: '', whatsapp: '', email: '', company: '', services: [], message: '', consent: false };
const inputClass =
  'w-full rounded-[10px] border border-line bg-navy min-h-[46px] px-3.5 text-[15px] text-white placeholder:text-white/50 focus:border-brand-cyan focus:outline-none aria-[invalid=true]:border-danger';

/** Formulario de diagnóstico en 2 pasos (referencia del home): primero lo esencial, después el correo. */
export default function LeadForm({ options, privacyHref, submitLead }: LeadFormProps) {
  const id = useId();
  const [step, setStep] = useState<1 | 2>(1);
  const [values, setValues] = useState<LeadRequest>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const stepHeading = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    stepHeading.current?.focus();
  }, [step]);

  const set = <K extends keyof LeadRequest>(key: K, value: LeadRequest[K]) => setValues((v) => ({ ...v, [key]: value }));
  const fieldId = (field: LeadField) => `${id}-${field}`;
  const errorId = (field: LeadField) => `${id}-${field}-error`;
  const a11y = (field: LeadField) => ({
    id: fieldId(field),
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? errorId(field) : undefined,
  });

  function continueToEmail(event: FormEvent) {
    event.preventDefault();
    // El correo se pide en el paso 2: aquí solo cuentan los errores del paso 1
    const { errors: all } = validateLead({ ...values, email: 'paso1@orioncore.co' });
    const stepErrors = Object.fromEntries(STEP_FIELDS[0].filter((f) => all[f]).map((f) => [f, all[f]]));
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0) setStep(2);
  }

  async function send(event: FormEvent) {
    event.preventDefault();
    setStatus('sending');
    const result = await (submitLead ?? interactiveUseCases().submitLead).execute(values);
    if (result.ok) {
      setStatus('sent');
      return;
    }
    setStatus('idle');
    setErrors(result.errors);
    if (STEP_FIELDS[0].some((f) => result.errors[f])) setStep(1);
  }

  if (status === 'sent') {
    return (
      <div role="status" className="card bg-navy p-7 text-center">
        <p className="font-poppins text-2xl font-bold mb-2">¡Listo, {values.name.split(' ')[0]}!</p>
        <p className="text-white/70">Recibimos tu solicitud. Te contactaremos en menos de 24 horas por WhatsApp o correo.</p>
      </div>
    );
  }

  const toggle = (value: string, checked: boolean) =>
    set('services', checked ? [...values.services, value] : values.services.filter((s) => s !== value));
  const progress = step === 1 ? 50 : 100;

  return (
    <form noValidate onSubmit={step === 1 ? continueToEmail : send} className="card bg-navy p-7 flex flex-col gap-4" aria-labelledby={`${id}-heading`}>
      <div className="flex justify-between text-[13px] text-white/70">
        <span>Paso {step} de 2</span>
        <span>Toma 30 segundos</span>
      </div>
      <div
        role="progressbar"
        aria-label="Avance del formulario"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        className="h-1.5 rounded-full bg-surface-2"
      >
        <div className="h-full rounded-full bg-brand-blue transition-all" style={{ width: `${progress}%` }} />
      </div>
      <h3 id={`${id}-heading`} ref={stepHeading} tabIndex={-1} className="sr-only focus:not-sr-only focus:outline-none font-poppins font-semibold">
        {step === 1 ? 'Reserva tu diagnóstico' : '¿A qué correo te enviamos el diagnóstico?'}
      </h3>

      {step === 1 ? (
        <>
          <fieldset aria-describedby={errors.services ? errorId('services') : undefined}>
            <legend className="font-semibold mb-2.5">¿Qué quieres mejorar primero?</legend>
            <div className="flex flex-wrap gap-2">
              {options.map((option) => (
                <label key={option.value} className="chip min-h-11 cursor-pointer has-[:checked]:border-brand-cyan has-[:checked]:text-white">
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={values.services.includes(option.value)}
                    onChange={(e) => toggle(option.value, e.target.checked)}
                    className="accent-brand-blue"
                  />
                  {option.label}
                </label>
              ))}
            </div>
            {errors.services && <ErrorText id={errorId('services')}>{errors.services}</ErrorText>}
          </fieldset>
          <Field label="Nombre" htmlFor={fieldId('name')} error={errors.name} errorId={errorId('name')}>
            <input {...a11y('name')} type="text" autoComplete="name" placeholder="Tu nombre" value={values.name} onChange={(e) => set('name', e.target.value)} className={inputClass} />
          </Field>
          <Field label="WhatsApp" htmlFor={fieldId('whatsapp')} error={errors.whatsapp} errorId={errorId('whatsapp')}>
            <input {...a11y('whatsapp')} type="tel" inputMode="tel" autoComplete="tel" placeholder="+57 300 000 0000" value={values.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} className={inputClass} />
          </Field>
          <button type="submit" className="btn-primary w-full min-h-[54px]">
            Reservar mi cupo gratis →
          </button>
          <div>
            <label className="flex gap-2 text-[13px] text-white/70">
              <input
                type="checkbox"
                {...a11y('consent')}
                checked={values.consent}
                onChange={(e) => set('consent', e.target.checked)}
                className="accent-brand-blue mt-0.5 shrink-0"
              />
              <span>
                Acepto la{' '}
                <a href={privacyHref} className="text-brand-cyan underline underline-offset-2">
                  política de tratamiento de datos
                </a>{' '}
                (Ley 1581).
              </span>
            </label>
            {errors.consent && <ErrorText id={errorId('consent')}>{errors.consent}</ErrorText>}
          </div>
        </>
      ) : (
        <>
          <Field label="Correo electrónico" htmlFor={fieldId('email')} error={errors.email} errorId={errorId('email')}>
            <input {...a11y('email')} type="email" autoComplete="email" placeholder="nombre@empresa.com" value={values.email} onChange={(e) => set('email', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Empresa (opcional)" htmlFor={fieldId('company')}>
            <input id={fieldId('company')} type="text" autoComplete="organization" value={values.company} onChange={(e) => set('company', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Cuéntanos tu reto (opcional)" htmlFor={fieldId('message')}>
            <textarea id={fieldId('message')} rows={3} value={values.message} onChange={(e) => set('message', e.target.value)} className={`${inputClass} py-3`} />
          </Field>
          {errors.form && (
            <p role="alert" className="rounded-[10px] bg-danger/15 px-4 py-3 text-sm text-danger">
              {errors.form}
            </p>
          )}
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <button type="button" onClick={() => setStep(1)} className="btn-ghost">
              Atrás
            </button>
            <button type="submit" disabled={status === 'sending'} aria-busy={status === 'sending'} className="btn-primary flex-1">
              {status === 'sending' ? 'Enviando…' : 'Enviar solicitud'}
            </button>
          </div>
        </>
      )}
    </form>
  );
}

function Field({ label, htmlFor, error, errorId, children }: { label: string; htmlFor: string; error?: string; errorId?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm text-white/70">
        {label}
      </label>
      {children}
      {error && errorId && <ErrorText id={errorId}>{error}</ErrorText>}
    </div>
  );
}

function ErrorText({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-1 text-sm text-danger">
      {children}
    </p>
  );
}
