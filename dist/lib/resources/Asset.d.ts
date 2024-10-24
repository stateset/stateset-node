type AssetStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'RETIRED';
interface BaseAssetResponse {
    id: string;
    object: 'asset';
    status: AssetStatus;
}
interface ActiveAssetResponse extends BaseAssetResponse {
    status: 'ACTIVE';
    active: true;
}
interface InactiveAssetResponse extends BaseAssetResponse {
    status: 'INACTIVE';
    inactive: true;
}
interface MaintenanceAssetResponse extends BaseAssetResponse {
    status: 'MAINTENANCE';
    maintenance: true;
}
interface RetiredAssetResponse extends BaseAssetResponse {
    status: 'RETIRED';
    retired: true;
}
type AssetResponse = ActiveAssetResponse | InactiveAssetResponse | MaintenanceAssetResponse | RetiredAssetResponse;
interface InventoryData {
    quantity: number;
    [key: string]: any;
}
export default class Assets {
    private client;
    constructor(client: any);
    private handleCommandResponse;
    create(data: any): Promise<AssetResponse>;
    get(id: string): Promise<AssetResponse>;
    update(id: string, data: any): Promise<AssetResponse>;
    list(params?: any): Promise<AssetResponse[]>;
    delete(id: string): Promise<void>;
    getInventory(id: string): Promise<InventoryData>;
    updateInventory(id: string, data: InventoryData): Promise<InventoryData>;
    setActive(id: string): Promise<ActiveAssetResponse>;
    setInactive(id: string): Promise<InactiveAssetResponse>;
    setMaintenance(id: string): Promise<MaintenanceAssetResponse>;
    setRetired(id: string): Promise<RetiredAssetResponse>;
}
export {};
