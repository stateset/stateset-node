export default class InvoiceLines {
    private client;
    constructor(client: any);
    create(data: any): Promise<any>;
    get(id: string): Promise<any>;
    update(id: string, data: any): Promise<any>;
    list(params?: any): Promise<any>;
    delete(id: string): Promise<any>;
    getPayouts(id: string): Promise<any>;
    updatePayouts(id: string, data: any): Promise<any>;
}
