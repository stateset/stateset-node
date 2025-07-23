import BaseIntegration from './BaseIntegration';
export default class ShipfusionIntegration extends BaseIntegration {
    constructor(apiKey: string);
    getProducts(): Promise<any>;
    createProduct(data: any): Promise<any>;
    getOrders(): Promise<any>;
    createOrder(data: any): Promise<any>;
    getShipments(): Promise<any>;
    createShipment(data: any): Promise<any>;
    getCarriers(): Promise<any>;
    getRates(data: any): Promise<any>;
}
//# sourceMappingURL=ShipfusionIntegration.d.ts.map