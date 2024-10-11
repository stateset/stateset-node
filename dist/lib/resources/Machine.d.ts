export default class Machines {
    private client;
    constructor(client: any);
    create(data: any): Promise<any>;
    get(id: string): Promise<any>;
    update(id: string, data: any): Promise<any>;
    list(params?: any): Promise<any>;
    delete(id: string): Promise<any>;
    logRuntime(id: string, data: any): Promise<any>;
    scheduleMaintenance(id: string, data: any): Promise<any>;
    getPerformanceMetrics(id: string, params?: any): Promise<any>;
}
