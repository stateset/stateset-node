import { stateset } from '../../stateset-client';

export type ItemReceiptStatus = 'PENDING' | 'RECEIVED' | 'PARTIAL' | 'CANCELLED';

interface BaseItemReceiptResponse {
  id: string;
  object: 'itemreceipt';
  status: ItemReceiptStatus;
}

interface PendingItemReceiptResponse extends BaseItemReceiptResponse {
  status: 'PENDING';
  pending: true;
}
interface ReceivedItemReceiptResponse extends BaseItemReceiptResponse {
  status: 'RECEIVED';
  received: true;
}
interface PartialItemReceiptResponse extends BaseItemReceiptResponse {
  status: 'PARTIAL';
  partial: true;
}
interface CancelledItemReceiptResponse extends BaseItemReceiptResponse {
  status: 'CANCELLED';
  cancelled: true;
}

export type ItemReceiptResponse =
  | PendingItemReceiptResponse
  | ReceivedItemReceiptResponse
  | PartialItemReceiptResponse
  | CancelledItemReceiptResponse;

interface ApiResponse {
  update_itemreceipts_by_pk: {
    id: string;
    status: ItemReceiptStatus;
    [key: string]: any;
  };
}

export interface ItemReceiptLine {
  item_id: string;
  quantity_received: number;
  [key: string]: any;
}

export interface ItemReceiptData {
  purchase_order_id: string;
  lines: ItemReceiptLine[];
  receipt_date: string;
  [key: string]: any;
}

class ItemReceipts {
  constructor(private stateset: stateset) {}

  private handleCommandResponse(response: any): ItemReceiptResponse {
    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.update_itemreceipts_by_pk) {
      throw new Error('Unexpected response format');
    }

    const rec = response.update_itemreceipts_by_pk;

    const base: BaseItemReceiptResponse = {
      id: rec.id,
      object: 'itemreceipt',
      status: rec.status,
    };

    switch (rec.status) {
      case 'PENDING':
        return { ...base, status: 'PENDING', pending: true };
      case 'RECEIVED':
        return { ...base, status: 'RECEIVED', received: true };
      case 'PARTIAL':
        return { ...base, status: 'PARTIAL', partial: true };
      case 'CANCELLED':
        return { ...base, status: 'CANCELLED', cancelled: true };
      default:
        throw new Error(`Unexpected item receipt status: ${rec.status}`);
    }
  }

  async list(): Promise<ItemReceiptResponse[]> {
    const response = await this.stateset.request('GET', 'itemreceipts');
    return response.map((r: any) =>
      this.handleCommandResponse({ update_itemreceipts_by_pk: r })
    );
  }

  async get(id: string): Promise<ItemReceiptResponse> {
    const response = await this.stateset.request('GET', `itemreceipts/${id}`);
    return this.handleCommandResponse({ update_itemreceipts_by_pk: response });
  }

  async create(data: ItemReceiptData): Promise<ItemReceiptResponse> {
    const response = await this.stateset.request('POST', 'itemreceipts', data);
    return this.handleCommandResponse(response);
  }

  async update(id: string, data: Partial<ItemReceiptData>): Promise<ItemReceiptResponse> {
    const response = await this.stateset.request('PUT', `itemreceipts/${id}`, data);
    return this.handleCommandResponse(response);
  }

  async delete(id: string): Promise<void> {
    await this.stateset.request('DELETE', `itemreceipts/${id}`);
  }

  async receive(id: string): Promise<ReceivedItemReceiptResponse> {
    const response = await this.stateset.request('POST', `itemreceipts/${id}/receive`);
    return this.handleCommandResponse(response) as ReceivedItemReceiptResponse;
  }

  async cancel(id: string): Promise<CancelledItemReceiptResponse> {
    const response = await this.stateset.request('POST', `itemreceipts/${id}/cancel`);
    return this.handleCommandResponse(response) as CancelledItemReceiptResponse;
  }
}

export default ItemReceipts;
