import BaseIntegration from './BaseIntegration';
export default class ShopifyIntegration extends BaseIntegration {
    constructor(apiKey: string);
    getProducts(): Promise<any>;
    createProduct(data: any): Promise<any>;
    updateProduct(id: string, data: any): Promise<any>;
    deleteProduct(id: string): Promise<any>;
    getOrders(): Promise<any>;
    createOrder(data: any): Promise<any>;
    updateOrder(id: string, data: any): Promise<any>;
    deleteOrder(id: string): Promise<any>;
    getCustomers(): Promise<any>;
    createCustomer(data: any): Promise<any>;
    updateCustomer(id: string, data: any): Promise<any>;
    deleteCustomer(id: string): Promise<any>;
    getInventory(): Promise<any>;
    createInventory(data: any): Promise<any>;
    updateInventory(id: string, data: any): Promise<any>;
    deleteInventory(id: string): Promise<any>;
}
