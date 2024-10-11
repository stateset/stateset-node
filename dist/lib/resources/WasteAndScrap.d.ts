export default class WasteAndScrap {
    private client;
    constructor(client: any);
    create(data: any): Promise<any>;
    get(id: string): Promise<any>;
    update(id: string, data: any): Promise<any>;
    list(params?: any): Promise<any>;
    delete(id: string): Promise<any>;
    generateReport(params?: any): Promise<any>;
    recordDisposal(id: string, data: any): Promise<any>;
}