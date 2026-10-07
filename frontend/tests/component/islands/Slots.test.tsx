import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import LiveSlotsText from '../../../src/ui/islands/LiveSlotsText';
import SlotsMeter from '../../../src/ui/islands/SlotsMeter';
import { notifySlotsChanged, resetSlotsCache } from '../../../src/ui/islands/slotsStore';

const initial = { remaining: 4, taken: 6, total: 10, progress: 60 };
const later = { remaining: 2, taken: 8, total: 10, progress: 80 };
const template = 'Diagnóstico gratuito de {month}: quedan solo {remaining} de {total} cupos';

afterEach(() => resetSlotsCache());

describe('LiveSlotsText (barra de escasez)', () => {
  it('muestra primero los cupos iniciales y luego los reales del backend', async () => {
    const getSlots = { execute: vi.fn(async () => later) };
    render(<LiveSlotsText template={template} initial={initial} getSlots={getSlots} />);
    expect(screen.getByText(/quedan solo 4 de 10 cupos/)).toBeInTheDocument();
    expect(await screen.findByText(/quedan solo 2 de 10 cupos/)).toBeInTheDocument();
    expect(getSlots.execute).toHaveBeenCalledWith(initial);
  });

  it('vuelve a consultar cuando alguien envía el formulario', async () => {
    const getSlots = { execute: vi.fn(async () => later) };
    render(<LiveSlotsText template={template} initial={initial} getSlots={getSlots} />);
    await screen.findByText(/quedan solo 2 de 10/);

    getSlots.execute.mockResolvedValueOnce({ remaining: 1, taken: 9, total: 10, progress: 90 });
    await act(async () => notifySlotsChanged());
    expect(await screen.findByText(/quedan solo 1 de 10/)).toBeInTheDocument();
  });
});

describe('SlotsMeter (cupos del contacto)', () => {
  it('muestra los tomados y la barra de avance con los datos reales', async () => {
    const getSlots = { execute: vi.fn(async () => later) };
    render(<SlotsMeter label="Cupos de {month}" value="{taken} de {total} tomados" initial={initial} getSlots={getSlots} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '60');
    expect(await screen.findByText('8 de 10 tomados')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '80');
  });
});
