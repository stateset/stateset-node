import { stateset } from '../../stateset-client';

interface BaseInventoryResponse {
  id: string;
  object: 'inventory';
  quantity: number;
  location: string;
}

type InventoryResponse = BaseInventoryResponse;

interface ApiResponse {
  update_inventory_by_pk: {
    id: string;
    quantity: number;
    location: string;
    [key: string]: any;
  };
}

interface InventoryData {
  item_id: string;
  quantity: number;
  location: string;
  [key: string]: any;
}

class Inventory {
  constructor(private stateset: stateset) {}

  private handleCommandResponse(response: any): InventoryResponse {
    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.update_inventory_by_pk) {
      throw new Error('Unexpected response format');
    }

    const inventoryData = response.update_inventory_by_pk;

    return {
      id: inventoryData.id,
      object: 'inventory',
      quantity: inventoryData.quantity,
      location: inventoryData.location,
    };
  }

  async list(): Promise<InventoryResponse[]> {
    const response = await this.stateset.request('GET', 'inventory');
    return response.map((inventory: any) => this.handleCommandResponse({ update_inventory_by_pk: inventory }));
  }

  async get(inventoryId: string): Promise<InventoryResponse> {
    const response = await this.stateset.request('GET', `inventory/${inventoryId}`);
    return this.handleCommandResponse({ update_inventory_by_pk: response });
  }

  async create(inventoryData: InventoryData): Promise<InventoryResponse> {
    const response = await this.stateset.request('POST', 'inventory', inventoryData);
    return this.handleCommandResponse(response);
  }

  async update(inventoryId: string, inventoryData: Partial<InventoryData>): Promise<InventoryResponse> {
    const response = await this.stateset.request('PUT', `inventory/${inventoryId}`, inventoryData);
    return this.handleCommandResponse(response);
  }

  async delete(inventoryId: string): Promise<void> {
    await this.stateset.request('DELETE', `inventory/${inventoryId}`);
  }

  async adjustQuantity(inventoryId: string, adjustment: number): Promise<InventoryResponse> {
    const response = await this.stateset.request('POST', `inventory/${inventoryId}/adjust`, { adjustment });
    return this.handleCommandResponse(response);
  }

  async transfer(fromInventoryId: string, toInventoryId: string, quantity: number): Promise<InventoryResponse[]> {
    const response = await this.stateset.request('POST', 'inventory/transfer', {
      from_inventory_id: fromInventoryId,
      to_inventory_id: toInventoryId,
      quantity,
    });
    return response.map((inventory: any) => this.handleCommandResponse({ update_inventory_by_pk: inventory }));
  }

  async getHistory(inventoryId: string): Promise<any[]> {
    return this.stateset.request('GET', `inventory/${inventoryId}/history`);
  }
}

export default Inventory;