import { stateset } from '../../stateset-client';

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

interface ApiResponse {
  update_packinglists_by_pk: {
    id: string;
    status: PackingListStatus;
    [key: string]: any;
  };
}

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
  constructor(private stateset: stateset) {}

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

  async list(): Promise<PackingListResponse[]> {
    const response = await this.stateset.request('GET', 'packinglists');
    return response.map((packingList: any) => this.handleCommandResponse({ update_packinglists_by_pk: packingList }));
  }

  async get(packingListId: string): Promise<PackingListResponse> {
    const response = await this.stateset.request('GET', `packinglists/${packingListId}`);
    return this.handleCommandResponse({ update_packinglists_by_pk: response });
  }

  async create(packingListData: PackingListData): Promise<PackingListResponse> {
    const response = await this.stateset.request('POST', 'packinglists', packingListData);
    return this.handleCommandResponse(response);
  }

  async update(packingListId: string, packingListData: Partial<PackingListData>): Promise<PackingListResponse> {
    const response = await this.stateset.request('PUT', `packinglists/${packingListId}`, packingListData);
    return this.handleCommandResponse(response);
  }

  async delete(packingListId: string): Promise<void> {
    await this.stateset.request('DELETE', `packinglists/${packingListId}`);
  }

  async submit(packingListId: string): Promise<SubmittedPackingListResponse> {
    const response = await this.stateset.request('POST', `packinglists/${packingListId}/submit`);
    return this.handleCommandResponse(response) as SubmittedPackingListResponse;
  }

  async verify(packingListId: string, verificationDetails: {
    verified_by: string;
    verification_date: string;
    verification_notes?: string;
  }): Promise<VerifiedPackingListResponse> {
    const response = await this.stateset.request('POST', `packinglists/${packingListId}/verify`, verificationDetails);
    return this.handleCommandResponse(response) as VerifiedPackingListResponse;
  }

  async markShipped(packingListId: string, shippingDetails: {
    shipped_date: string;
    shipped_by: string;
    shipping_notes?: string;
  }): Promise<ShippedPackingListResponse> {
    const response = await this.stateset.request('POST', `packinglists/${packingListId}/ship`, shippingDetails);
    return this.handleCommandResponse(response) as ShippedPackingListResponse;
  }

  async cancel(packingListId: string): Promise<CancelledPackingListResponse> {
    const response = await this.stateset.request('POST', `packinglists/${packingListId}/cancel`);
    return this.handleCommandResponse(response) as CancelledPackingListResponse;
  }

  async addPackage(packingListId: string, packageData: Package): Promise<PackingListResponse> {
    const response = await this.stateset.request('POST', `packinglists/${packingListId}/packages`, packageData);
    return this.handleCommandResponse(response);
  }

  async updatePackage(packingListId: string, packageNumber: string, packageData: Partial<Package>): Promise<PackingListResponse> {
    const response = await this.stateset.request('PUT', `packinglists/${packingListId}/packages/${packageNumber}`, packageData);
    return this.handleCommandResponse(response);
  }

  async removePackage(packingListId: string, packageNumber: string): Promise<PackingListResponse> {
    const response = await this.stateset.request('DELETE', `packinglists/${packingListId}/packages/${packageNumber}`);
    return this.handleCommandResponse(response);
  }

  async addItemToPackage(packingListId: string, packageNumber: string, item: PackageItem): Promise<PackingListResponse> {
    const response = await this.stateset.request('POST', `packinglists/${packingListId}/packages/${packageNumber}/items`, item);
    return this.handleCommandResponse(response);
  }

  async removeItemFromPackage(packingListId: string, packageNumber: string, purchaseOrderItemId: string): Promise<PackingListResponse> {
    const response = await this.stateset.request('DELETE', `packinglists/${packingListId}/packages/${packageNumber}/items/${purchaseOrderItemId}`);
    return this.handleCommandResponse(response);
  }

  async updateQualityCheck(packingListId: string, qualityCheckData: PackingListData['quality_check']): Promise<PackingListResponse> {
    const response = await this.stateset.request('PUT', `packinglists/${packingListId}/quality-check`, qualityCheckData);
    return this.handleCommandResponse(response);
  }
}

export default PackingList;
