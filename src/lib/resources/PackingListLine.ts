import { stateset } from '../../stateset-client';

// Packing List Line Items
interface PackingListLineItem {
    id: string;
    packing_list_id: string;
    purchase_order_line_item_id: string;
    package_number: string;
    quantity_packed: number;
    lot_number?: string;
    serial_numbers?: string[];
    expiration_date?: string;
    location?: {
      warehouse_id: string;
      zone?: string;
      bin?: string;
    };
    quality_check?: {
      inspector: string;
      inspection_date: string;
      passed: boolean;
      notes?: string;
    };
    special_handling?: string[];
    packaging_type?: string;
    status?: 'PACKED' | 'VERIFIED' | 'SHIPPED';
    metadata?: Record<string, any>;
  }
  
  class PackingListLines {
    constructor(private stateset: stateset) {}
  
    async list(packingListId?: string): Promise<PackingListLineItem[]> {
      const endpoint = packingListId 
        ? `packing_lists/${packingListId}/line_items`
        : 'packing_list_line_items';
      return this.stateset.request('GET', endpoint);
    }
  
    async get(lineItemId: string): Promise<PackingListLineItem> {
      return this.stateset.request('GET', `packing_list_line_items/${lineItemId}`);
    }
  
    async create(lineItemData: Omit<PackingListLineItem, 'id'>): Promise<PackingListLineItem> {
      return this.stateset.request('POST', 'packing_list_line_items', lineItemData);
    }
  
    async update(lineItemId: string, lineItemData: Partial<PackingListLineItem>): Promise<PackingListLineItem> {
      return this.stateset.request('PUT', `packing_list_line_items/${lineItemId}`, lineItemData);
    }
  
    async delete(lineItemId: string): Promise<void> {
      return this.stateset.request('DELETE', `packing_list_line_items/${lineItemId}`);
    }
  
    async bulkCreate(packingListId: string, lineItems: Array<Omit<PackingListLineItem, 'id' | 'packing_list_id'>>): Promise<PackingListLineItem[]> {
      return this.stateset.request('POST', `packing_lists/${packingListId}/line_items/bulk`, { line_items: lineItems });
    }
  
    async verifyItem(lineItemId: string, verificationData: {
      inspector: string;
      inspection_date: string;
      passed: boolean;
      notes?: string;
    }): Promise<PackingListLineItem> {
      return this.stateset.request('PUT', `packing_list_line_items/${lineItemId}/verify`, verificationData);
    }
  
    async updateLocation(lineItemId: string, locationData: PackingListLineItem['location']): Promise<PackingListLineItem> {
      return this.stateset.request('PUT', `packing_list_line_items/${lineItemId}/location`, locationData);
    }
  }

export default PackingListLines;