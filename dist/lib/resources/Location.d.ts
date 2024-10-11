export default class Locations {
    private client;
    constructor(client: any);
    create(data: any): Promise<any>;
    get(id: string): Promise<any>;
    update(id: string, data: any): Promise<any>;
    list(params?: any): Promise<any>;
    delete(id: string): Promise<any>;
    getInventory(id: string): Promise<any>;
    assignProduct(id: string, productId: string, data: any): Promise<any>;
}
