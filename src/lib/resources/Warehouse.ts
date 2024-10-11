// lib/resources/Warehouse.ts

type WarehouseStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'CLOSED';

interface BaseWarehouseResponse {
  id: string;
  object: 'warehouse';
  status: WarehouseStatus;
}

interface ActiveWarehouseResponse extends BaseWarehouseResponse {
  status: 'ACTIVE';
  active: true;
}

interface InactiveWarehouseResponse extends BaseWarehouseResponse {
  status: 'INACTIVE';
  inactive: true;
}

interface MaintenanceWarehouseResponse extends BaseWarehouseResponse {
  status: 'MAINTENANCE';
  maintenance: true;
}

interface ClosedWarehouseResponse extends BaseWarehouseResponse {
  status: 'CLOSED';
  closed: true;
}

type WarehouseResponse = ActiveWarehouseResponse | InactiveWarehouseResponse | MaintenanceWarehouseResponse | ClosedWarehouseResponse;

interface ApiResponse {
  update_warehouses_by_pk: {
    id: string;
    status: WarehouseStatus;
    [key: string]: any;
  };
}

interface WarehouseData {
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  capacity: number;
  [key: string]: any;
}

interface InventoryItem {
  item_id: string;
  quantity: number;
  [key: string]: any;
}

interface CapacityData {
  capacity: number;
}

export default class Warehouses {
  constructor(private client: any) {}

  private handleCommandResponse(response: any): WarehouseResponse {
    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.update_warehouses_by_pk) {
      throw new Error('Unexpected response format');
    }

    const warehouseData = response.update_warehouses_by_pk;

    const baseResponse: BaseWarehouseResponse = {
      id: warehouseData.id,
      object: 'warehouse',
      status: warehouseData.status,
    };

    switch (warehouseData.status) {
      case 'ACTIVE':
        return { ...baseResponse, status: 'ACTIVE', active: true };
      case 'INACTIVE':
        return { ...baseResponse, status: 'INACTIVE', inactive: true };
      case 'MAINTENANCE':
        return { ...baseResponse, status: 'MAINTENANCE', maintenance: true };
      case 'CLOSED':
        return { ...baseResponse, status: 'CLOSED', closed: true };
      default:
        throw new Error(`Unexpected warehouse status: ${warehouseData.status}`);
    }
  }

  async create(data: WarehouseData): Promise<WarehouseResponse> {
    const response = await this.client.request('POST', 'warehouses', data);
    return this.handleCommandResponse(response);
  }

  async get(id: string): Promise<WarehouseResponse> {
    const response = await this.client.request('GET', `warehouses/${id}`);
    return this.handleCommandResponse({ update_warehouses_by_pk: response });
  }

  async update(id: string, data: Partial<WarehouseData>): Promise<WarehouseResponse> {
    const response = await this.client.request('PUT', `warehouses/${id}`, data);
    return this.handleCommandResponse(response);
  }

  async list(params?: any): Promise<WarehouseResponse[]> {
    const response = await this.client.request('GET', 'warehouses', params);
    return response.map((warehouse: any) => this.handleCommandResponse({ update_warehouses_by_pk: warehouse }));
  }

  async delete(id: string): Promise<void> {
    await this.client.request('DELETE', `warehouses/${id}`);
  }

  async getInventory(id: string): Promise<InventoryItem[]> {
    return this.client.request('GET', `warehouses/${id}/inventory`);
  }

  async updateCapacity(id: string, data: CapacityData): Promise<WarehouseResponse> {
    const response = await this.client.request('PUT', `warehouses/${id}/capacity`, data);
    return this.handleCommandResponse(response);
  }

  async setActive(id: string): Promise<ActiveWarehouseResponse> {
    const response = await this.client.request('POST', `warehouses/${id}/set-active`);
    return this.handleCommandResponse(response) as ActiveWarehouseResponse;
  }

  async setInactive(id: string): Promise<InactiveWarehouseResponse> {
    const response = await this.client.request('POST', `warehouses/${id}/set-inactive`);
    return this.handleCommandResponse(response) as InactiveWarehouseResponse;
  }

  async setMaintenance(id: string): Promise<MaintenanceWarehouseResponse> {
    const response = await this.client.request('POST', `warehouses/${id}/set-maintenance`);
    return this.handleCommandResponse(response) as MaintenanceWarehouseResponse;
  }

  async setClosed(id: string): Promise<ClosedWarehouseResponse> {
    const response = await this.client.request('POST', `warehouses/${id}/set-closed`);
    return this.handleCommandResponse(response) as ClosedWarehouseResponse;
  }

  async addInventoryItem(id: string, item: InventoryItem): Promise<WarehouseResponse> {
    const response = await this.client.request('POST', `warehouses/${id}/inventory`, item);
    return this.handleCommandResponse(response);
  }

  async updateInventoryItem(id: string, itemId: string, quantity: number): Promise<WarehouseResponse> {
    const response = await this.client.request('PUT', `warehouses/${id}/inventory/${itemId}`, { quantity });
    return this.handleCommandResponse(response);
  }

  async removeInventoryItem(id: string, itemId: string): Promise<WarehouseResponse> {
    const response = await this.client.request('DELETE', `warehouses/${id}/inventory/${itemId}`);
    return this.handleCommandResponse(response);
  }
}