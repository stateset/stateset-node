import { AxiosResponse } from 'axios';
interface StatesetOptions {
    apiKey: string;
    baseUrl?: string;
}
declare class Stateset {
    private readonly options;
    private client;
    constructor(options: StatesetOptions);
    private setupInterceptors;
    private handleError;
    private createOptions;
    returns: {
        create: (params: any) => Promise<AxiosResponse>;
        retrieve: (id: string) => Promise<AxiosResponse>;
        update: (id: string, params: any) => Promise<AxiosResponse>;
        list: (params?: any) => Promise<AxiosResponse>;
    };
    returnItems: {
        create: (params: any) => Promise<AxiosResponse>;
        retrieve: (id: string) => Promise<AxiosResponse>;
        update: (id: string, params: any) => Promise<AxiosResponse>;
        list: (params?: any) => Promise<AxiosResponse>;
    };
    warranties: {
        create: (params: any) => Promise<AxiosResponse>;
        retrieve: (id: string) => Promise<AxiosResponse>;
        update: (id: string, params: any) => Promise<AxiosResponse>;
        list: (params?: any) => Promise<AxiosResponse>;
    };
    warrantyItems: {
        create: (params: any) => Promise<AxiosResponse>;
        retrieve: (id: string) => Promise<AxiosResponse>;
        update: (id: string, params: any) => Promise<AxiosResponse>;
        list: (params?: any) => Promise<AxiosResponse>;
    };
    products: {
        create: (params: any) => Promise<AxiosResponse>;
        retrieve: (id: string) => Promise<AxiosResponse>;
        update: (id: string, params: any) => Promise<AxiosResponse>;
        list: (params?: any) => Promise<AxiosResponse>;
    };
    orders: {
        create: (params: any) => Promise<AxiosResponse>;
        retrieve: (id: string) => Promise<AxiosResponse>;
        update: (id: string, params: any) => Promise<AxiosResponse>;
        list: (params?: any) => Promise<AxiosResponse>;
    };
    orderItems: {
        create: (params: any) => Promise<AxiosResponse>;
        retrieve: (id: string) => Promise<AxiosResponse>;
        update: (id: string, params: any) => Promise<AxiosResponse>;
        list: (params?: any) => Promise<AxiosResponse>;
    };
    shipments: {
        create: (params: any) => Promise<AxiosResponse>;
        retrieve: (id: string) => Promise<AxiosResponse>;
        update: (id: string, params: any) => Promise<AxiosResponse>;
        list: (params?: any) => Promise<AxiosResponse>;
    };
    shipmentItems: {
        create: (params: any) => Promise<AxiosResponse>;
        retrieve: (id: string) => Promise<AxiosResponse>;
        update: (id: string, params: any) => Promise<AxiosResponse>;
        list: (params?: any) => Promise<AxiosResponse>;
    };
    inventory: {
        create: (params: any) => Promise<AxiosResponse>;
        retrieve: (id: string) => Promise<AxiosResponse>;
        update: (id: string, params: any) => Promise<AxiosResponse>;
        list: (params?: any) => Promise<AxiosResponse>;
    };
    customers: {
        create: (params: any) => Promise<AxiosResponse>;
        retrieve: (id: string) => Promise<AxiosResponse>;
        update: (id: string, params: any) => Promise<AxiosResponse>;
        list: (params?: any) => Promise<AxiosResponse>;
    };
    workorders: {
        create: (params: any) => Promise<AxiosResponse>;
        retrieve: (id: string) => Promise<AxiosResponse>;
        update: (id: string, params: any) => Promise<AxiosResponse>;
        list: (params?: any) => Promise<AxiosResponse>;
    };
    workorderItems: {
        create: (params: any) => Promise<AxiosResponse>;
        retrieve: (id: string) => Promise<AxiosResponse>;
        update: (id: string, params: any) => Promise<AxiosResponse>;
        list: (params?: any) => Promise<AxiosResponse>;
    };
    billOfMaterials: {
        create: (params: any) => Promise<AxiosResponse>;
        retrieve: (id: string) => Promise<AxiosResponse>;
        update: (id: string, params: any) => Promise<AxiosResponse>;
        list: (params?: any) => Promise<AxiosResponse>;
    };
    purchaseOrders: {
        create: (params: any) => Promise<AxiosResponse>;
        retrieve: (id: string) => Promise<AxiosResponse>;
        update: (id: string, params: any) => Promise<AxiosResponse>;
        list: (params?: any) => Promise<AxiosResponse>;
    };
    purchaseOrderItems: {
        create: (params: any) => Promise<AxiosResponse>;
        retrieve: (id: string) => Promise<AxiosResponse>;
        update: (id: string, params: any) => Promise<AxiosResponse>;
        list: (params?: any) => Promise<AxiosResponse>;
    };
    manufacturerOrders: {
        create: (params: any) => Promise<AxiosResponse>;
        retrieve: (id: string) => Promise<AxiosResponse>;
        update: (id: string, params: any) => Promise<AxiosResponse>;
        list: (params?: any) => Promise<AxiosResponse>;
    };
    manufacturerOrderItems: {
        create: (params: any) => Promise<AxiosResponse>;
        retrieve: (id: string) => Promise<AxiosResponse>;
        update: (id: string, params: any) => Promise<AxiosResponse>;
        list: (params?: any) => Promise<AxiosResponse>;
    };
    channels: {
        create: (params: any) => Promise<AxiosResponse>;
        retrieve: (id: string) => Promise<AxiosResponse>;
        update: (id: string, params: any) => Promise<AxiosResponse>;
        list: (params?: any) => Promise<AxiosResponse>;
    };
    messages: {
        create: (params: any) => Promise<AxiosResponse>;
        retrieve: (id: string) => Promise<AxiosResponse>;
        update: (id: string, params: any) => Promise<AxiosResponse>;
        list: (params?: any) => Promise<AxiosResponse>;
    };
    agents: {
        create: (params: any) => Promise<AxiosResponse>;
        retrieve: (id: string) => Promise<AxiosResponse>;
        update: (id: string, params: any) => Promise<AxiosResponse>;
        list: (params?: any) => Promise<AxiosResponse>;
    };
    rules: {
        create: (params: any) => Promise<AxiosResponse>;
        retrieve: (id: string) => Promise<AxiosResponse>;
        update: (id: string, params: any) => Promise<AxiosResponse>;
        list: (params?: any) => Promise<AxiosResponse>;
    };
    attributes: {
        create: (params: any) => Promise<AxiosResponse>;
        retrieve: (id: string) => Promise<AxiosResponse>;
        update: (id: string, params: any) => Promise<AxiosResponse>;
        list: (params?: any) => Promise<AxiosResponse>;
    };
    workflows: {
        create: (params: any) => Promise<AxiosResponse>;
        retrieve: (id: string) => Promise<AxiosResponse>;
        update: (id: string, params: any) => Promise<AxiosResponse>;
        list: (params?: any) => Promise<AxiosResponse>;
    };
    users: {
        create: (params: any) => Promise<AxiosResponse>;
        retrieve: (id: string) => Promise<AxiosResponse>;
        update: (id: string, params: any) => Promise<AxiosResponse>;
        list: (params?: any) => Promise<AxiosResponse>;
    };
    settlements: {
        create: (params: any) => Promise<AxiosResponse>;
        retrieve: (id: string) => Promise<AxiosResponse>;
        update: (id: string, params: any) => Promise<AxiosResponse>;
        list: (params?: any) => Promise<AxiosResponse>;
    };
    payouts: {
        create: (params: any) => Promise<AxiosResponse>;
        retrieve: (id: string) => Promise<AxiosResponse>;
        update: (id: string, params: any) => Promise<AxiosResponse>;
        list: (params?: any) => Promise<AxiosResponse>;
    };
    picks: {
        create: (params: any) => Promise<AxiosResponse>;
        retrieve: (id: string) => Promise<AxiosResponse>;
        update: (id: string, params: any) => Promise<AxiosResponse>;
        list: (params?: any) => Promise<AxiosResponse>;
    };
    cycleCounts: {
        create: (params: any) => Promise<AxiosResponse>;
        retrieve: (id: string) => Promise<AxiosResponse>;
        update: (id: string, params: any) => Promise<AxiosResponse>;
        list: (params?: any) => Promise<AxiosResponse>;
    };
    machines: {
        create: (params: any) => Promise<AxiosResponse>;
        retrieve: (id: string) => Promise<AxiosResponse>;
        update: (id: string, params: any) => Promise<AxiosResponse>;
        list: (params?: any) => Promise<AxiosResponse>;
    };
    wasteAndScrap: {
        create: (params: any) => Promise<AxiosResponse>;
        retrieve: (id: string) => Promise<AxiosResponse>;
        update: (id: string, params: any) => Promise<AxiosResponse>;
        list: (params?: any) => Promise<AxiosResponse>;
    };
}
export default Stateset;
