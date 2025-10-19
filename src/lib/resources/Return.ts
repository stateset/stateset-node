import type { ApiClientLike } from '../../types';

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
  REOPENED = 'REOPENED',
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
  OTHER = 'other',
}

export enum ReturnCondition {
  NEW = 'new',
  LIKE_NEW = 'like_new',
  USED = 'used',
  DAMAGED = 'damaged',
  UNSALVAGEABLE = 'unsalvageable',
}

export enum RefundMethod {
  ORIGINAL_PAYMENT = 'original_payment',
  STORE_CREDIT = 'store_credit',
  BANK_TRANSFER = 'bank_transfer',
  GIFT_CARD = 'gift_card',
}

export enum RecommendedAction {
  REFURBISH = 'refurbish',
  LIQUIDATE = 'liquidate',
  DISPOSE = 'dispose',
  RESTOCK = 'restock',
}

export enum DamageSeverity {
  MINOR = 'minor',
  MODERATE = 'moderate',
  SEVERE = 'severe',
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

export interface Damage {
  type: string;
  description: string;
  severity: DamageSeverity;
  images?: string[];
}

export interface QualityInspection {
  inspector_id: string;
  inspection_date: string;
  condition: ReturnCondition;
  damages_found?: Damage[];
  resellable: boolean;
  recommended_action: RecommendedAction;
  notes?: string;
}

export interface RefundDetails {
  method: RefundMethod;
  amount: number;
  transaction_id?: string;
  processed_at?: string;
  processor_response?: Record<string, any>;
  notes?: string;
}

export interface Address {
  name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
}

export interface ReturnShipping {
  preferred_carrier?: string;
  dropoff_location?: string;
  pickup_requested?: boolean;
  pickup_date?: string;
  special_instructions?: string;
}

export interface ReturnData {
  order_id: string;
  customer_id: string;
  items: ReturnItem[];
  shipping_address: Address;
  return_shipping?: ReturnShipping;
  quality_inspection?: QualityInspection;
  refund?: RefundDetails;
  shipping_label?: ShippingLabel;
  notes?: string[];
  metadata?: Record<string, any>;
  org_id?: string;
}

// Response Interfaces
export interface BaseReturnResponse {
  id: string;
  object: 'return';
  rma_number: string;
  created_at: string;
  updated_at: string;
  status: ReturnStatus;
  data: ReturnData;
}

export interface RequestedReturnResponse extends BaseReturnResponse {
  status: ReturnStatus.REQUESTED;
  requested: true;
}

export interface PendingApprovalReturnResponse extends BaseReturnResponse {
  status: ReturnStatus.PENDING_APPROVAL;
  pendingApproval: true;
}

export interface ApprovedReturnResponse extends BaseReturnResponse {
  status: ReturnStatus.APPROVED;
  approved: true;
  shipping_label: ShippingLabel;
}

export interface AwaitingReceiptReturnResponse extends BaseReturnResponse {
  status: ReturnStatus.AWAITING_RECEIPT;
  awaitingReceipt: true;
  shipping_label: ShippingLabel;
}

export interface ReceivedReturnResponse extends BaseReturnResponse {
  status: ReturnStatus.RECEIVED;
  received: true;
  received_at: string;
  received_by: string;
}

export interface InspectingReturnResponse extends BaseReturnResponse {
  status: ReturnStatus.INSPECTING;
  inspecting: true;
  quality_inspection: QualityInspection;
}

export interface ProcessingRefundReturnResponse extends BaseReturnResponse {
  status: ReturnStatus.PROCESSING_REFUND;
  processingRefund: true;
}

export interface CompletedReturnResponse extends BaseReturnResponse {
  status: ReturnStatus.COMPLETED;
  completed: true;
  refund_details: RefundDetails;
}

export interface RejectedReturnResponse extends BaseReturnResponse {
  status: ReturnStatus.REJECTED;
  rejected: true;
  rejection_reason: string;
}

export interface CancelledReturnResponse extends BaseReturnResponse {
  status: ReturnStatus.CANCELLED;
  cancelled: true;
  cancellation_reason?: string;
}

export interface ClosedReturnResponse extends BaseReturnResponse {
  status: ReturnStatus.CLOSED;
  closed: true;
  closed_reason?: string;
}

export interface ReopenedReturnResponse extends BaseReturnResponse {
  status: ReturnStatus.REOPENED;
  reopened: true;
  reopen_reason: string;
}

export type ReturnResponse =
  | RequestedReturnResponse
  | PendingApprovalReturnResponse
  | ApprovedReturnResponse
  | AwaitingReceiptReturnResponse
  | ReceivedReturnResponse
  | InspectingReturnResponse
  | ProcessingRefundReturnResponse
  | CompletedReturnResponse
  | RejectedReturnResponse
  | CancelledReturnResponse
  | ClosedReturnResponse
  | ReopenedReturnResponse;

// Return Metrics interface
export interface ReturnMetrics {
  total_returns: number;
  total_refunded: number;
  average_processing_time: number;
  return_rate: number;
  reasons_breakdown: Record<ReturnReason, number>;
  status_breakdown: Record<ReturnStatus, number>;
  resellable_percentage: number;
  monthly_trends?: {
    month: string;
    count: number;
    value: number;
  }[];
  top_returned_products?: {
    product_id: string;
    name?: string;
    count: number;
    return_rate: number;
  }[];
}

// List params interface
export interface ReturnListParams {
  status?: ReturnStatus;
  customer_id?: string;
  order_id?: string;
  date_from?: Date;
  date_to?: Date;
  org_id?: string;
  limit?: number;
  offset?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Metrics params interface
export interface ReturnMetricsParams {
  start_date?: Date;
  end_date?: Date;
  org_id?: string;
  include_monthly_trends?: boolean;
  include_top_products?: boolean;
  product_limit?: number;
}

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
  constructor(currentState: ReturnStatus, requiredState: ReturnStatus | ReturnStatus[]) {
    const stateMessage = Array.isArray(requiredState)
      ? `one of [${requiredState.join(', ')}]`
      : requiredState;
    super(
      `Invalid state transition. Current state: ${currentState}, required state: ${stateMessage}`
    );
    this.name = 'ReturnStateError';
  }
}

export class ReturnApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ReturnApiError';
    this.status = status;
    this.code = code;
  }
}

// Request and transaction logging - optional
export interface Logger {
  debug(message: string, meta?: Record<string, any>): void;
  info(message: string, meta?: Record<string, any>): void;
  warn(message: string, meta?: Record<string, any>): void;
  error(message: string, meta?: Record<string, any>): void;
}

// Default no-op logger
const defaultLogger: Logger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
};

// Main Returns Class
class Returns {
  private readonly logger: Logger;

  constructor(
    private readonly stateset: ApiClientLike,
    options?: {
      logger?: Logger;
    }
  ) {
    this.logger = options?.logger || defaultLogger;
  }

  /**
   * List returns with optional filtering
   * @param params - Filtering parameters
   * @returns Array of ReturnResponse objects and pagination data
   */
  async list(params?: ReturnListParams): Promise<{
    returns: ReturnResponse[];
    total_count: number;
    limit: number;
    offset: number;
  }> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.status) queryParams.append('status', params.status);
      if (params?.customer_id) queryParams.append('customer_id', params.customer_id);
      if (params?.order_id) queryParams.append('order_id', params.order_id);
      if (params?.date_from) queryParams.append('date_from', params.date_from.toISOString());
      if (params?.date_to) queryParams.append('date_to', params.date_to.toISOString());
      if (params?.org_id) queryParams.append('org_id', params.org_id);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
      if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
      if (params?.sort_order) queryParams.append('sort_order', params.sort_order);

      this.logger.debug('Listing returns', { params });
      const response = await this.stateset.request('GET', `returns?${queryParams.toString()}`);
      return {
        returns: response.returns,
        total_count: response.total_count,
        limit: response.limit,
        offset: response.offset,
      };
    } catch (error: any) {
      this.logger.error('Error listing returns', { error, params });
      this.handleApiError(error);
    }
  }

  /**
   * Get specific return by ID
   * @param returnId - Return ID
   * @returns ReturnResponse object
   */
  async get(returnId: string): Promise<ReturnResponse> {
    try {
      this.logger.debug('Getting return', { returnId });
      const response = await this.stateset.request('GET', `returns/${returnId}`);
      return response.return;
    } catch (error: any) {
      this.logger.error('Error getting return', { error, returnId });
      if (error.status === 404) {
        throw new ReturnNotFoundError(returnId);
      }
      this.handleApiError(error);
    }
  }

  /**
   * Create new return request
   * @param returnData - ReturnData object
   * @returns ReturnResponse object
   */
  async create(returnData: ReturnData): Promise<ReturnResponse> {
    try {
      // Validate return items
      if (!returnData.items || !returnData.items.length) {
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

      this.logger.debug('Creating return', {
        order_id: returnData.order_id,
        customer_id: returnData.customer_id,
        item_count: returnData.items.length,
      });
      const response = await this.stateset.request('POST', 'returns', returnData);
      return response.return;
    } catch (error: any) {
      this.logger.error('Error creating return', {
        error,
        order_id: returnData.order_id,
        customer_id: returnData.customer_id,
      });
      this.handleApiError(error);
    }
  }

  /**
   * Update return request
   * @param returnId - Return ID
   * @param returnData - Partial<ReturnData> object
   * @returns ReturnResponse object
   */
  async update(returnId: string, returnData: Partial<ReturnData>): Promise<ReturnResponse> {
    try {
      this.logger.debug('Updating return', { returnId });
      const response = await this.stateset.request('PUT', `returns/${returnId}`, returnData);
      return response.return;
    } catch (error: any) {
      this.logger.error('Error updating return', { error, returnId });
      if (error.status === 404) {
        throw new ReturnNotFoundError(returnId);
      }
      this.handleApiError(error);
    }
  }

  /**
   * Process return status changes
   * @param returnId - Return ID
   * @param approvalData - Approval data object
   * @returns ApprovedReturnResponse object
   */
  async approve(
    returnId: string,
    approvalData: {
      shipping_label?: ShippingLabel;
      notes?: string;
    }
  ): Promise<ApprovedReturnResponse> {
    try {
      this.logger.debug('Approving return', { returnId });
      const response = await this.stateset.request(
        'POST',
        `returns/${returnId}/approve`,
        approvalData
      );
      return response.return as ApprovedReturnResponse;
    } catch (error: any) {
      this.logger.error('Error approving return', { error, returnId });
      this.handleStateTransitionError(error, returnId);
    }
  }

  /**
   * Mark return as received
   * @param returnId - Return ID
   * @param receiptData - Receipt data object
   * @returns ReceivedReturnResponse object
   */
  async markReceived(
    returnId: string,
    receiptData: {
      received_by: string;
      condition_notes?: string;
      images?: string[];
    }
  ): Promise<ReceivedReturnResponse> {
    try {
      this.logger.debug('Marking return as received', { returnId });
      const response = await this.stateset.request(
        'POST',
        `returns/${returnId}/receive`,
        receiptData
      );
      return response.return as ReceivedReturnResponse;
    } catch (error: any) {
      this.logger.error('Error marking return as received', { error, returnId });
      this.handleStateTransitionError(error, returnId);
    }
  }

  /**
   * Submit return inspection
   * @param returnId - Return ID
   * @param inspection - QualityInspection object
   * @returns InspectingReturnResponse object
   */
  async submitInspection(
    returnId: string,
    inspection: QualityInspection
  ): Promise<InspectingReturnResponse> {
    try {
      this.logger.debug('Submitting inspection for return', { returnId });
      const response = await this.stateset.request(
        'POST',
        `returns/${returnId}/inspect`,
        inspection
      );
      return response.return as InspectingReturnResponse;
    } catch (error: any) {
      this.logger.error('Error submitting inspection', { error, returnId });
      this.handleStateTransitionError(error, returnId);
    }
  }

  /**
   * Process return refund
   * @param returnId - Return ID
   * @param refundDetails - RefundDetails object
   * @returns CompletedReturnResponse object
   */
  async processRefund(
    returnId: string,
    refundDetails: RefundDetails
  ): Promise<CompletedReturnResponse> {
    try {
      this.logger.debug('Processing refund for return', {
        returnId,
        method: refundDetails.method,
        amount: refundDetails.amount,
      });
      const response = await this.stateset.request(
        'POST',
        `returns/${returnId}/refund`,
        refundDetails
      );
      return response.return as CompletedReturnResponse;
    } catch (error: any) {
      this.logger.error('Error processing refund', {
        error,
        returnId,
        method: refundDetails.method,
      });
      this.handleStateTransitionError(error, returnId);
    }
  }

  /**
   * Reject return
   * @param returnId - Return ID
   * @param rejectionData - Rejection data object
   * @returns RejectedReturnResponse object
   */
  async reject(
    returnId: string,
    rejectionData: {
      reason: string;
      notes?: string;
    }
  ): Promise<RejectedReturnResponse> {
    try {
      this.logger.debug('Rejecting return', { returnId, reason: rejectionData.reason });
      const response = await this.stateset.request(
        'POST',
        `returns/${returnId}/reject`,
        rejectionData
      );
      return response.return as RejectedReturnResponse;
    } catch (error: any) {
      this.logger.error('Error rejecting return', { error, returnId });
      this.handleStateTransitionError(error, returnId);
    }
  }

  /**
   * Cancel a return
   * @param returnId - Return ID
   * @param cancellationData - Cancellation data object
   * @returns CancelledReturnResponse object
   */
  async cancel(
    returnId: string,
    cancellationData: {
      reason: string;
      notes?: string;
    }
  ): Promise<CancelledReturnResponse> {
    try {
      this.logger.debug('Cancelling return', { returnId });
      const response = await this.stateset.request(
        'POST',
        `returns/${returnId}/cancel`,
        cancellationData
      );
      return response.return as CancelledReturnResponse;
    } catch (error: any) {
      this.logger.error('Error cancelling return', { error, returnId });
      this.handleStateTransitionError(error, returnId);
    }
  }

  /**
   * Close a return
   * @param returnId - Return ID
   * @param closeData - Close data object
   * @returns ClosedReturnResponse object
   */
  async close(
    returnId: string,
    closeData?: {
      reason?: string;
      notes?: string;
    }
  ): Promise<ClosedReturnResponse> {
    try {
      this.logger.debug('Closing return', { returnId });
      const response = await this.stateset.request(
        'POST',
        `returns/${returnId}/close`,
        closeData || {}
      );
      return response.return as ClosedReturnResponse;
    } catch (error: any) {
      this.logger.error('Error closing return', { error, returnId });
      this.handleStateTransitionError(error, returnId);
    }
  }

  /**
   * Reopen a closed or rejected return
   * @param returnId - Return ID
   * @param reopenData - Reopen data object
   * @returns ReopenedReturnResponse object
   */
  async reopen(
    returnId: string,
    reopenData: {
      reason: string;
      notes?: string;
    }
  ): Promise<ReopenedReturnResponse> {
    try {
      this.logger.debug('Reopening return', { returnId });
      const response = await this.stateset.request(
        'POST',
        `returns/${returnId}/reopen`,
        reopenData
      );
      return response.return as ReopenedReturnResponse;
    } catch (error: any) {
      this.logger.error('Error reopening return', { error, returnId });
      this.handleStateTransitionError(error, returnId);
    }
  }

  /**
   * Generate shipping label
   * @param returnId - Return ID
   * @param shippingData - Shipping data object
   * @returns ShippingLabel object
   */
  async generateShippingLabel(
    returnId: string,
    shippingData?: {
      carrier?: string;
      service_level?: string;
      insurance_amount?: number;
      dimensions?: {
        length: number;
        width: number;
        height: number;
        unit: 'in' | 'cm';
      };
      weight?: {
        value: number;
        unit: 'lb' | 'oz' | 'kg' | 'g';
      };
    }
  ): Promise<ShippingLabel> {
    try {
      this.logger.debug('Generating shipping label', { returnId });
      const response = await this.stateset.request(
        'POST',
        `returns/${returnId}/generate-label`,
        shippingData || {}
      );
      return response.shipping_label;
    } catch (error: any) {
      this.logger.error('Error generating shipping label', { error, returnId });
      if (error.status === 404) {
        throw new ReturnNotFoundError(returnId);
      }
      this.handleApiError(error);
    }
  }

  /**
   * Get return metrics
   * @param params - Filtering parameters
   * @returns ReturnMetrics object
   */
  async getMetrics(params?: ReturnMetricsParams): Promise<ReturnMetrics> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.start_date) queryParams.append('start_date', params.start_date.toISOString());
      if (params?.end_date) queryParams.append('end_date', params.end_date.toISOString());
      if (params?.org_id) queryParams.append('org_id', params.org_id);
      if (params?.include_monthly_trends)
        queryParams.append('include_monthly_trends', params.include_monthly_trends.toString());
      if (params?.include_top_products)
        queryParams.append('include_top_products', params.include_top_products.toString());
      if (params?.product_limit)
        queryParams.append('product_limit', params.product_limit.toString());

      this.logger.debug('Getting return metrics', { params });
      const response = await this.stateset.request(
        'GET',
        `returns/metrics?${queryParams.toString()}`
      );
      return response.metrics;
    } catch (error: any) {
      this.logger.error('Error getting metrics', { error });
      this.handleApiError(error);
    }
  }

  /**
   * Add a note to a return
   * @param returnId - Return ID
   * @param note - Note text
   * @returns ReturnResponse object
   */
  async addNote(returnId: string, note: string): Promise<ReturnResponse> {
    try {
      this.logger.debug('Adding note to return', { returnId });
      const response = await this.stateset.request('POST', `returns/${returnId}/notes`, { note });
      return response.return;
    } catch (error: any) {
      this.logger.error('Error adding note', { error, returnId });
      if (error.status === 404) {
        throw new ReturnNotFoundError(returnId);
      }
      this.handleApiError(error);
    }
  }

  /**
   * Export returns data
   * @param params - Filter parameters
   * @param format - Export format
   * @returns Buffer with export data
   */
  async exportData(
    params?: ReturnListParams,
    format: 'csv' | 'json' | 'xlsx' = 'csv'
  ): Promise<Buffer> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.status) queryParams.append('status', params.status);
      if (params?.customer_id) queryParams.append('customer_id', params.customer_id);
      if (params?.order_id) queryParams.append('order_id', params.order_id);
      if (params?.date_from) queryParams.append('date_from', params.date_from.toISOString());
      if (params?.date_to) queryParams.append('date_to', params.date_to.toISOString());
      if (params?.org_id) queryParams.append('org_id', params.org_id);

      queryParams.append('format', format);

      this.logger.debug('Exporting returns data', { params, format });
      const response = await this.stateset.request(
        'GET',
        `returns/export?${queryParams.toString()}`,
        { responseType: 'arraybuffer' }
      );

      return Buffer.from(response);
    } catch (error: any) {
      this.logger.error('Error exporting data', { error });
      this.handleApiError(error);
    }
  }

  /**
   * Check if a transition to the target state is allowed
   * @param returnId - Return ID
   * @param targetState - Target state to check
   * @returns Boolean indicating if transition is allowed
   */
  async canTransitionTo(returnId: string, targetState: ReturnStatus): Promise<boolean> {
    try {
      this.logger.debug('Checking state transition', { returnId, targetState });
      const response = await this.stateset.request(
        'GET',
        `returns/${returnId}/can-transition?target=${targetState}`
      );
      return response.can_transition;
    } catch (error: any) {
      this.logger.error('Error checking transition', { error, returnId, targetState });
      if (error.status === 404) {
        throw new ReturnNotFoundError(returnId);
      }
      this.handleApiError(error);
      return false;
    }
  }

  /**
   * Get return history
   * @param returnId - Return ID
   * @returns Array of history events
   */
  async getHistory(returnId: string): Promise<
    Array<{
      id: string;
      return_id: string;
      action: string;
      from_status?: ReturnStatus;
      to_status?: ReturnStatus;
      actor_id?: string;
      actor_type?: 'user' | 'system' | 'customer';
      metadata?: Record<string, any>;
      created_at: string;
    }>
  > {
    try {
      this.logger.debug('Getting return history', { returnId });
      const response = await this.stateset.request('GET', `returns/${returnId}/history`);
      return response.history;
    } catch (error: any) {
      this.logger.error('Error getting history', { error, returnId });
      if (error.status === 404) {
        throw new ReturnNotFoundError(returnId);
      }
      this.handleApiError(error);
    }
  }

  // Helper method to handle API errors
  private handleApiError(error: any): never {
    if (error.status && error.message) {
      throw new ReturnApiError(error.message, error.status, error.code);
    }
    throw error;
  }

  // Helper method to handle state transition errors
  private handleStateTransitionError(error: any, returnId: string): never {
    if (error.status === 404) {
      throw new ReturnNotFoundError(returnId);
    }

    if (error.status === 400 && error.message?.includes('Invalid state transition')) {
      const currentState = error.data?.current_state;
      const requiredState = error.data?.required_state;

      if (currentState && requiredState) {
        throw new ReturnStateError(currentState, requiredState);
      }
    }

    this.handleApiError(error);
  }
}

export default Returns;
