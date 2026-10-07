import { describe, expect, it } from 'vitest';
import { LeadGatewayError, type LeadGateway, type ValidLead } from '../../src/application/ports/out/LeadGateway';
import { Email } from '../../src/domain/value-objects/Email';
import { PhoneNumber } from '../../src/domain/value-objects/PhoneNumber';

export const contractLead: ValidLead = {
  name: 'Contrato',
  phone: PhoneNumber.parse('3001234567'),
  email: Email.parse('contrato@empresa.com'),
  services: ['software-a-medida'],
  consent: true,
};

/**
 * Contrato que cumple cualquier LeadGateway (Liskov): SubmitLead debe poder
 * usar cualquiera sin cambiar su comportamiento.
 */
export function leadGatewayContract(
  name: string,
  factories: { available: () => LeadGateway; unavailable?: () => LeadGateway },
) {
  describe(`Contrato LeadGateway: ${name}`, () => {
    it('submit() resuelve sin valor cuando el destino recibe el lead', async () => {
      await expect(factories.available().submit(contractLead)).resolves.toBeUndefined();
    });

    it('submit() acepta un lead con los campos opcionales', async () => {
      const full = { ...contractLead, company: 'Empresa', message: 'Hola' };
      await expect(factories.available().submit(full)).resolves.toBeUndefined();
    });

    if (factories.unavailable) {
      it('submit() falla solo con LeadGatewayError cuando el destino no está disponible', async () => {
        await expect(factories.unavailable!().submit(contractLead)).rejects.toBeInstanceOf(LeadGatewayError);
      });
    }
  });
}
