import BaseIntegration from './BaseIntegration';

export default class GorgiasIntegration extends BaseIntegration {
  constructor(apiKey: string) {
    super(apiKey, 'https://api.gorgias.com');
  }

  public async getTickets() {
    return this.request('GET', 'tickets');
  }

  public async createTicket(data: any) {
    return this.request('POST', 'tickets', data);
  }

  public async getTicketMessages(ticketId: string) {
    return this.request('GET', `tickets/${ticketId}/messages`);
  }

  public async createTicketMessage(ticketId: string, data: any) {
    return this.request('POST', `tickets/${ticketId}/messages`, data);
  }  

}