export default class Settlements {
    private client;
    constructor(client: any);
    create(data: any): Promise<any>;
    get(id: string): Promise<any>;
    update(id: string, data: any): Promise<any>;
    list(params?: any): Promise<any>;
    delete(id: string): Promise<any>;
    consolidate(startDate: string, endDate: string): Promise<any>;
    reconcile(startDate: string, endDate: string): Promise<any>;
}
