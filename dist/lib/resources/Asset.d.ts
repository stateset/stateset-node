export default class Assets {
    private client;
    constructor(client: any);
    create(data: any): Promise<any>;
    get(id: string): Promise<any>;
    update(id: string, data: any): Promise<any>;
    list(params?: any): Promise<any>;
    delete(id: string): Promise<any>;
    getInvenory(id: string): Promise<any>;
    updateInventory(id: string, data: any): Promise<any>;
}
