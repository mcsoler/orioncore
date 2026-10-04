import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import LeadForm from '../../../src/ui/islands/LeadForm';
import { SubmitLead } from '../../../src/application/use-cases/SubmitLead';
import { LeadGatewayError, type LeadGateway } from '../../../src/application/ports/out/LeadGateway';

const services = [
  { value: 'automatizacion-de-procesos', label: 'Automatización de Procesos' },
  { value: 'agentes-ia-whatsapp', label: 'Agentes de IA para WhatsApp' },
];

function setup(gatewayFails = false) {
  const submit = vi.fn<LeadGateway['submit']>(async () => {
    if (gatewayFails) throw new LeadGatewayError('caído');
  });
  const submitLead = new SubmitLead({ submit }, { track: () => {} });
  const user = userEvent.setup();
  render(<LeadForm services={services} privacyHref="/privacidad/" submitLead={submitLead} />);
  return { user, submit };
}

async function fillContact(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/nombre/i), 'Ana Gómez');
  await user.type(screen.getByLabelText(/whatsapp/i), '300 123 4567');
  await user.type(screen.getByLabelText(/correo/i), 'ana@empresa.com');
  await user.click(screen.getByRole('button', { name: /continuar/i }));
}

describe('LeadForm (isla, 2 pasos)', () => {
  it('el paso 1 pide nombre, WhatsApp y correo', () => {
    setup();
    expect(screen.getByText(/paso 1 de 2/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre/i)).toBeRequired();
    expect(screen.getByLabelText(/whatsapp/i)).toHaveAttribute('type', 'tel');
    expect(screen.getByLabelText(/correo/i)).toHaveAttribute('type', 'email');
    expect(screen.queryByLabelText(/autorizo/i)).not.toBeInTheDocument();
  });

  it('muestra errores por campo en el paso 1 y no avanza', async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText(/whatsapp/i), '123');
    await user.click(screen.getByRole('button', { name: /continuar/i }));

    const whatsapp = screen.getByLabelText(/whatsapp/i);
    expect(whatsapp).toHaveAttribute('aria-invalid', 'true');
    expect(whatsapp).toHaveAccessibleDescription(/celular colombiano/i);
    expect(screen.getByLabelText(/nombre/i)).toHaveAccessibleDescription(/nombre/i);
    expect(screen.getByText(/paso 1 de 2/i)).toBeInTheDocument();
  });

  it('con el paso 1 válido pasa al paso 2 y lleva el foco a su título', async () => {
    const { user } = setup();
    await fillContact(user);
    expect(screen.getByText(/paso 2 de 2/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Agentes de IA para WhatsApp' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /tu proyecto/i })).toHaveFocus();
  });

  it('no envía sin consentimiento (Ley 1581)', async () => {
    const { user, submit } = setup();
    await fillContact(user);
    await user.click(screen.getByRole('checkbox', { name: 'Agentes de IA para WhatsApp' }));
    await user.click(screen.getByRole('button', { name: /enviar/i }));

    expect(submit).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/autorizo/i)).toHaveAccessibleDescription(/1581/);
  });

  it('exige al menos un servicio', async () => {
    const { user, submit } = setup();
    await fillContact(user);
    await user.click(screen.getByLabelText(/autorizo/i));
    await user.click(screen.getByRole('button', { name: /enviar/i }));
    expect(submit).not.toHaveBeenCalled();
    expect(screen.getByText(/al menos un servicio/i)).toBeInTheDocument();
  });

  it('el enlace de privacidad apunta a la política real', async () => {
    const { user } = setup();
    await fillContact(user);
    expect(screen.getByRole('link', { name: /política de privacidad/i })).toHaveAttribute('href', '/privacidad/');
  });

  it('con todo válido envía y muestra el estado de éxito', async () => {
    const { user, submit } = setup();
    await fillContact(user);
    await user.click(screen.getByRole('checkbox', { name: 'Automatización de Procesos' }));
    await user.type(screen.getByLabelText(/empresa/i), 'Empresa S.A.S.');
    await user.click(screen.getByLabelText(/autorizo/i));
    await user.click(screen.getByRole('button', { name: /enviar/i }));

    expect(submit).toHaveBeenCalledOnce();
    expect(submit.mock.calls[0]![0].services).toEqual(['automatizacion-de-procesos']);
    expect(await screen.findByRole('status')).toHaveTextContent(/recibimos tu solicitud/i);
    expect(screen.queryByRole('button', { name: /enviar/i })).not.toBeInTheDocument();
  });

  it('si el backend falla muestra un error general sin perder los datos', async () => {
    const { user } = setup(true);
    await fillContact(user);
    await user.click(screen.getByRole('checkbox', { name: 'Automatización de Procesos' }));
    await user.click(screen.getByLabelText(/autorizo/i));
    await user.click(screen.getByRole('button', { name: /enviar/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/whatsapp/i);
    expect(screen.getByRole('checkbox', { name: 'Automatización de Procesos' })).toBeChecked();
  });

  it('"Atrás" vuelve al paso 1 conservando los datos', async () => {
    const { user } = setup();
    await fillContact(user);
    await user.click(screen.getByRole('button', { name: /atrás/i }));
    expect(screen.getByLabelText(/nombre/i)).toHaveValue('Ana Gómez');
  });
});
