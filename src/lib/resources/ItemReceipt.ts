import type { ApiClientLike } from '../../types';
import { BaseResource } from './BaseResource';

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

class ItemReceipts extends BaseResource {
  constructor(client: ApiClientLike) {
    super(client as any, 'itemreceipts', 'itemreceipts');
    this.singleKey = 'update_itemreceipts_by_pk';
  }

  protected override mapSingle(data: any): any {
    return this.handleCommandResponse({ update_itemreceipts_by_pk: data });
  }

  protected override mapListItem(item: any): any {
    return this.mapSingle(item);
  }

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

  override async list(): Promise<ItemReceiptResponse[]> {
    return super.list();
  }

  override async get(id: string): Promise<ItemReceiptResponse> {
    return super.get(id);
  }

  override async create(data: ItemReceiptData): Promise<ItemReceiptResponse> {
    return super.create(data);
  }

  override async update(id: string, data: Partial<ItemReceiptData>): Promise<ItemReceiptResponse> {
    return super.update(id, data);
  }

  override async delete(id: string): Promise<void> {
    await super.delete(id);
  }

  async receive(id: string): Promise<ReceivedItemReceiptResponse> {
    const response = await this.client.request('POST', `itemreceipts/${id}/receive`);
    return this.handleCommandResponse(response) as ReceivedItemReceiptResponse;
  }

  async cancel(id: string): Promise<CancelledItemReceiptResponse> {
    const response = await this.client.request('POST', `itemreceipts/${id}/cancel`);
    return this.handleCommandResponse(response) as CancelledItemReceiptResponse;
  }
}

export default ItemReceipts;
