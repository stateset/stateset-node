export default class CycleCounts {
    private client;
    constructor(client: any);
    create(data: any): Promise<any>;
    get(id: string): Promise<any>;
    update(id: string, data: any): Promise<any>;
    list(params?: any): Promise<any>;
    delete(id: string): Promise<any>;
    complete(id: string, data: any): Promise<any>;
    reconcile(id: string): Promise<any>;
}