import BaseIntegration from './BaseIntegration';
export default class PayPalIntegration extends BaseIntegration {
    constructor(apiKey: string);
    getPayments(): Promise<any>;
    createPayment(data: any): Promise<any>;
    getPayment(paymentId: string): Promise<any>;
    updatePayment(paymentId: string, data: any): Promise<any>;
    deletePayment(paymentId: string): Promise<any>;
    getPaymentDetails(paymentId: string): Promise<any>;
    getPaymentTransactions(paymentId: string): Promise<any>;
    getPaymentRefunds(paymentId: string): Promise<any>;
    createPaymentRefund(paymentId: string, data: any): Promise<any>;
    getPaymentCapture(paymentId: string): Promise<any>;
    createPaymentCapture(paymentId: string, data: any): Promise<any>;
    getPaymentAuthorization(paymentId: string): Promise<any>;
}
//# sourceMappingURL=PayPalIntegration.d.ts.map