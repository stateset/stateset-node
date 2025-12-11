import type { ApiClientLike } from '../../types';
import { BaseResource } from './BaseResource';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum DeliveryConfirmationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  DISPUTED = 'DISPUTED',
  FAILED = 'FAILED',
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
  constructor(
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'DeliveryConfirmationError';
  }
}

export class DeliveryConfirmationNotFoundError extends DeliveryConfirmationError {
  constructor(deliveryConfirmationId: string) {
    super(`Delivery confirmation with ID ${deliveryConfirmationId} not found`, {
      deliveryConfirmationId,
    });
  }
}

export class DeliveryConfirmationValidationError extends DeliveryConfirmationError {
  constructor(
    message: string,
    public readonly errors?: Record<string, string>
  ) {
    super(message);
  }
}

export default class DeliveryConfirmations extends BaseResource {
  constructor(client: ApiClientLike) {
    super(client as any, 'delivery_confirmations', 'delivery_confirmations');
    this.singleKey = 'delivery_confirmation';
    this.listKey = 'delivery_confirmations';
  }

  protected override mapSingle(data: any): any {
    return this.mapResponse(data);
  }

  protected override mapListItem(item: any): any {
    return this.mapResponse(item);
  }

  private validateDeliveryConfirmationData(data: DeliveryConfirmationData): void {
    if (!data.shipment_id) throw new DeliveryConfirmationValidationError('Shipment ID is required');
    if (!data.delivery_date)
      throw new DeliveryConfirmationValidationError('Delivery date is required');
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

  override async list(params?: {
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
    const requestParams: Record<string, unknown> = { ...(params || {}) };
    if (params?.date_from) requestParams.date_from = params.date_from.toISOString();
    if (params?.date_to) requestParams.date_to = params.date_to.toISOString();

    const response = await super.list(requestParams as any);
    const delivery_confirmations = (response as any).delivery_confirmations ?? response;

    return {
      delivery_confirmations,
      pagination: (response as any).pagination || {
        total: delivery_confirmations.length,
        limit: params?.limit || 100,
        offset: params?.offset || 0,
      },
    };
  }

  override async get(deliveryConfirmationId: NonEmptyString<string>): Promise<DeliveryConfirmationResponse> {
    return super.get(deliveryConfirmationId);
  }

  override async create(data: DeliveryConfirmationData): Promise<DeliveryConfirmationResponse> {
    this.validateDeliveryConfirmationData(data);
    return super.create(data);
  }

  override async update(
    deliveryConfirmationId: NonEmptyString<string>,
    data: Partial<DeliveryConfirmationData>
  ): Promise<DeliveryConfirmationResponse> {
    return super.update(deliveryConfirmationId, data);
  }

  override async delete(deliveryConfirmationId: NonEmptyString<string>): Promise<void> {
    await super.delete(deliveryConfirmationId);
  }

  async confirmDelivery(
    deliveryConfirmationId: NonEmptyString<string>,
    confirmationData: {
      recipient_name: string;
      proof_of_delivery: DeliveryConfirmationData['proof_of_delivery'];
    }
  ): Promise<DeliveryConfirmationResponse> {
    try {
      const response = await this.client.request(
        'POST',
        `delivery_confirmations/${deliveryConfirmationId}/confirm`,
        confirmationData
      );
      return this.mapResponse((response as any).delivery_confirmation ?? response);
    } catch (error: any) {
      throw this.handleError(error, 'confirmDelivery', deliveryConfirmationId);
    }
  }

  private handleError(error: any, _operation: string, _deliveryConfirmationId?: string): never {
    throw error;
  }
}
