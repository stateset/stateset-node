import { stateset } from '../../stateset-client';

type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

interface BaseOrderResponse {
  id: string;
  object: 'order';
  status: OrderStatus;
}

interface PendingOrderResponse extends BaseOrderResponse {
  status: 'PENDING';
  pending: true;
}

interface ProcessingOrderResponse extends BaseOrderResponse {
  status: 'PROCESSING';
  processing: true;
}

interface ShippedOrderResponse extends BaseOrderResponse {
  status: 'SHIPPED';
  shipped: true;
}

interface DeliveredOrderResponse extends BaseOrderResponse {
  status: 'DELIVERED';
  delivered: true;
}

interface CancelledOrderResponse extends BaseOrderResponse {
  status: 'CANCELLED';
  cancelled: true;
}

interface RefundedOrderResponse extends BaseOrderResponse {
  status: 'REFUNDED';
  refunded: true;
}

type OrderResponse = PendingOrderResponse | ProcessingOrderResponse | ShippedOrderResponse | DeliveredOrderResponse | CancelledOrderResponse | RefundedOrderResponse;

interface ApiResponse {
  update_orders_by_pk: {
    id: string;
    status: OrderStatus;
    [key: string]: any;
  };
}

class Orders {
  constructor(private stateset: stateset) {}

  private handleCommandResponse(response: any): OrderResponse {
    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.update_orders_by_pk) {
      throw new Error('Unexpected response format');
    }

    const orderData = response.update_orders_by_pk;

    const baseResponse: BaseOrderResponse = {
      id: orderData.id,
      object: 'order',
      status: orderData.status,
    };

    switch (orderData.status) {
      case 'PENDING':
        return { ...baseResponse, status: 'PENDING', pending: true };
      case 'PROCESSING':
        return { ...baseResponse, status: 'PROCESSING', processing: true };
      case 'SHIPPED':
        return { ...baseResponse, status: 'SHIPPED', shipped: true };
      case 'DELIVERED':
        return { ...baseResponse, status: 'DELIVERED', delivered: true };
      case 'CANCELLED':
        return { ...baseResponse, status: 'CANCELLED', cancelled: true };
      case 'REFUNDED':
        return { ...baseResponse, status: 'REFUNDED', refunded: true };
      default:
        throw new Error(`Unexpected order status: ${orderData.status}`);
    }
  }

  async list() {
    return this.stateset.request('GET', 'orders');
  }

  async get(orderId: string) {
    return this.stateset.request('GET', `orders/${orderId}`);
  }

  async create(orderData: any) {
    return this.stateset.request('POST', 'orders', orderData);
  }

  async update(orderId: string, orderData: any) {
    return this.stateset.request('PUT', `orders/${orderId}`, orderData);
  }

  async delete(orderId: string) {
    return this.stateset.request('DELETE', `orders/${orderId}`);
  }

  async process(orderId: string): Promise<ProcessingOrderResponse> {
    const response = await this.stateset.request('POST', `orders/process/${orderId}`);
    return this.handleCommandResponse(response) as ProcessingOrderResponse;
  }

  async ship(orderId: string): Promise<ShippedOrderResponse> {
    const response = await this.stateset.request('POST', `orders/ship/${orderId}`);
    return this.handleCommandResponse(response) as ShippedOrderResponse;
  }

  async deliver(orderId: string): Promise<DeliveredOrderResponse> {
    const response = await this.stateset.request('POST', `orders/deliver/${orderId}`);
    return this.handleCommandResponse(response) as DeliveredOrderResponse;
  }

  async cancel(orderId: string): Promise<CancelledOrderResponse> {
    const response = await this.stateset.request('POST', `orders/cancel/${orderId}`);
    return this.handleCommandResponse(response) as CancelledOrderResponse;
  }

  async refund(orderId: string): Promise<RefundedOrderResponse> {
    const response = await this.stateset.request('POST', `orders/refund/${orderId}`);
    return this.handleCommandResponse(response) as RefundedOrderResponse;
  }
}

export default Orders;