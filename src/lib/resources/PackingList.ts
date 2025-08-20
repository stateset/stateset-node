import type { ApiClientLike } from '../../types';

type PackingListStatus = 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'SHIPPED' | 'CANCELLED';

interface BasePackingListResponse {
  id: string;
  object: 'packinglist';
  status: PackingListStatus;
}

interface DraftPackingListResponse extends BasePackingListResponse {
  status: 'DRAFT';
  draft: true;
}

interface SubmittedPackingListResponse extends BasePackingListResponse {
  status: 'SUBMITTED';
  submitted: true;
}

interface VerifiedPackingListResponse extends BasePackingListResponse {
  status: 'VERIFIED';
  verified: true;
}

interface ShippedPackingListResponse extends BasePackingListResponse {
  status: 'SHIPPED';
  shipped: true;
}

interface CancelledPackingListResponse extends BasePackingListResponse {
  status: 'CANCELLED';
  cancelled: true;
}

type PackingListResponse = DraftPackingListResponse | SubmittedPackingListResponse | VerifiedPackingListResponse | ShippedPackingListResponse | CancelledPackingListResponse;



interface PackageItem {
  purchase_order_item_id: string;
  quantity: number;
  lot_number?: string;
  serial_numbers?: string[];
  expiration_date?: string;
}

interface Package {
  package_number: string;
  weight?: number;
  weight_unit?: 'LB' | 'KG';
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'IN' | 'CM';
  };
  items: PackageItem[];
}

interface PackingListData {
  purchase_order_id: string;
  shipment_date: string;
  packages: Package[];
  warehouse_id?: string;
  warehouse_location?: string;
  special_instructions?: string;
  hazmat_info?: {
    un_number?: string;
    class_division?: string;
    packing_group?: string;
  };
  quality_check?: {
    inspector: string;
    inspection_date: string;
    notes: string;
  };
  [key: string]: any;
}

class PackingList {
  constructor(private stateset: ApiClientLike) {}

  private handleCommandResponse(response: any): PackingListResponse {
    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.update_packinglists_by_pk) {
      throw new Error('Unexpected response format');
    }

    const packingListData = response.update_packinglists_by_pk;

    const baseResponse: BasePackingListResponse = {
      id: packingListData.id,
      object: 'packinglist',
      status: packingListData.status,
    };

    switch (packingListData.status) {
      case 'DRAFT':
        return { ...baseResponse, status: 'DRAFT', draft: true };
      case 'SUBMITTED':
        return { ...baseResponse, status: 'SUBMITTED', submitted: true };
      case 'VERIFIED':
        return { ...baseResponse, status: 'VERIFIED', verified: true };
      case 'SHIPPED':
        return { ...baseResponse, status: 'SHIPPED', shipped: true };
      case 'CANCELLED':
        return { ...baseResponse, status: 'CANCELLED', cancelled: true };
      default:
        throw new Error(`Unexpected packing list status: ${packingListData.status}`);
    }
  }

  /**
   * Get all packing lists
   * @returns Array of PackingListResponse objects
   */
  async list(): Promise<PackingListResponse[]> {
    const response = await this.stateset.request('GET', 'packinglists');
    return response.map((packingList: any) => this.handleCommandResponse({ update_packinglists_by_pk: packingList }));
  }

  /**
   * Get a packing list by ID
   * @param packingListId - Packing list ID
   * @returns PackingListResponse object
   */
  async get(packingListId: string): Promise<PackingListResponse> {
    const response = await this.stateset.request('GET', `packinglists/${packingListId}`);
    return this.handleCommandResponse({ update_packinglists_by_pk: response });
  }

  /**
   * Create a new packing list
   * @param packingListData - PackingListData object
   * @returns PackingListResponse object
   */
  async create(packingListData: PackingListData): Promise<PackingListResponse> {
    const response = await this.stateset.request('POST', 'packinglists', packingListData);
    return this.handleCommandResponse(response);
  }

  /**
   * Update a packing list
   * @param packingListId - Packing list ID
   * @param packingListData - Partial<PackingListData> object
   * @returns PackingListResponse object
   */
  async update(packingListId: string, packingListData: Partial<PackingListData>): Promise<PackingListResponse> {
    const response = await this.stateset.request('PUT', `packinglists/${packingListId}`, packingListData);
    return this.handleCommandResponse(response);
  }

  /**
   * Delete a packing list
   * @param packingListId - Packing list ID
   */
  async delete(packingListId: string): Promise<void> {
    await this.stateset.request('DELETE', `packinglists/${packingListId}`);
  }

  /**
   * Submit a packing list
   * @param packingListId - Packing list ID
   * @returns SubmittedPackingListResponse object
   */
  async submit(packingListId: string): Promise<SubmittedPackingListResponse> {
    const response = await this.stateset.request('POST', `packinglists/${packingListId}/submit`);
    return this.handleCommandResponse(response) as SubmittedPackingListResponse;
  }

  /**
   * Verify a packing list
   * @param packingListId - Packing list ID
   * @param verificationDetails - Verification details object
   * @returns VerifiedPackingListResponse object
   */
  async verify(packingListId: string, verificationDetails: {
    verified_by: string;
    verification_date: string;
    verification_notes?: string;
  }): Promise<VerifiedPackingListResponse> {
    const response = await this.stateset.request('POST', `packinglists/${packingListId}/verify`, verificationDetails);
    return this.handleCommandResponse(response) as VerifiedPackingListResponse;
  }

  /**
   * Mark a packing list as shipped
   * @param packingListId - Packing list ID
   * @param shippingDetails - Shipping details object
   * @returns ShippedPackingListResponse object
   */
  async markShipped(packingListId: string, shippingDetails: {
    shipped_date: string;
    shipped_by: string;
    shipping_notes?: string;
  }): Promise<ShippedPackingListResponse> {
    const response = await this.stateset.request('POST', `packinglists/${packingListId}/ship`, shippingDetails);
    return this.handleCommandResponse(response) as ShippedPackingListResponse;
  }

  /**
   * Cancel a packing list
   * @param packingListId - Packing list ID
   * @returns CancelledPackingListResponse object
   */
  async cancel(packingListId: string): Promise<CancelledPackingListResponse> {
    const response = await this.stateset.request('POST', `packinglists/${packingListId}/cancel`);
    return this.handleCommandResponse(response) as CancelledPackingListResponse;
  }

  /**
   * Add a package to a packing list
   * @param packingListId - Packing list ID
   * @param packageData - Package data object
   * @returns PackingListResponse object
   */
  async addPackage(packingListId: string, packageData: Package): Promise<PackingListResponse> {
    const response = await this.stateset.request('POST', `packinglists/${packingListId}/packages`, packageData);
    return this.handleCommandResponse(response);
  }

  /**
   * Update a package in a packing list
   * @param packingListId - Packing list ID
   * @param packageNumber - Package number
   * @param packageData - Partial<Package> object
   * @returns PackingListResponse object
   */
  async updatePackage(packingListId: string, packageNumber: string, packageData: Partial<Package>): Promise<PackingListResponse> {
    const response = await this.stateset.request('PUT', `packinglists/${packingListId}/packages/${packageNumber}`, packageData);
    return this.handleCommandResponse(response);
  }

  /**
   * Remove a package from a packing list
   * @param packingListId - Packing list ID
   * @param packageNumber - Package number
   * @returns PackingListResponse object
   */
  async removePackage(packingListId: string, packageNumber: string): Promise<PackingListResponse> {
    const response = await this.stateset.request('DELETE', `packinglists/${packingListId}/packages/${packageNumber}`);
    return this.handleCommandResponse(response);
  }

  /**
   * Add an item to a package in a packing list
   * @param packingListId - Packing list ID
   * @param packageNumber - Package number
   * @param item - PackageItem object
   * @returns PackingListResponse object
   */
  async addItemToPackage(packingListId: string, packageNumber: string, item: PackageItem): Promise<PackingListResponse> {
    const response = await this.stateset.request('POST', `packinglists/${packingListId}/packages/${packageNumber}/items`, item);
    return this.handleCommandResponse(response);
  }

  /**
   * Remove an item from a package in a packing list
   * @param packingListId - Packing list ID
   * @param packageNumber - Package number
   * @param purchaseOrderItemId - Purchase order item ID
   * @returns PackingListResponse object
   */
  async removeItemFromPackage(packingListId: string, packageNumber: string, purchaseOrderItemId: string): Promise<PackingListResponse> {
    const response = await this.stateset.request('DELETE', `packinglists/${packingListId}/packages/${packageNumber}/items/${purchaseOrderItemId}`);
    return this.handleCommandResponse(response);
  }

  /**
   * Update quality check for a packing list
   * @param packingListId - Packing list ID
   * @param qualityCheckData - Quality check data object
   * @returns PackingListResponse object
   */
  async updateQualityCheck(packingListId: string, qualityCheckData: PackingListData['quality_check']): Promise<PackingListResponse> {
    const response = await this.stateset.request('PUT', `packinglists/${packingListId}/quality-check`, qualityCheckData);
    return this.handleCommandResponse(response);
  }
}

export default PackingList;
