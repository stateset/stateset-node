// lib/resources/Asset.ts

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

type AssetResponse =
  | ActiveAssetResponse
  | InactiveAssetResponse
  | MaintenanceAssetResponse
  | RetiredAssetResponse;

interface InventoryData {
  quantity: number;
  [key: string]: any;
}

export default class Assets {
  constructor(private client: any) {}

  private handleCommandResponse(response: any): AssetResponse {
    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.update_assets_by_pk) {
      throw new Error('Unexpected response format');
    }

    const assetData = response.update_assets_by_pk;

    const baseResponse: BaseAssetResponse = {
      id: assetData.id,
      object: 'asset',
      status: assetData.status,
    };

    switch (assetData.status) {
      case 'ACTIVE':
        return { ...baseResponse, status: 'ACTIVE', active: true };
      case 'INACTIVE':
        return { ...baseResponse, status: 'INACTIVE', inactive: true };
      case 'MAINTENANCE':
        return { ...baseResponse, status: 'MAINTENANCE', maintenance: true };
      case 'RETIRED':
        return { ...baseResponse, status: 'RETIRED', retired: true };
      default:
        throw new Error(`Unexpected asset status: ${assetData.status}`);
    }
  }

  /**
   * Create asset
   * @param data - AssetData object
   * @returns AssetResponse object
   */
  async create(data: any): Promise<AssetResponse> {
    const response = await this.client.request('POST', 'assets', data);
    return this.handleCommandResponse(response);
  }

  /**
   * Get asset
   * @param id - Asset ID
   * @returns AssetResponse object
   */
  async get(id: string): Promise<AssetResponse> {
    const response = await this.client.request('GET', `assets/${id}`);
    return this.handleCommandResponse(response);
  }

  /**
   * Update asset
   * @param id - Asset ID
   * @param data - Partial<AssetData> object
   * @returns AssetResponse object
   */
  async update(id: string, data: any): Promise<AssetResponse> {
    const response = await this.client.request('PUT', `assets/${id}`, data);
    return this.handleCommandResponse(response);
  }

  /**
   * List assets
   * @param params - Optional filtering parameters
   * @returns Array of AssetResponse objects
   */
  async list(params?: any): Promise<AssetResponse[]> {
    const response = await this.client.request('GET', 'assets', undefined, { params });
    return response.map((asset: any) => this.handleCommandResponse({ update_assets_by_pk: asset }));
  }

  /**
   * Delete asset
   * @param id - Asset ID
   */
  async delete(id: string): Promise<void> {
    await this.client.request('DELETE', `assets/${id}`);
  }

  /**
   * Get inventory
   * @param id - Asset ID
   * @returns InventoryData object
   */
  async getInventory(id: string): Promise<InventoryData> {
    return this.client.request('GET', `assets/${id}/inventory`);
  }

  /**
   * Update inventory
   * @param id - Asset ID
   * @param data - InventoryData object
   * @returns InventoryData object
   */
  async updateInventory(id: string, data: InventoryData): Promise<InventoryData> {
    return this.client.request('PUT', `assets/${id}/inventory`, data);
  }

  /**
   * Set asset to active
   * @param id - Asset ID
   * @returns ActiveAssetResponse object
   */
  async setActive(id: string): Promise<ActiveAssetResponse> {
    const response = await this.client.request('POST', `assets/${id}/set-active`);
    return this.handleCommandResponse(response) as ActiveAssetResponse;
  }

  /**
   * Set asset to inactive
   * @param id - Asset ID
   * @returns InactiveAssetResponse object
   */
  async setInactive(id: string): Promise<InactiveAssetResponse> {
    const response = await this.client.request('POST', `assets/${id}/set-inactive`);
    return this.handleCommandResponse(response) as InactiveAssetResponse;
  }

  /**
   * Set asset to maintenance
   * @param id - Asset ID
   * @returns MaintenanceAssetResponse object
   */
  async setMaintenance(id: string): Promise<MaintenanceAssetResponse> {
    const response = await this.client.request('POST', `assets/${id}/set-maintenance`);
    return this.handleCommandResponse(response) as MaintenanceAssetResponse;
  }

  /**
   * Set asset to retired
   * @param id - Asset ID
   * @returns RetiredAssetResponse object
   */
  async setRetired(id: string): Promise<RetiredAssetResponse> {
    const response = await this.client.request('POST', `assets/${id}/set-retired`);
    return this.handleCommandResponse(response) as RetiredAssetResponse;
  }
}
