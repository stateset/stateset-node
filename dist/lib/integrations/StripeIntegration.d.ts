import BaseIntegration from './BaseIntegration';
export default class StripeIntegration extends BaseIntegration {
    constructor(apiKey: string);
    getOrders(): Promise<any>;
    createOrder(data: any): Promise<any>;
}
//# sourceMappingURL=StripeIntegration.d.ts.map