import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import LossCalculator from '../../../src/ui/islands/LossCalculator';

const props = {
  defaultHours: 10,
  costPerHour: { default: 25_000, min: 10_000, max: 200_000, step: 5_000 },
  cta: { label: 'Quiero recuperar ese tiempo', href: '#contacto' },
};

const hoursSlider = () => screen.getByLabelText(/horas por semana/i);
const costSlider = () => screen.getByLabelText(/costo por hora/i);

describe('LossCalculator (isla)', () => {
  it('muestra el resultado inicial con los valores por defecto', () => {
    render(<LossCalculator {...props} />);
    expect(screen.getByTestId('monthly-loss')).toHaveTextContent('$1.082.500');
    expect(screen.getByTestId('annual-loss')).toHaveTextContent('$12.990.000');
    expect(screen.getByTestId('hours-per-year')).toHaveTextContent('520');
  });

  it('los sliders actualizan el resultado', () => {
    render(<LossCalculator {...props} />);
    fireEvent.change(hoursSlider(), { target: { value: '20' } });
    expect(screen.getByTestId('monthly-loss')).toHaveTextContent('$2.165.000');

    fireEvent.change(costSlider(), { target: { value: '50000' } });
    expect(screen.getByTestId('monthly-loss')).toHaveTextContent('$4.330.000');
  });

  it('los sliders son controles nativos con límites y valor legible para lectores de pantalla', () => {
    render(<LossCalculator {...props} />);
    expect(hoursSlider()).toHaveAttribute('type', 'range');
    expect(hoursSlider()).toHaveAttribute('min', '1');
    expect(hoursSlider()).toHaveAttribute('max', '60');
    expect(hoursSlider()).toHaveAttribute('aria-valuetext', '10 horas por semana');
    expect(costSlider()).toHaveAttribute('min', '10000');
    expect(costSlider()).toHaveAttribute('step', '5000');
    expect(costSlider()).toHaveAttribute('aria-valuetext', '$25.000 por hora');
  });

  it('es accesible con teclado: Tab recorre los dos sliders y el CTA', async () => {
    const user = userEvent.setup();
    render(<LossCalculator {...props} />);
    await user.tab();
    expect(hoursSlider()).toHaveFocus();
    await user.tab();
    expect(costSlider()).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: props.cta.label })).toHaveFocus();
  });

  it('la lista de resultados es un <dl> válido: cada <div> hijo directo contiene un dt y un dd', () => {
    const { container } = render(<LossCalculator {...props} />);
    const dl = container.querySelector('dl')!;
    for (const child of dl.children) {
      expect(child.tagName).toBe('DIV');
      expect([...child.children].map((c) => c.tagName)).toEqual(['DT', 'DD']);
    }
  });

  it('anuncia los cambios del resultado (aria-live)', () => {
    render(<LossCalculator {...props} />);
    expect(screen.getByTestId('monthly-loss').closest('[aria-live]')).toHaveAttribute('aria-live', 'polite');
  });

  it('muestra el error si el cálculo no es válido', () => {
    const calculate = () => ({ ok: false as const, errors: { costPerHour: 'costo inválido' } });
    render(<LossCalculator {...props} calculate={calculate} />);
    expect(screen.getByRole('alert')).toHaveTextContent('costo inválido');
  });
});
