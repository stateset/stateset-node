export default class Suppliers {
    private client;
    constructor(client: any);
    create(data: any): Promise<any>;
    get(id: string): Promise<any>;
    update(id: string, data: any): Promise<any>;
    list(params?: any): Promise<any>;
    delete(id: string): Promise<any>;
    getPerformanceMetrics(id: string): Promise<any>;
    updatePaymentTerms(id: string, data: any): Promise<any>;
    listProducts(id: string): Promise<any>;
}
