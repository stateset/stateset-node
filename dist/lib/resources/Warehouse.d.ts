export default class Warehouses {
    private client;
    constructor(client: any);
    create(data: any): Promise<any>;
    get(id: string): Promise<any>;
    update(id: string, data: any): Promise<any>;
    list(params?: any): Promise<any>;
    delete(id: string): Promise<any>;
    getInventory(id: string): Promise<any>;
    updateCapacity(id: string, data: any): Promise<any>;
}
