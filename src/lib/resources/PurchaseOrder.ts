import { stateset } from '../../stateset-client';

type PurchaseOrderStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'RECEIVED' | 'CANCELLED';

interface BasePurchaseOrderResponse {
  id: string;
  object: 'purchaseorder';
  status: PurchaseOrderStatus;
}

interface DraftPurchaseOrderResponse extends BasePurchaseOrderResponse {
  status: 'DRAFT';
  draft: true;
}

interface SubmittedPurchaseOrderResponse extends BasePurchaseOrderResponse {
  status: 'SUBMITTED';
  submitted: true;
}

interface ApprovedPurchaseOrderResponse extends BasePurchaseOrderResponse {
  status: 'APPROVED';
  approved: true;
}

interface ReceivedPurchaseOrderResponse extends BasePurchaseOrderResponse {
  status: 'RECEIVED';
  received: true;
}

interface CancelledPurchaseOrderResponse extends BasePurchaseOrderResponse {
  status: 'CANCELLED';
  cancelled: true;
}

type PurchaseOrderResponse = DraftPurchaseOrderResponse | SubmittedPurchaseOrderResponse | ApprovedPurchaseOrderResponse | ReceivedPurchaseOrderResponse | CancelledPurchaseOrderResponse;

interface ApiResponse {
  update_purchaseorders_by_pk: {
    id: string;
    status: PurchaseOrderStatus;
    [key: string]: any;
  };
}

interface PurchaseOrderData {
  supplier_id: string;
  expected_delivery_date: string;
  items: {
    item_id: string;
    quantity: number;
    unit_price: number;
  }[];
  [key: string]: any;
}

class PurchaseOrders {
  constructor(private stateset: stateset) {}

  private handleCommandResponse(response: any): PurchaseOrderResponse {
    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.update_purchaseorders_by_pk) {
      throw new Error('Unexpected response format');
    }

    const purchaseOrderData = response.update_purchaseorders_by_pk;

    const baseResponse: BasePurchaseOrderResponse = {
      id: purchaseOrderData.id,
      object: 'purchaseorder',
      status: purchaseOrderData.status,
    };

    switch (purchaseOrderData.status) {
      case 'DRAFT':
        return { ...baseResponse, status: 'DRAFT', draft: true };
      case 'SUBMITTED':
        return { ...baseResponse, status: 'SUBMITTED', submitted: true };
      case 'APPROVED':
        return { ...baseResponse, status: 'APPROVED', approved: true };
      case 'RECEIVED':
        return { ...baseResponse, status: 'RECEIVED', received: true };
      case 'CANCELLED':
        return { ...baseResponse, status: 'CANCELLED', cancelled: true };
      default:
        throw new Error(`Unexpected purchase order status: ${purchaseOrderData.status}`);
    }
  }

  async list(): Promise<PurchaseOrderResponse[]> {
    const response = await this.stateset.request('GET', 'purchaseorders');
    return response.map((purchaseOrder: any) => this.handleCommandResponse({ update_purchaseorders_by_pk: purchaseOrder }));
  }

  async get(purchaseOrderId: string): Promise<PurchaseOrderResponse> {
    const response = await this.stateset.request('GET', `purchaseorders/${purchaseOrderId}`);
    return this.handleCommandResponse({ update_purchaseorders_by_pk: response });
  }

  async create(purchaseOrderData: PurchaseOrderData): Promise<PurchaseOrderResponse> {
    const response = await this.stateset.request('POST', 'purchaseorders', purchaseOrderData);
    return this.handleCommandResponse(response);
  }

  async update(purchaseOrderId: string, purchaseOrderData: Partial<PurchaseOrderData>): Promise<PurchaseOrderResponse> {
    const response = await this.stateset.request('PUT', `purchaseorders/${purchaseOrderId}`, purchaseOrderData);
    return this.handleCommandResponse(response);
  }

  async delete(purchaseOrderId: string): Promise<void> {
    await this.stateset.request('DELETE', `purchaseorders/${purchaseOrderId}`);
  }

  async submit(purchaseOrderId: string): Promise<SubmittedPurchaseOrderResponse> {
    const response = await this.stateset.request('POST', `purchaseorders/${purchaseOrderId}/submit`);
    return this.handleCommandResponse(response) as SubmittedPurchaseOrderResponse;
  }

  async approve(purchaseOrderId: string): Promise<ApprovedPurchaseOrderResponse> {
    const response = await this.stateset.request('POST', `purchaseorders/${purchaseOrderId}/approve`);
    return this.handleCommandResponse(response) as ApprovedPurchaseOrderResponse;
  }

  async receive(purchaseOrderId: string, receivedItems: { item_id: string; quantity_received: number }[]): Promise<ReceivedPurchaseOrderResponse> {
    const response = await this.stateset.request('POST', `purchaseorders/${purchaseOrderId}/receive`, { received_items: receivedItems });
    return this.handleCommandResponse(response) as ReceivedPurchaseOrderResponse;
  }

  async cancel(purchaseOrderId: string): Promise<CancelledPurchaseOrderResponse> {
    const response = await this.stateset.request('POST', `purchaseorders/${purchaseOrderId}/cancel`);
    return this.handleCommandResponse(response) as CancelledPurchaseOrderResponse;
  }

  async addItem(purchaseOrderId: string, item: PurchaseOrderData['items'][0]): Promise<PurchaseOrderResponse> {
    const response = await this.stateset.request('POST', `purchaseorders/${purchaseOrderId}/items`, item);
    return this.handleCommandResponse(response);
  }

  async removeItem(purchaseOrderId: string, itemId: string): Promise<PurchaseOrderResponse> {
    const response = await this.stateset.request('DELETE', `purchaseorders/${purchaseOrderId}/items/${itemId}`);
    return this.handleCommandResponse(response);
  }
}

export default PurchaseOrders;