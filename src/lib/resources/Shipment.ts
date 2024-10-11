import { stateset } from '../../stateset-client';

type ShipmentStatus = 'PENDING' | 'SHIPPED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';

interface BaseShipmentResponse {
  id: string;
  object: 'shipment';
  status: ShipmentStatus;
}

interface PendingShipmentResponse extends BaseShipmentResponse {
  status: 'PENDING';
  pending: true;
}

interface ShippedShipmentResponse extends BaseShipmentResponse {
  status: 'SHIPPED';
  shipped: true;
}

interface InTransitShipmentResponse extends BaseShipmentResponse {
  status: 'IN_TRANSIT';
  inTransit: true;
}

interface DeliveredShipmentResponse extends BaseShipmentResponse {
  status: 'DELIVERED';
  delivered: true;
}

interface CancelledShipmentResponse extends BaseShipmentResponse {
  status: 'CANCELLED';
  cancelled: true;
}

type ShipmentResponse = PendingShipmentResponse | ShippedShipmentResponse | InTransitShipmentResponse | DeliveredShipmentResponse | CancelledShipmentResponse;

interface ApiResponse {
  update_shipments_by_pk: {
    id: string;
    status: ShipmentStatus;
    [key: string]: any;
  };
}

interface ShipmentData {
  order_id: string;
  carrier: string;
  tracking_number: string;
  estimated_delivery_date: string;
  items: {
    item_id: string;
    quantity: number;
  }[];
  shipping_address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  [key: string]: any;
}

class Shipments {
  constructor(private stateset: stateset) {}

  private handleCommandResponse(response: any): ShipmentResponse {
    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.update_shipments_by_pk) {
      throw new Error('Unexpected response format');
    }

    const shipmentData = response.update_shipments_by_pk;

    const baseResponse: BaseShipmentResponse = {
      id: shipmentData.id,
      object: 'shipment',
      status: shipmentData.status,
    };

    switch (shipmentData.status) {
      case 'PENDING':
        return { ...baseResponse, status: 'PENDING', pending: true };
      case 'SHIPPED':
        return { ...baseResponse, status: 'SHIPPED', shipped: true };
      case 'IN_TRANSIT':
        return { ...baseResponse, status: 'IN_TRANSIT', inTransit: true };
      case 'DELIVERED':
        return { ...baseResponse, status: 'DELIVERED', delivered: true };
      case 'CANCELLED':
        return { ...baseResponse, status: 'CANCELLED', cancelled: true };
      default:
        throw new Error(`Unexpected shipment status: ${shipmentData.status}`);
    }
  }

  async list(): Promise<ShipmentResponse[]> {
    const response = await this.stateset.request('GET', 'shipments');
    return response.map((shipment: any) => this.handleCommandResponse({ update_shipments_by_pk: shipment }));
  }

  async get(shipmentId: string): Promise<ShipmentResponse> {
    const response = await this.stateset.request('GET', `shipments/${shipmentId}`);
    return this.handleCommandResponse({ update_shipments_by_pk: response });
  }

  async create(shipmentData: ShipmentData): Promise<ShipmentResponse> {
    const response = await this.stateset.request('POST', 'shipments', shipmentData);
    return this.handleCommandResponse(response);
  }

  async update(shipmentId: string, shipmentData: Partial<ShipmentData>): Promise<ShipmentResponse> {
    const response = await this.stateset.request('PUT', `shipments/${shipmentId}`, shipmentData);
    return this.handleCommandResponse(response);
  }

  async delete(shipmentId: string): Promise<void> {
    await this.stateset.request('DELETE', `shipments/${shipmentId}`);
  }

  async ship(shipmentId: string): Promise<ShippedShipmentResponse> {
    const response = await this.stateset.request('POST', `shipments/${shipmentId}/ship`);
    return this.handleCommandResponse(response) as ShippedShipmentResponse;
  }

  async markInTransit(shipmentId: string): Promise<InTransitShipmentResponse> {
    const response = await this.stateset.request('POST', `shipments/${shipmentId}/in-transit`);
    return this.handleCommandResponse(response) as InTransitShipmentResponse;
  }

  async markDelivered(shipmentId: string): Promise<DeliveredShipmentResponse> {
    const response = await this.stateset.request('POST', `shipments/${shipmentId}/delivered`);
    return this.handleCommandResponse(response) as DeliveredShipmentResponse;
  }

  async cancel(shipmentId: string): Promise<CancelledShipmentResponse> {
    const response = await this.stateset.request('POST', `shipments/${shipmentId}/cancel`);
    return this.handleCommandResponse(response) as CancelledShipmentResponse;
  }

  async updateTracking(shipmentId: string, trackingNumber: string): Promise<ShipmentResponse> {
    const response = await this.stateset.request('PUT', `shipments/${shipmentId}/tracking`, { tracking_number: trackingNumber });
    return this.handleCommandResponse(response);
  }

  async addItem(shipmentId: string, item: ShipmentData['items'][0]): Promise<ShipmentResponse> {
    const response = await this.stateset.request('POST', `shipments/${shipmentId}/items`, item);
    return this.handleCommandResponse(response);
  }

  async removeItem(shipmentId: string, itemId: string): Promise<ShipmentResponse> {
    const response = await this.stateset.request('DELETE', `shipments/${shipmentId}/items/${itemId}`);
    return this.handleCommandResponse(response);
  }
}

export default Shipments;