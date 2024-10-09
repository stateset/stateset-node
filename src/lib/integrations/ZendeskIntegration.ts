import BaseIntegration from './BaseIntegration';

export default class ZendeskIntegration extends BaseIntegration {
  constructor(apiKey: string) {
    super(apiKey, 'https://api.zendesk.com');
  }

  public async getTickets() {
    return this.request('GET', 'tickets');
  }

  public async createTicket(data: any) {
    return this.request('POST', 'tickets', data);
  }

}