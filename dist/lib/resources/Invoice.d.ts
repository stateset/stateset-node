export default class Invoices {
    private client;
    constructor(client: any);
    create(data: any): Promise<any>;
    get(id: string): Promise<any>;
    update(id: string, data: any): Promise<any>;
    list(params?: any): Promise<any>;
    delete(id: string): Promise<any>;
    getLines(id: string): Promise<any>;
    updateLines(id: string, data: any): Promise<any>;
}
