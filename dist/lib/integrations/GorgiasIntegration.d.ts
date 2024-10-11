import BaseIntegration from './BaseIntegration';
export default class GorgiasIntegration extends BaseIntegration {
    constructor(apiKey: string);
    getTickets(): Promise<any>;
    createTicket(data: any): Promise<any>;
    getTicketMessages(ticketId: string): Promise<any>;
    createTicketMessage(ticketId: string, data: any): Promise<any>;
}
