import type { ApiClientLike } from '../../types';
import { BaseResource } from './BaseResource';

export type CashSaleStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';

interface BaseCashSaleResponse {
  id: string;
  object: 'cashsale';
  status: CashSaleStatus;
}

interface PendingCashSaleResponse extends BaseCashSaleResponse {
  status: 'PENDING';
  pending: true;
}
interface CompletedCashSaleResponse extends BaseCashSaleResponse {
  status: 'COMPLETED';
  completed: true;
}
interface CancelledCashSaleResponse extends BaseCashSaleResponse {
  status: 'CANCELLED';
  cancelled: true;
}
interface RefundedCashSaleResponse extends BaseCashSaleResponse {
  status: 'REFUNDED';
  refunded: true;
}

export type CashSaleResponse =
  | PendingCashSaleResponse
  | CompletedCashSaleResponse
  | CancelledCashSaleResponse
  | RefundedCashSaleResponse;

export interface CashSaleLine {
  item_id: string;
  quantity: number;
  unit_price: number;
  [key: string]: any;
}

export interface CashSaleData {
  customer_id: string;
  sale_date: string;
  lines: CashSaleLine[];
  [key: string]: any;
}

class CashSales extends BaseResource {
  constructor(client: ApiClientLike) {
    super(client as any, 'cashsales', 'cashsales');
    this.singleKey = 'update_cashsales_by_pk';
  }

  protected override mapSingle(data: any): any {
    return this.handleCommandResponse({ update_cashsales_by_pk: data });
  }

  protected override mapListItem(item: any): any {
    return this.mapSingle(item);
  }

  private handleCommandResponse(response: any): CashSaleResponse {
    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.update_cashsales_by_pk) {
      throw new Error('Unexpected response format');
    }

    const sale = response.update_cashsales_by_pk;

    const base: BaseCashSaleResponse = {
      id: sale.id,
      object: 'cashsale',
      status: sale.status,
    };

    switch (sale.status) {
      case 'PENDING':
        return { ...base, status: 'PENDING', pending: true };
      case 'COMPLETED':
        return { ...base, status: 'COMPLETED', completed: true };
      case 'CANCELLED':
        return { ...base, status: 'CANCELLED', cancelled: true };
      case 'REFUNDED':
        return { ...base, status: 'REFUNDED', refunded: true };
      default:
        throw new Error(`Unexpected cash sale status: ${sale.status}`);
    }
  }

  override async list(): Promise<CashSaleResponse[]> {
    return super.list();
  }

  override async get(id: string): Promise<CashSaleResponse> {
    return super.get(id);
  }

  override async create(data: CashSaleData): Promise<CashSaleResponse> {
    return super.create(data);
  }

  override async update(id: string, data: Partial<CashSaleData>): Promise<CashSaleResponse> {
    return super.update(id, data);
  }

  override async delete(id: string): Promise<void> {
    await super.delete(id);
  }

  async complete(id: string): Promise<CompletedCashSaleResponse> {
    const response = await this.client.request('POST', `cashsales/${id}/complete`);
    return this.handleCommandResponse(response) as CompletedCashSaleResponse;
  }

  async refund(id: string): Promise<RefundedCashSaleResponse> {
    const response = await this.client.request('POST', `cashsales/${id}/refund`);
    return this.handleCommandResponse(response) as RefundedCashSaleResponse;
  }

  async cancel(id: string): Promise<CancelledCashSaleResponse> {
    const response = await this.client.request('POST', `cashsales/${id}/cancel`);
    return this.handleCommandResponse(response) as CancelledCashSaleResponse;
  }
}

export default CashSales;
