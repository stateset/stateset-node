import { stateset } from '../../stateset-client';

// ASN Line Items
interface ASNLineItem {
    id: string;
    asn_id: string;
    purchase_order_line_item_id: string;
    quantity_shipped: number;
    package_number?: string;
    lot_number?: string;
    serial_numbers?: string[];
    expiration_date?: string;
    weight?: number;
    weight_unit?: 'LB' | 'KG';
    customs_value?: number;
    customs_currency?: string;
    country_of_origin?: string;
    hazmat_info?: {
      un_number?: string;
      class_division?: string;
      packing_group?: string;
    };
    status?: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED';
    metadata?: Record<string, any>;
  }
  
  class ASNLines {
    constructor(private stateset: stateset) {}
  
    /**
     * List ASN line items
     * @param asnId - ASN ID
     * @returns Array of ASNLineItem objects
     */
    async list(asnId?: string): Promise<ASNLineItem[]> {
      const endpoint = asnId 
        ? `asns/${asnId}/line_items`
        : 'asn_line_items';
      return this.stateset.request('GET', endpoint);
    }
  
    /**
     * Get ASN line item
     * @param lineItemId - Line item ID
     * @returns ASNLineItem object
     */
    async get(lineItemId: string): Promise<ASNLineItem> {
      return this.stateset.request('GET', `asn_line_items/${lineItemId}`);
    }
  
    /**
     * Create ASN line item
     * @param lineItemData - ASNLineItem object
     * @returns ASNLineItem object
     */
    async create(lineItemData: Omit<ASNLineItem, 'id'>): Promise<ASNLineItem> {
      return this.stateset.request('POST', 'asn_line_items', lineItemData);
    }
  
    /**
     * Update ASN line item
     * @param lineItemId - Line item ID
     * @param lineItemData - Partial<ASNLineItem> object
     * @returns ASNLineItem object
     */
    async update(lineItemId: string, lineItemData: Partial<ASNLineItem>): Promise<ASNLineItem> {
      return this.stateset.request('PUT', `asn_line_items/${lineItemId}`, lineItemData);
    }
  
    /**
     * Delete ASN line item
     * @param lineItemId - Line item ID
     */
    async delete(lineItemId: string): Promise<void> {
      return this.stateset.request('DELETE', `asn_line_items/${lineItemId}`);
    }
  
    /**
     * Bulk create ASN line items
     * @param asnId - ASN ID
     * @param lineItems - Array of ASNLineItem objects
     * @returns Array of ASNLineItem objects
     */
    async bulkCreate(asnId: string, lineItems: Array<Omit<ASNLineItem, 'id' | 'asn_id'>>): Promise<ASNLineItem[]> {
      return this.stateset.request('POST', `asns/${asnId}/line_items/bulk`, { line_items: lineItems });
    }
  
    /**
     * Update tracking information for ASN line item
     * @param lineItemId - Line item ID
     * @param trackingInfo - TrackingInfo object
     * @returns ASNLineItem object
     */
    async updateTrackingInfo(lineItemId: string, trackingInfo: {
      package_number?: string;
      tracking_number?: string;
      carrier_status?: string;
    }): Promise<ASNLineItem> {
      return this.stateset.request('PUT', `asn_line_items/${lineItemId}/tracking`, trackingInfo);
    }
  }

export default ASNLines;