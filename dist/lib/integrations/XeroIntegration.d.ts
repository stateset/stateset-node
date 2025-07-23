import BaseIntegration from './BaseIntegration';
export default class XeroIntegration extends BaseIntegration {
    constructor(apiKey: string);
    getInvoices(): Promise<any>;
    createInvoice(data: any): Promise<any>;
    getAccounts(): Promise<any>;
    createAccount(data: any): Promise<any>;
    getContacts(): Promise<any>;
    createContact(data: any): Promise<any>;
    getPayments(): Promise<any>;
    createPayment(data: any): Promise<any>;
}
//# sourceMappingURL=XeroIntegration.d.ts.map