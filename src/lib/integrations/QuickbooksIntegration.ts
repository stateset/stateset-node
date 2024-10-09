import BaseIntegration from './BaseIntegration';

export default class QuickbooksIntegration extends BaseIntegration {
  constructor(apiKey: string) {
    super(apiKey, 'https://api.quickbooks.com');
  }

  public async getInvoices() {
    return this.request('GET', 'invoices');
  }

  public async createInvoice(data: any) {
    return this.request('POST', 'invoices', data);
  }

  public async getAccounts() {
    return this.request('GET', 'accounts');
  }

  public async createAccount(data: any) {
    return this.request('POST', 'accounts', data);
  }

  public async getContacts() {
    return this.request('GET', 'contacts');
  }

  public async createContact(data: any) {
    return this.request('POST', 'contacts', data);
  }

  public async getPayments() {
    return this.request('GET', 'payments');
  }

  public async createPayment(data: any) {
    return this.request('POST', 'payments', data);
  }
  
  
  
}