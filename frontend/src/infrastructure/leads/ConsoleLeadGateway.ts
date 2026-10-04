import type { LeadGateway, ValidLead } from '../../application/ports/out/LeadGateway';

/** Strategy de desarrollo: muestra el lead en consola en lugar de enviarlo. */
export class ConsoleLeadGateway implements LeadGateway {
  constructor(private readonly logger: Pick<Console, 'info'> = console) {}

  async submit(lead: ValidLead): Promise<void> {
    this.logger.info('[lead]', {
      name: lead.name,
      phone: lead.phone.value,
      email: lead.email.value,
      services: lead.services,
    });
  }
}
