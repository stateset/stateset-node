import { stateset } from '../../stateset-client';

// Enums for returns management
export enum ReturnStatus {
  REQUESTED = 'REQUESTED',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  AWAITING_RECEIPT = 'AWAITING_RECEIPT',
  RECEIVED = 'RECEIVED',
  INSPECTING = 'INSPECTING',
  PROCESSING_REFUND = 'PROCESSING_REFUND',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  CLOSED = 'CLOSED',
  REOPENED = 'REOPENED'
}

export enum ReturnReason {
  WRONG_ITEM = 'wrong_item',
  DEFECTIVE = 'defective',
  NOT_AS_DESCRIBED = 'not_as_described',
  DAMAGED_IN_SHIPPING = 'damaged_in_shipping',
  SIZE_FIT_ISSUE = 'size_fit_issue',
  QUALITY_ISSUE = 'quality_issue',
  ARRIVED_LATE = 'arrived_late',
  CHANGED_MIND = 'changed_mind',
  OTHER = 'other'
}

export enum ReturnCondition {
  NEW = 'new',
  LIKE_NEW = 'like_new',
  USED = 'used',
  DAMAGED = 'damaged',
  UNSALVAGEABLE = 'unsalvageable'
}

export enum RefundMethod {
  ORIGINAL_PAYMENT = 'original_payment',
  STORE_CREDIT = 'store_credit',
  BANK_TRANSFER = 'bank_transfer',
  GIFT_CARD = 'gift_card'
}

// Interfaces for return data structures
export interface ReturnItem {
  order_item_id: string;
  product_id: string;
  quantity: number;
  reason: ReturnReason;
  condition?: ReturnCondition;
  images?: string[];
  notes?: string;
  serial_number?: string;
  refund_amount: number;
  restocking_fee?: number;
}

export interface ShippingLabel {
  carrier: string;
  tracking_number: string;
  label_url: string;
  cost: number;
  created_at: string;
  expiry_date?: string;
}

export interface QualityInspection {
  inspector_id: string;
  inspection_date: string;
  condition: ReturnCondition;
  damages_found?: Array<{
    type: string;
    description: string;
    severity: 'minor' | 'moderate' | 'severe';
    images?: string[];
  }>;
  resellable: boolean;
  recommended_action: 'refurbish' | 'liquidate' | 'dispose' | 'restock';
  notes?: string;
}

export interface RefundDetails {
  method: RefundMethod;
  amount: number;
  transaction_id?: string;
  processed_at?: string;
  processor_response?: any;
  notes?: string;
}

export interface ReturnData {
  order_id: string;
  customer_id: string;
  items: ReturnItem[];
  shipping_address: {
    name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string;
  };
  return_shipping?: {
    preferred_carrier?: string;
    dropoff_location?: string;
    pickup_requested?: boolean;
    pickup_date?: string;
    special_instructions?: string;
  };
  quality_inspection?: QualityInspection;
  refund?: RefundDetails;
  shipping_label?: ShippingLabel;
  notes?: string[];
  metadata?: Record<string, any>;
  org_id?: string;
}

// Response Interfaces
interface BaseReturnResponse {
  id: string;
  object: 'return';
  rma_number: string;
  created_at: string;
  updated_at: string;
  status: ReturnStatus;
  data: ReturnData;
}

interface RequestedReturnResponse extends BaseReturnResponse {
  status: ReturnStatus.REQUESTED;
  requested: true;
}

interface PendingApprovalReturnResponse extends BaseReturnResponse {
  status: ReturnStatus.PENDING_APPROVAL;
  pendingApproval: true;
}

interface ApprovedReturnResponse extends BaseReturnResponse {
  status: ReturnStatus.APPROVED;
  approved: true;
  shipping_label: ShippingLabel;
}

interface ReceivedReturnResponse extends BaseReturnResponse {
  status: ReturnStatus.RECEIVED;
  received: true;
  received_at: string;
  received_by: string;
}

interface InspectingReturnResponse extends BaseReturnResponse {
  status: ReturnStatus.INSPECTING;
  inspecting: true;
  quality_inspection: QualityInspection;
}

interface CompletedReturnResponse extends BaseReturnResponse {
  status: ReturnStatus.COMPLETED;
  completed: true;
  refund_details: RefundDetails;
}

interface RejectedReturnResponse extends BaseReturnResponse {
  status: ReturnStatus.REJECTED;
  rejected: true;
  rejection_reason: string;
}

export type ReturnResponse =
  | RequestedReturnResponse
  | PendingApprovalReturnResponse
  | ApprovedReturnResponse
  | ReceivedReturnResponse
  | InspectingReturnResponse
  | CompletedReturnResponse
  | RejectedReturnResponse;

// Custom Error Classes
export class ReturnNotFoundError extends Error {
  constructor(returnId: string) {
    super(`Return with ID ${returnId} not found`);
    this.name = 'ReturnNotFoundError';
  }
}

export class ReturnValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReturnValidationError';
  }
}

export class ReturnStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReturnStateError';
  }
}

// Main Returns Class
class Returns {
  constructor(private readonly stateset: stateset) {}

  /**
   * List returns with optional filtering
   */
  async list(params?: {
    status?: ReturnStatus;
    customer_id?: string;
    order_id?: string;
    date_from?: Date;
    date_to?: Date;
    org_id?: string;
  }): Promise<ReturnResponse[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.status) queryParams.append('status', params.status);
    if (params?.customer_id) queryParams.append('customer_id', params.customer_id);
    if (params?.order_id) queryParams.append('order_id', params.order_id);
    if (params?.date_from) queryParams.append('date_from', params.date_from.toISOString());
    if (params?.date_to) queryParams.append('date_to', params.date_to.toISOString());
    if (params?.org_id) queryParams.append('org_id', params.org_id);

    const response = await this.stateset.request('GET', `returns?${queryParams.toString()}`);
    return response.returns;
  }

  /**
   * Get specific return by ID
   */
  async get(returnId: string): Promise<ReturnResponse> {
    try {
      const response = await this.stateset.request('GET', `returns/${returnId}`);
      return response.return;
    } catch (error: any) {
      if (error.status === 404) {
        throw new ReturnNotFoundError(returnId);
      }
      throw error;
    }
  }

  /**
   * Create new return request
   */
  async create(returnData: ReturnData): Promise<ReturnResponse> {
    // Validate return items
    if (!returnData.items.length) {
      throw new ReturnValidationError('At least one return item is required');
    }

    for (const item of returnData.items) {
      if (item.quantity <= 0) {
        throw new ReturnValidationError('Item quantity must be greater than 0');
      }
      if (item.refund_amount < 0) {
        throw new ReturnValidationError('Refund amount cannot be negative');
      }
    }

    const response = await this.stateset.request('POST', 'returns', returnData);
    return response.return;
  }

  /**
   * Update return request
   */
  async update(returnId: string, returnData: Partial<ReturnData>): Promise<ReturnResponse> {
    try {
      const response = await this.stateset.request('PUT', `returns/${returnId}`, returnData);
      return response.return;
    } catch (error: any) {
      if (error.status === 404) {
        throw new ReturnNotFoundError(returnId);
      }
      throw error;
    }
  }

  /**
   * Process return status changes
   */
  async approve(
    returnId: string,
    approvalData: {
      shipping_label: ShippingLabel;
      notes?: string;
    }
  ): Promise<ApprovedReturnResponse> {
    const response = await this.stateset.request('POST', `returns/${returnId}/approve`, approvalData);
    return response.return as ApprovedReturnResponse;
  }

  async markReceived(
    returnId: string,
    receiptData: {
      received_by: string;
      condition_notes?: string;
      images?: string[];
    }
  ): Promise<ReceivedReturnResponse> {
    const response = await this.stateset.request('POST', `returns/${returnId}/receive`, receiptData);
    return response.return as ReceivedReturnResponse;
  }

  async submitInspection(
    returnId: string,
    inspection: QualityInspection
  ): Promise<InspectingReturnResponse> {
    const response = await this.stateset.request(
      'POST',
      `returns/${returnId}/inspect`,
      inspection
    );
    return response.return as InspectingReturnResponse;
  }

  async processRefund(
    returnId: string,
    refundDetails: RefundDetails
  ): Promise<CompletedReturnResponse> {
    const response = await this.stateset.request(
      'POST',
      `returns/${returnId}/refund`,
      refundDetails
    );
    return response.return as CompletedReturnResponse;
  }

  async reject(
    returnId: string,
    rejectionData: {
      reason: string;
      notes?: string;
    }
  ): Promise<RejectedReturnResponse> {
    const response = await this.stateset.request('POST', `returns/${returnId}/reject`, rejectionData);
    return response.return as RejectedReturnResponse;
  }

  /**
   * Generate shipping label
   */
  async generateShippingLabel(
    returnId: string,
    shippingData?: {
      carrier?: string;
      service_level?: string;
      insurance_amount?: number;
    }
  ): Promise<ShippingLabel> {
    const response = await this.stateset.request(
      'POST',
      `returns/${returnId}/generate-label`,
      shippingData
    );
    return response.shipping_label;
  }

  /**
   * Get return metrics
   */
  async getMetrics(params?: {
    start_date?: Date;
    end_date?: Date;
    org_id?: string;
  }): Promise<{
    total_returns: number;
    total_refunded: number;
    average_processing_time: number;
    return_rate: number;
    reasons_breakdown: Record<ReturnReason, number>;
    status_breakdown: Record<ReturnStatus, number>;
    resellable_percentage: number;
  }> {
    const queryParams = new URLSearchParams();
    
    if (params?.start_date) queryParams.append('start_date', params.start_date.toISOString());
    if (params?.end_date) queryParams.append('end_date', params.end_date.toISOString());
    if (params?.org_id) queryParams.append('org_id', params.org_id);

    const response = await this.stateset.request(
      'GET',
      `returns/metrics?${queryParams.toString()}`
    );
    return response.metrics;
  }
}

export default Returns;