import BaseIntegration from './BaseIntegration';
export default class TikTokShopIntegration extends BaseIntegration {
    constructor(apiKey: string);
    getProducts(): Promise<any>;
    createProduct(data: any): Promise<any>;
    getOrders(): Promise<any>;
    createOrder(data: any): Promise<any>;
    getCustomers(): Promise<any>;
    createCustomer(data: any): Promise<any>;
    getReviews(): Promise<any>;
    createReview(data: any): Promise<any>;
    getFulfillments(): Promise<any>;
    createFulfillment(data: any): Promise<any>;
}
