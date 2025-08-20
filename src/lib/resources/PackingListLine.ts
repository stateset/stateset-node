import type { ApiClientLike } from '../../types';

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
    constructor(private stateset: ApiClientLike) {}
  
    /**
     * Get all packing list line items
     * @param packingListId - Optional packing list ID
     * @returns Array of PackingListLineItem objects
     */
    async list(packingListId?: string): Promise<PackingListLineItem[]> {
      const endpoint = packingListId 
        ? `packing_lists/${packingListId}/line_items`
        : 'packing_list_line_items';
      return this.stateset.request('GET', endpoint);
    }
  
    /**
     * Get a packing list line item by ID
     * @param lineItemId - Packing list line item ID
     * @returns PackingListLineItem object
     */
    async get(lineItemId: string): Promise<PackingListLineItem> {
      return this.stateset.request('GET', `packing_list_line_items/${lineItemId}`);
    }
  
    /**
     * Create a new packing list line item
     * @param lineItemData - PackingListLineItem object
     * @returns PackingListLineItem object
     */
    async create(lineItemData: Omit<PackingListLineItem, 'id'>): Promise<PackingListLineItem> {
      return this.stateset.request('POST', 'packing_list_line_items', lineItemData);
    }
  
    /**
     * Update a packing list line item
     * @param lineItemId - Packing list line item ID
     * @param lineItemData - Partial<PackingListLineItem> object
     * @returns PackingListLineItem object
     */
    async update(lineItemId: string, lineItemData: Partial<PackingListLineItem>): Promise<PackingListLineItem> {
      return this.stateset.request('PUT', `packing_list_line_items/${lineItemId}`, lineItemData);
    }
  
    /**
     * Delete a packing list line item
     * @param lineItemId - Packing list line item ID
     */
    async delete(lineItemId: string): Promise<void> {
      return this.stateset.request('DELETE', `packing_list_line_items/${lineItemId}`);
    }
  
    /**
     * Bulk create packing list line items
     * @param packingListId - Packing list ID
     * @param lineItems - Array of PackingListLineItem objects
     * @returns Array of PackingListLineItem objects
     */
    async bulkCreate(packingListId: string, lineItems: Array<Omit<PackingListLineItem, 'id' | 'packing_list_id'>>): Promise<PackingListLineItem[]> {
      return this.stateset.request('POST', `packing_lists/${packingListId}/line_items/bulk`, { line_items: lineItems });
    }
  
    /**
     * Verify a packing list line item
     * @param lineItemId - Packing list line item ID
     * @param verificationData - Verification data object
     * @returns PackingListLineItem object
     */
    async verifyItem(lineItemId: string, verificationData: {
      inspector: string;
      inspection_date: string;
      passed: boolean;
      notes?: string;
    }): Promise<PackingListLineItem> {
      return this.stateset.request('PUT', `packing_list_line_items/${lineItemId}/verify`, verificationData);
    }
  
    /**
     * Update the location of a packing list line item
     * @param lineItemId - Packing list line item ID
     * @param locationData - Location data object
     * @returns PackingListLineItem object
     */
    async updateLocation(lineItemId: string, locationData: PackingListLineItem['location']): Promise<PackingListLineItem> {
      return this.stateset.request('PUT', `packing_list_line_items/${lineItemId}/location`, locationData);
    }
  }

export default PackingListLines;