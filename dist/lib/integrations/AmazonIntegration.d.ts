import BaseIntegration from './BaseIntegration';
export default class AmazonIntegration extends BaseIntegration {
    constructor(apiKey: string);
    getProducts(): Promise<any>;
    createProduct(data: any): Promise<any>;
    getOrders(): Promise<any>;
    createOrder(data: any): Promise<any>;
    getInventory(): Promise<any>;
    createInventory(data: any): Promise<any>;
    getReviews(): Promise<any>;
    createReview(data: any): Promise<any>;
    getFulfillments(): Promise<any>;
    createFulfillment(data: any): Promise<any>;
    getReports(): Promise<any>;
    createReport(data: any): Promise<any>;
}
