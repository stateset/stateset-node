import { StatesetConfig } from './types';
import { ReturnsResource } from './resources/returns';
import { OrdersResource, ProductsResource, CustomersResource, ShipmentsResource, WorkOrdersResource, AgentsResource, InventoryResource } from './resources';
export declare class StatesetClient {
    private httpClient;
    private config;
    readonly returns: ReturnsResource;
    readonly orders: OrdersResource;
    readonly products: ProductsResource;
    readonly customers: CustomersResource;
    readonly shipments: ShipmentsResource;
    readonly workOrders: WorkOrdersResource;
    readonly agents: AgentsResource;
    readonly inventory: InventoryResource;
    constructor(config?: StatesetConfig);
    private normalizeConfig;
    private validateConfig;
    setApiKey(apiKey: string): void;
    setBaseUrl(baseUrl: string): void;
    setTimeout(timeout: number): void;
    setRetryOptions(retry: number, retryDelayMs: number): void;
    setHeaders(headers: Record<string, string>): void;
    setProxy(proxy: string): void;
    setAppInfo(appInfo: {
        name: string;
        version?: string;
        url?: string;
    }): void;
    healthCheck(): Promise<{
        status: 'ok' | 'error';
        timestamp: string;
        details?: any;
    }>;
    getCircuitBreakerState(): string;
    resetCircuitBreaker(): void;
    request(method: string, path: string, data?: any, options?: any): Promise<any>;
    getConfig(): Omit<StatesetConfig, 'apiKey'>;
    destroy(): void;
}
//# sourceMappingURL=client.d.ts.map