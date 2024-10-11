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

type AssetResponse = ActiveAssetResponse | InactiveAssetResponse | MaintenanceAssetResponse | RetiredAssetResponse;

interface ApiResponse {
  update_assets_by_pk: {
    id: string;
    status: AssetStatus;
    [key: string]: any;
  };
}

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

  async create(data: any): Promise<AssetResponse> {
    const response = await this.client.request('POST', 'assets', data);
    return this.handleCommandResponse(response);
  }

  async get(id: string): Promise<AssetResponse> {
    const response = await this.client.request('GET', `assets/${id}`);
    return this.handleCommandResponse(response);
  }

  async update(id: string, data: any): Promise<AssetResponse> {
    const response = await this.client.request('PUT', `assets/${id}`, data);
    return this.handleCommandResponse(response);
  }

  async list(params?: any): Promise<AssetResponse[]> {
    const response = await this.client.request('GET', 'assets', params);
    return response.map((asset: any) => this.handleCommandResponse({ update_assets_by_pk: asset }));
  }

  async delete(id: string): Promise<void> {
    await this.client.request('DELETE', `assets/${id}`);
  }

  async getInventory(id: string): Promise<InventoryData> {
    return this.client.request('GET', `assets/${id}/inventory`);
  }

  async updateInventory(id: string, data: InventoryData): Promise<InventoryData> {
    return this.client.request('PUT', `assets/${id}/inventory`, data);
  }

  async setActive(id: string): Promise<ActiveAssetResponse> {
    const response = await this.client.request('POST', `assets/${id}/set-active`);
    return this.handleCommandResponse(response) as ActiveAssetResponse;
  }

  async setInactive(id: string): Promise<InactiveAssetResponse> {
    const response = await this.client.request('POST', `assets/${id}/set-inactive`);
    return this.handleCommandResponse(response) as InactiveAssetResponse;
  }

  async setMaintenance(id: string): Promise<MaintenanceAssetResponse> {
    const response = await this.client.request('POST', `assets/${id}/set-maintenance`);
    return this.handleCommandResponse(response) as MaintenanceAssetResponse;
  }

  async setRetired(id: string): Promise<RetiredAssetResponse> {
    const response = await this.client.request('POST', `assets/${id}/set-retired`);
    return this.handleCommandResponse(response) as RetiredAssetResponse;
  }
}