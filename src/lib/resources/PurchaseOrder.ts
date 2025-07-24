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

  /**
   * List all purchase orders
   * @returns Array of PurchaseOrderResponse objects
   */
  async list(): Promise<PurchaseOrderResponse[]> {
    const response = await this.stateset.request('GET', 'purchaseorders');
    return response.map((purchaseOrder: any) => this.handleCommandResponse({ update_purchaseorders_by_pk: purchaseOrder }));
  }

  /**
   * Get a purchase order by ID
   * @param purchaseOrderId - Purchase order ID
   * @returns PurchaseOrderResponse object
   */
  async get(purchaseOrderId: string): Promise<PurchaseOrderResponse> {
    const response = await this.stateset.request('GET', `purchaseorders/${purchaseOrderId}`);
    return this.handleCommandResponse({ update_purchaseorders_by_pk: response });
  }

  /**
   * Create a new purchase order
   * @param purchaseOrderData - PurchaseOrderData object
   * @returns PurchaseOrderResponse object
   */
  async create(purchaseOrderData: PurchaseOrderData): Promise<PurchaseOrderResponse> {
    const response = await this.stateset.request('POST', 'purchaseorders', purchaseOrderData);
    return this.handleCommandResponse(response);
  }

  /**
   * Update a purchase order
   * @param purchaseOrderId - Purchase order ID
   * @param purchaseOrderData - Partial<PurchaseOrderData> object
   * @returns PurchaseOrderResponse object
   */
  async update(purchaseOrderId: string, purchaseOrderData: Partial<PurchaseOrderData>): Promise<PurchaseOrderResponse> {
    const response = await this.stateset.request('PUT', `purchaseorders/${purchaseOrderId}`, purchaseOrderData);
    return this.handleCommandResponse(response);
  }

  /**
   * Delete a purchase order
   * @param purchaseOrderId - Purchase order ID
   */
  async delete(purchaseOrderId: string): Promise<void> {
    await this.stateset.request('DELETE', `purchaseorders/${purchaseOrderId}`);
  }

  /**
   * Submit a purchase order
   * @param purchaseOrderId - Purchase order ID
   * @returns SubmittedPurchaseOrderResponse object
   */
  async submit(purchaseOrderId: string): Promise<SubmittedPurchaseOrderResponse> {
    const response = await this.stateset.request('POST', `purchaseorders/${purchaseOrderId}/submit`);
    return this.handleCommandResponse(response) as SubmittedPurchaseOrderResponse;
  }

  /**
   * Approve a purchase order
   * @param purchaseOrderId - Purchase order ID
   * @returns ApprovedPurchaseOrderResponse object
   */
  async approve(purchaseOrderId: string): Promise<ApprovedPurchaseOrderResponse> {
    const response = await this.stateset.request('POST', `purchaseorders/${purchaseOrderId}/approve`);
    return this.handleCommandResponse(response) as ApprovedPurchaseOrderResponse;
  }

  /**
   * Receive a purchase order
   * @param purchaseOrderId - Purchase order ID
   * @param receivedItems - Array of received items
   * @returns ReceivedPurchaseOrderResponse object
   */
  async receive(purchaseOrderId: string, receivedItems: { item_id: string; quantity_received: number }[]): Promise<ReceivedPurchaseOrderResponse> {
    const response = await this.stateset.request('POST', `purchaseorders/${purchaseOrderId}/receive`, { received_items: receivedItems });
    return this.handleCommandResponse(response) as ReceivedPurchaseOrderResponse;
  }

  /**
   * Cancel a purchase order
   * @param purchaseOrderId - Purchase order ID
   * @returns CancelledPurchaseOrderResponse object
   */
  async cancel(purchaseOrderId: string): Promise<CancelledPurchaseOrderResponse> {
    const response = await this.stateset.request('POST', `purchaseorders/${purchaseOrderId}/cancel`);
    return this.handleCommandResponse(response) as CancelledPurchaseOrderResponse;
  }

  /**
   * Add an item to a purchase order
   * @param purchaseOrderId - Purchase order ID
   * @param item - Item object
   * @returns PurchaseOrderResponse object
   */
  async addItem(purchaseOrderId: string, item: PurchaseOrderData['items'][0]): Promise<PurchaseOrderResponse> {
    const response = await this.stateset.request('POST', `purchaseorders/${purchaseOrderId}/items`, item);
    return this.handleCommandResponse(response);
  }

  /**
   * Remove an item from a purchase order
   * @param purchaseOrderId - Purchase order ID
   * @param itemId - Item ID
   * @returns PurchaseOrderResponse object
   */
  async removeItem(purchaseOrderId: string, itemId: string): Promise<PurchaseOrderResponse> {
    const response = await this.stateset.request('DELETE', `purchaseorders/${purchaseOrderId}/items/${itemId}`);
    return this.handleCommandResponse(response);
  }
}

export default PurchaseOrders;