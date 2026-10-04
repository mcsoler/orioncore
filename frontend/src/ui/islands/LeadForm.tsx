import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import type { LeadField, LeadRequest } from '../../application/dto/LeadRequest';
import type { SubmitLeadUseCase } from '../../application/ports/in/SubmitLeadUseCase';
import { CONTACT_FIELDS, validateLead } from '../../application/use-cases/validateLead';
import { interactiveUseCases } from '../../composition/interactive';

export interface LeadFormProps {
  services: { value: string; label: string }[];
  privacyHref: string;
  /** Inyectable para pruebas; por defecto, el caso de uso SubmitLead. */
  submitLead?: SubmitLeadUseCase;
}

type Errors = Partial<Record<LeadField, string>>;

const EMPTY: LeadRequest = { name: '', whatsapp: '', email: '', company: '', services: [], message: '', consent: false };
const inputClass =
  'w-full rounded-xl border border-ink/20 bg-white px-4 py-3 text-ink placeholder:text-muted focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30 aria-[invalid=true]:border-danger';

export default function LeadForm({ services, privacyHref, submitLead }: LeadFormProps) {
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

  function goToProject(event: FormEvent) {
    event.preventDefault();
    const { errors: all } = validateLead({ ...values, services: ['-'], consent: true });
    const contactErrors = Object.fromEntries(CONTACT_FIELDS.filter((f) => all[f]).map((f) => [f, all[f]]));
    setErrors(contactErrors);
    if (Object.keys(contactErrors).length === 0) setStep(2);
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
    if (CONTACT_FIELDS.some((f) => result.errors[f])) setStep(1);
  }

  if (status === 'sent') {
    return (
      <div role="status" className="rounded-2xl bg-white p-8 text-center">
        <p className="font-poppins text-2xl font-bold text-ink mb-2">¡Listo, {values.name.split(' ')[0]}!</p>
        <p className="text-muted">
          Recibimos tu solicitud. Te contactaremos en menos de 24 horas por WhatsApp o correo.
        </p>
      </div>
    );
  }

  const toggleService = (value: string, checked: boolean) =>
    set('services', checked ? [...values.services, value] : values.services.filter((s) => s !== value));

  return (
    <form
      noValidate
      onSubmit={step === 1 ? goToProject : send}
      className="rounded-2xl bg-white p-6 md:p-8 space-y-5"
      aria-labelledby={`${id}-heading`}
    >
      <p className="text-xs font-semibold tracking-[0.2em] uppercase text-brand-blue">Paso {step} de 2</p>
      <h3 id={`${id}-heading`} ref={stepHeading} tabIndex={-1} className="font-poppins text-xl font-bold text-ink focus:outline-none">
        {step === 1 ? 'Tus datos de contacto' : 'Cuéntanos de tu proyecto'}
      </h3>

      {step === 1 ? (
        <>
          <Field label="Nombre completo" htmlFor={fieldId('name')} error={errors.name} errorId={errorId('name')}>
            <input {...a11y('name')} type="text" autoComplete="name" required value={values.name} onChange={(e) => set('name', e.target.value)} className={inputClass} />
          </Field>
          <Field label="WhatsApp" htmlFor={fieldId('whatsapp')} error={errors.whatsapp} errorId={errorId('whatsapp')}>
            <input {...a11y('whatsapp')} type="tel" inputMode="tel" autoComplete="tel" required placeholder="300 123 4567" value={values.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Correo electrónico" htmlFor={fieldId('email')} error={errors.email} errorId={errorId('email')}>
            <input {...a11y('email')} type="email" autoComplete="email" required value={values.email} onChange={(e) => set('email', e.target.value)} className={inputClass} />
          </Field>
          <button type="submit" className="btn-primary w-full">
            Continuar
          </button>
        </>
      ) : (
        <>
          <fieldset aria-describedby={errors.services ? errorId('services') : undefined}>
            <legend className="font-semibold text-ink mb-3">¿Qué servicios te interesan?</legend>
            <div className="grid sm:grid-cols-2 gap-2">
              {services.map((service) => (
                <label key={service.value} className="flex items-center gap-3 rounded-xl border border-ink/15 px-3 py-2.5 text-sm text-ink cursor-pointer has-[:checked]:border-brand-blue has-[:checked]:bg-brand-blue/5">
                  <input
                    type="checkbox"
                    value={service.value}
                    checked={values.services.includes(service.value)}
                    onChange={(e) => toggleService(service.value, e.target.checked)}
                    className="accent-brand-blue w-4 h-4"
                  />
                  {service.label}
                </label>
              ))}
            </div>
            {errors.services && <ErrorText id={errorId('services')}>{errors.services}</ErrorText>}
          </fieldset>
          <Field label="Empresa (opcional)" htmlFor={fieldId('company')}>
            <input id={fieldId('company')} type="text" autoComplete="organization" value={values.company} onChange={(e) => set('company', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Cuéntanos tu desafío (opcional)" htmlFor={fieldId('message')}>
            <textarea id={fieldId('message')} rows={3} value={values.message} onChange={(e) => set('message', e.target.value)} className={inputClass} />
          </Field>
          <div>
            <label className="flex items-start gap-3 text-sm text-ink">
              <input
                type="checkbox"
                {...a11y('consent')}
                checked={values.consent}
                onChange={(e) => set('consent', e.target.checked)}
                className="accent-brand-blue w-4 h-4 mt-0.5 shrink-0"
              />
              <span>
                Autorizo el tratamiento de mis datos personales según la Ley 1581 de 2012 y la{' '}
                <a href={privacyHref} className="text-brand-blue underline underline-offset-2">
                  política de privacidad
                </a>
                .
              </span>
            </label>
            {errors.consent && <ErrorText id={errorId('consent')}>{errors.consent}</ErrorText>}
          </div>
          {errors.form && (
            <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
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
    <div>
      <label htmlFor={htmlFor} className="block font-semibold text-ink mb-1.5 text-sm">
        {label}
      </label>
      {children}
      {error && errorId && <ErrorText id={errorId}>{error}</ErrorText>}
    </div>
  );
}

function ErrorText({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-1.5 text-sm text-danger">
      {children}
    </p>
  );
}
