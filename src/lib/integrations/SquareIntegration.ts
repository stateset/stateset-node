import BaseIntegration from './BaseIntegration';

export default class SquareIntegration extends BaseIntegration {
  constructor(apiKey: string) {
    super(apiKey, 'https://api.square.com');
  }

  public async getPayments() {
    return this.request('GET', 'payments');
  }

  public async createPayment(data: any) {
    return this.request('POST', 'payments', data);
  }

  public async getPayment(paymentId: string) {
    return this.request('GET', `payments/${paymentId}`);
  }

  public async updatePayment(paymentId: string, data: any) {
    return this.request('PUT', `payments/${paymentId}`, data);
  }

  public async deletePayment(paymentId: string) {
    return this.request('DELETE', `payments/${paymentId}`);
  }

  public async getPaymentDetails(paymentId: string) {
    return this.request('GET', `payments/${paymentId}/details`);
  }

  public async getPaymentTransactions(paymentId: string) {
    return this.request('GET', `payments/${paymentId}/transactions`);
  }

  public async getPaymentRefunds(paymentId: string) {
    return this.request('GET', `payments/${paymentId}/refunds`);
  }

  public async createPaymentRefund(paymentId: string, data: any) {
    return this.request('POST', `payments/${paymentId}/refunds`, data);
  }

  public async getPaymentCapture(paymentId: string) {
    return this.request('GET', `payments/${paymentId}/capture`);
  }

  public async createPaymentCapture(paymentId: string, data: any) {
    return this.request('POST', `payments/${paymentId}/capture`, data);
  }

  public async getPaymentAuthorization(paymentId: string) {
    return this.request('GET', `payments/${paymentId}/authorization`);
  }
}
