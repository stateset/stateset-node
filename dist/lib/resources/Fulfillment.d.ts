export default class Fulfillment {
    private client;
    constructor(client: any);
    create(data: any): Promise<any>;
    get(id: string): Promise<any>;
    update(id: string, data: any): Promise<any>;
    list(params?: any): Promise<any>;
    cancel(id: string): Promise<any>;
    createShipment(id: string, data: any): Promise<any>;
    getShipments(id: string): Promise<any>;
    updateTracking(id: string, data: any): Promise<any>;
}
