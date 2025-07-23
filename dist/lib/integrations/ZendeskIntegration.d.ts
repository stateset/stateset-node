import BaseIntegration from './BaseIntegration';
export default class ZendeskIntegration extends BaseIntegration {
    constructor(apiKey: string);
    getTickets(): Promise<any>;
    createTicket(data: any): Promise<any>;
}
//# sourceMappingURL=ZendeskIntegration.d.ts.map