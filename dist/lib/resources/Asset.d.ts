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
    /**
     * Create asset
     * @param data - AssetData object
     * @returns AssetResponse object
     */
    create(data: any): Promise<AssetResponse>;
    /**
     * Get asset
     * @param id - Asset ID
     * @returns AssetResponse object
     */
    get(id: string): Promise<AssetResponse>;
    /**
     * Update asset
     * @param id - Asset ID
     * @param data - Partial<AssetData> object
     * @returns AssetResponse object
     */
    update(id: string, data: any): Promise<AssetResponse>;
    /**
     * List assets
     * @param params - Optional filtering parameters
     * @returns Array of AssetResponse objects
     */
    list(params?: any): Promise<AssetResponse[]>;
    /**
     * Delete asset
     * @param id - Asset ID
     */
    delete(id: string): Promise<void>;
    /**
     * Get inventory
     * @param id - Asset ID
     * @returns InventoryData object
     */
    getInventory(id: string): Promise<InventoryData>;
    /**
     * Update inventory
     * @param id - Asset ID
     * @param data - InventoryData object
     * @returns InventoryData object
     */
    updateInventory(id: string, data: InventoryData): Promise<InventoryData>;
    /**
     * Set asset to active
     * @param id - Asset ID
     * @returns ActiveAssetResponse object
     */
    setActive(id: string): Promise<ActiveAssetResponse>;
    /**
     * Set asset to inactive
     * @param id - Asset ID
     * @returns InactiveAssetResponse object
     */
    setInactive(id: string): Promise<InactiveAssetResponse>;
    /**
     * Set asset to maintenance
     * @param id - Asset ID
     * @returns MaintenanceAssetResponse object
     */
    setMaintenance(id: string): Promise<MaintenanceAssetResponse>;
    /**
     * Set asset to retired
     * @param id - Asset ID
     * @returns RetiredAssetResponse object
     */
    setRetired(id: string): Promise<RetiredAssetResponse>;
}
export {};
//# sourceMappingURL=Asset.d.ts.map