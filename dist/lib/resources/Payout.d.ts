export default class Payouts {
    private client;
    constructor(client: any);
    create(data: any): Promise<any>;
    get(id: string): Promise<any>;
    update(id: string, data: any): Promise<any>;
    list(params?: any): Promise<any>;
    delete(id: string): Promise<any>;
    fetchFromPlatform(platform: string, startDate: string, endDate: string): Promise<any>;
}
//# sourceMappingURL=Payout.d.ts.map