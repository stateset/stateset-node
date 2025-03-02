import { stateset } from '../../stateset-client';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum DeliveryConfirmationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  DISPUTED = 'DISPUTED',
  FAILED = 'FAILED'
}

// Interfaces
export interface DeliveryConfirmationData {
  shipment_id: NonEmptyString<string>;
  status: DeliveryConfirmationStatus;
  delivery_date: Timestamp;
  recipient_name?: string;
  proof_of_delivery?: {
    signature_url?: string;
    photo_url?: string;
    notes?: string;
  };
  confirmed_by?: NonEmptyString<string>; // User or Customer ID
  created_at: Timestamp;
  updated_at: Timestamp;
  org_id?: string;
  metadata?: Record<string, any>;
}

// Response Type
export interface DeliveryConfirmationResponse {
  id: NonEmptyString<string>;
  object: 'delivery_confirmation';
  data: DeliveryConfirmationData;
}

// Error Classes
export class DeliveryConfirmationError extends Error {
  constructor(message: string, public readonly details?: Record<string, unknown>) {
    super(message);
    this.name = 'DeliveryConfirmationError';
  }
}

export class DeliveryConfirmationNotFoundError extends DeliveryConfirmationError {
  constructor(deliveryConfirmationId: string) {
    super(`Delivery confirmation with ID ${deliveryConfirmationId} not found`, { deliveryConfirmationId });
  }
}

export class DeliveryConfirmationValidationError extends DeliveryConfirmationError {
  constructor(message: string, public readonly errors?: Record<string, string>) {
    super(message);
  }
}

export default class DeliveryConfirmations {
  constructor(private readonly stateset: stateset) {}

  private validateDeliveryConfirmationData(data: DeliveryConfirmationData): void {
    if (!data.shipment_id) throw new DeliveryConfirmationValidationError('Shipment ID is required');
    if (!data.delivery_date) throw new DeliveryConfirmationValidationError('Delivery date is required');
  }

  private mapResponse(data: any): DeliveryConfirmationResponse {
    if (!data?.id) throw new DeliveryConfirmationError('Invalid response format');
    return {
      id: data.id,
      object: 'delivery_confirmation',
      data: {
        shipment_id: data.shipment_id,
        status: data.status,
        delivery_date: data.delivery_date,
        recipient_name: data.recipient_name,
        proof_of_delivery: data.proof_of_delivery,
        confirmed_by: data.confirmed_by,
        created_at: data.created_at,
        updated_at: data.updated_at,
        org_id: data.org_id,
        metadata: data.metadata,
      },
    };
  }

  async list(params?: {
    shipment_id?: string;
    status?: DeliveryConfirmationStatus;
    org_id?: string;
    date_from?: Date;
    date_to?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{
    delivery_confirmations: DeliveryConfirmationResponse[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.shipment_id) queryParams.append('shipment_id', params.shipment_id);
      if (params.status) queryParams.append('status', params.status);
      if (params.org_id) queryParams.append('org_id', params.org_id);
      if (params.date_from) queryParams.append('date_from', params.date_from.toISOString());
      if (params.date_to) queryParams.append('date_to', params.date_to.toISOString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
    }

    try {
      const response = await this.stateset.request('GET', `delivery_confirmations?${queryParams.toString()}`);
      return {
        delivery_confirmations: response.delivery_confirmations.map(this.mapResponse),
        pagination: {
          total: response.total || response.delivery_confirmations.length,
          limit: params?.limit || 100,
          offset: params?.offset || 0,
        },
      };
    } catch (error: any) {
      throw this.handleError(error, 'list');
    }
  }

  async get(deliveryConfirmationId: NonEmptyString<string>): Promise<DeliveryConfirmationResponse> {
    try {
      const response = await this.stateset.request('GET', `delivery_confirmations/${deliveryConfirmationId}`);
      return this.mapResponse(response.delivery_confirmation);
    } catch (error: any) {
      throw this.handleError(error, 'get', deliveryConfirmationId);
    }
  }

  async create(data: DeliveryConfirmationData): Promise<DeliveryConfirmationResponse> {
    this.validateDeliveryConfirmationData(data);
    try {
      const response = await this.stateset.request('POST', 'delivery_confirmations', data);
      return this.mapResponse(response.delivery_confirmation);
    } catch (error: any) {
      throw this.handleError(error, 'create');
    }
  }

  async update(
    deliveryConfirmationId: NonEmptyString<string>,
    data: Partial<DeliveryConfirmationData>
  ): Promise<DeliveryConfirmationResponse> {
    try {
      const response = await this.stateset.request('PUT', `delivery_confirmations/${deliveryConfirmationId}`, data);
      return this.mapResponse(response.delivery_confirmation);
    } catch (error: any) {
      throw this.handleError(error, 'update', deliveryConfirmationId);
    }
  }

  async delete(deliveryConfirmationId: NonEmptyString<string>): Promise<void> {
    try {
      await this.stateset.request('DELETE', `delivery_confirmations/${deliveryConfirmationId}`);
    } catch (error: any) {
      throw this.handleError(error, 'delete', deliveryConfirmationId);
    }
  }

  async confirmDelivery(
    deliveryConfirmationId: NonEmptyString<string>,
    confirmationData: { recipient_name: string; proof_of_delivery: DeliveryConfirmationData['proof_of_delivery'] }
  ): Promise<DeliveryConfirmationResponse> {
    try {
      const response = await this.stateset.request(
        'POST',
        `delivery_confirmations/${deliveryConfirmationId}/confirm`,
        confirmationData
      );
      return this.mapResponse(response.delivery_confirmation);
    } catch (error: any) {
      throw this.handleError(error, 'confirmDelivery', deliveryConfirmationId);
    }
  }

  private handleError(error: any, operation: string, deliveryConfirmationId?: string): never {
    if (error.status === 404) throw new DeliveryConfirmationNotFoundError(deliveryConfirmationId || 'unknown');
    if (error.status === 400) throw new DeliveryConfirmationValidationError(error.message, error.errors);
    throw new DeliveryConfirmationError(
      `Failed to ${operation} delivery confirmation: ${error.message}`,
      { operation, originalError: error }
    );
  }
}