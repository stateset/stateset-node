/// <reference types="node" />
/// <reference types="node" />
import { EventEmitter } from 'events';
import { HttpClient } from './HttpClient';
interface ApiConfig {
    host: string;
    port: string;
    protocol: string;
    basePath: string;
    version: string | null;
    timeout: number;
    maxNetworkRetries: number;
    httpClient: HttpClient;
    [key: string]: any;
}
declare class Stateset extends EventEmitter {
    private static readonly DEFAULT_HOST;
    private static readonly DEFAULT_PORT;
    private static readonly DEFAULT_BASE_PATH;
    private static readonly DEFAULT_API_VERSION;
    private static readonly DEFAULT_TIMEOUT;
    private static readonly MAX_NETWORK_RETRY_DELAY_SEC;
    private static readonly INITIAL_NETWORK_RETRY_DELAY_SEC;
    private static readonly DEFAULT_MAX_NETWORK_RETRIES;
    static readonly PACKAGE_VERSION = "0.0.1";
    static readonly USER_AGENT: {
        bindings_version: string;
        lang: string;
        lang_version: string;
        platform: NodeJS.Platform;
        publisher: string;
        uname: null;
    };
    static USER_AGENT_SERIALIZED: string | null;
    private _api;
    private _enableTelemetry;
    private _props;
    accounts: any;
    returns: any;
    returnlines: any;
    warranties: any;
    warrantylines: any;
    orders: any;
    orderlines: any;
    inventoryitems: any;
    shipments: any;
    shipmentlines: any;
    workorders: any;
    workorderlines: any;
    billofmaterials: any;
    billofmateriallines: any;
    manufactureorders: any;
    manufactureorderlines: any;
    purchaseorders: any;
    purchaseorderlines: any;
    constructor(token?: string);
    private _initializeResources;
    private createDefaultHttpClient;
    setHost(host: string, port?: string, protocol?: string): void;
    setProtocol(protocol: string): void;
    setPort(port: string): void;
    setApiVersion(version: string): void;
    setToken(token?: string): void;
    setTimeout(timeout: number): void;
    setMaxNetworkRetries(maxNetworkRetries: number): void;
    setEnableTelemetry(enableTelemetry: boolean): void;
    getTelemetryEnabled(): boolean;
    getApiField<T extends keyof ApiConfig>(key: T): ApiConfig[T];
    private setApiField;
    getClientUserAgent(cb: (userAgent: string) => void): void;
    private getClientUserAgentSeeded;
}
export default Stateset;
