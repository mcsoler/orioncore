import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import LeadForm from '../../../src/ui/islands/LeadForm';
import { SubmitLead } from '../../../src/application/use-cases/SubmitLead';
import { LeadGatewayError, type LeadGateway } from '../../../src/application/ports/out/LeadGateway';
import { SLOTS_CHANGED } from '../../../src/ui/islands/slotsStore';

const options = [
  { value: 'automatizacion-de-procesos', label: 'Automatización' },
  { value: 'agentes-ia-whatsapp', label: 'Agente IA WhatsApp' },
  { value: 'no-lo-tengo-claro', label: 'No lo tengo claro' },
];

function setup(gatewayFails = false) {
  const submit = vi.fn<LeadGateway['submit']>(async () => {
    if (gatewayFails) throw new LeadGatewayError('caído');
  });
  const submitLead = new SubmitLead({ submit }, { track: () => {} });
  const user = userEvent.setup();
  render(<LeadForm options={options} privacyHref="/privacidad/" submitLead={submitLead} />);
  return { user, submit };
}

type User = ReturnType<typeof userEvent.setup>;

async function completeStepOne(user: User) {
  await user.click(screen.getByRole('checkbox', { name: 'Agente IA WhatsApp' }));
  await user.type(screen.getByLabelText('Nombre'), 'Ana Gómez');
  await user.type(screen.getByLabelText('WhatsApp'), '300 123 4567');
  await user.click(screen.getByRole('checkbox', { name: /Acepto la política/ }));
  await user.click(screen.getByRole('button', { name: /Reservar mi cupo gratis/ }));
}

describe('LeadForm (isla, 2 pasos, referencia del home)', () => {
  it('paso 1: qué quiere mejorar, nombre, WhatsApp y consentimiento; "Toma 30 segundos"', () => {
    setup();
    expect(screen.getByText('Paso 1 de 2')).toBeInTheDocument();
    expect(screen.getByText('Toma 30 segundos')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: '¿Qué quieres mejorar primero?' })).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre')).toHaveAttribute('autocomplete', 'name');
    expect(screen.getByLabelText('WhatsApp')).toHaveAttribute('type', 'tel');
    expect(screen.queryByLabelText(/correo/i)).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
  });

  it('muestra los errores del paso 1 por campo y no avanza', async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText('WhatsApp'), '123');
    await user.click(screen.getByRole('button', { name: /Reservar mi cupo gratis/ }));

    expect(screen.getByLabelText('WhatsApp')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('WhatsApp')).toHaveAccessibleDescription(/celular colombiano/i);
    expect(screen.getByLabelText('Nombre')).toHaveAccessibleDescription(/nombre/i);
    expect(screen.getByRole('group', { name: '¿Qué quieres mejorar primero?' })).toHaveAccessibleDescription(/al menos/i);
    expect(screen.getByRole('checkbox', { name: /Acepto la política/ })).toHaveAccessibleDescription(/1581/);
    expect(screen.getByText('Paso 1 de 2')).toBeInTheDocument();
  });

  it('con el paso 1 válido pide el correo y lleva el foco a su título', async () => {
    const { user, submit } = setup();
    await completeStepOne(user);
    expect(screen.getByText('Paso 2 de 2')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByLabelText('Correo electrónico')).toHaveAttribute('type', 'email');
    expect(screen.getByRole('heading', { name: /correo/i })).toHaveFocus();
    expect(submit).not.toHaveBeenCalled();
  });

  it('el enlace de la política apunta a la página real', () => {
    setup();
    expect(screen.getByRole('link', { name: /política de tratamiento de datos/i })).toHaveAttribute('href', '/privacidad/');
  });

  it('con todo válido envía y muestra el estado de éxito', async () => {
    const { user, submit } = setup();
    await completeStepOne(user);
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@empresa.com');
    await user.click(screen.getByRole('button', { name: 'Enviar solicitud' }));

    expect(submit).toHaveBeenCalledOnce();
    expect(submit.mock.calls[0]![0].services).toEqual(['agentes-ia-whatsapp']);
    expect(await screen.findByRole('status')).toHaveTextContent(/recibimos tu solicitud/i);
  });

  it('al enviarse avisa que los cupos cambiaron (la barra de escasez se actualiza)', async () => {
    const onChange = vi.fn();
    window.addEventListener(SLOTS_CHANGED, onChange);
    const { user } = setup();
    await completeStepOne(user);
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@empresa.com');
    await user.click(screen.getByRole('button', { name: 'Enviar solicitud' }));
    await screen.findByRole('status');
    expect(onChange).toHaveBeenCalledOnce();
    window.removeEventListener(SLOTS_CHANGED, onChange);
  });

  it('un correo inválido se marca en el paso 2', async () => {
    const { user, submit } = setup();
    await completeStepOne(user);
    await user.type(screen.getByLabelText('Correo electrónico'), 'no-es-correo');
    await user.click(screen.getByRole('button', { name: 'Enviar solicitud' }));
    expect(submit).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Correo electrónico')).toHaveAccessibleDescription(/correo válido/i);
  });

  it('si el backend falla muestra un error general sin perder los datos', async () => {
    const { user } = setup(true);
    await completeStepOne(user);
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@empresa.com');
    await user.click(screen.getByRole('button', { name: 'Enviar solicitud' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/whatsapp/i);
    expect(screen.getByLabelText('Correo electrónico')).toHaveValue('ana@empresa.com');
  });

  it('"Atrás" vuelve al paso 1 conservando los datos', async () => {
    const { user } = setup();
    await completeStepOne(user);
    await user.click(screen.getByRole('button', { name: 'Atrás' }));
    expect(screen.getByLabelText('Nombre')).toHaveValue('Ana Gómez');
    expect(screen.getByRole('checkbox', { name: 'Agente IA WhatsApp' })).toBeChecked();
  });
});
