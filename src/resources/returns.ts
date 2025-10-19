import { BaseResource } from '../core/base-resource';
import { EnhancedHttpClient } from '../core/http-client';
import { Return, ReturnStatus, ReturnReason, ShippingLabel, RequestOptions } from '../types';

export interface ReturnNote {
  id: string;
  content: string;
  author_id: string;
  author_name: string;
  created_at: string;
  is_internal: boolean;
}

export interface ApprovalParams {
  approved: boolean;
  reason?: string;
  refund_amount?: number;
  restocking_fee?: number;
  notes?: string;
}

export interface ShippingLabelParams {
  carrier?: string;
  service_type?: string;
  package_type?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
}

export class ReturnsResource extends BaseResource<Return> {
  constructor(httpClient: EnhancedHttpClient) {
    super(httpClient, 'returns');
  }

  /**
   * Update return status
   */
  async updateStatus(
    returnId: string,
    status: ReturnStatus,
    notes?: string,
    options: RequestOptions = {}
  ): Promise<Return> {
    const data = { status, notes };

    const response = await this.httpClient.patch<{ return: Return }>(
      `${this.resourceName}/${returnId}/status`,
      data,
      options
    );

    return response.data.return;
  }

  /**
   * Approve or reject a return
   */
  async approve(
    returnId: string,
    params: ApprovalParams,
    options: RequestOptions = {}
  ): Promise<Return> {
    const response = await this.httpClient.post<{ return: Return }>(
      `${this.resourceName}/${returnId}/approve`,
      params,
      options
    );

    return response.data.return;
  }

  /**
   * Generate shipping label for return
   */
  async generateShippingLabel(
    returnId: string,
    params: ShippingLabelParams = {},
    options: RequestOptions = {}
  ): Promise<ShippingLabel> {
    const response = await this.httpClient.post<{ shipping_label: ShippingLabel }>(
      `${this.resourceName}/${returnId}/shipping-label`,
      params,
      options
    );

    return response.data.shipping_label;
  }

  /**
   * Mark return as received
   */
  async markReceived(
    returnId: string,
    inspectionNotes?: string,
    options: RequestOptions = {}
  ): Promise<Return> {
    const data = { inspection_notes: inspectionNotes };

    const response = await this.httpClient.post<{ return: Return }>(
      `${this.resourceName}/${returnId}/receive`,
      data,
      options
    );

    return response.data.return;
  }

  /**
   * Process refund for return
   */
  async processRefund(
    returnId: string,
    refundData: {
      amount: number;
      method: 'original_payment' | 'store_credit' | 'bank_transfer';
      notes?: string;
    },
    options: RequestOptions = {}
  ): Promise<Return> {
    const response = await this.httpClient.post<{ return: Return }>(
      `${this.resourceName}/${returnId}/refund`,
      refundData,
      options
    );

    return response.data.return;
  }

  /**
   * Cancel a return
   */
  async cancel(returnId: string, reason: string, options: RequestOptions = {}): Promise<Return> {
    const data = { reason };

    const response = await this.httpClient.post<{ return: Return }>(
      `${this.resourceName}/${returnId}/cancel`,
      data,
      options
    );

    return response.data.return;
  }

  /**
   * Reopen a return
   */
  async reopen(returnId: string, reason: string, options: RequestOptions = {}): Promise<Return> {
    const data = { reason };

    const response = await this.httpClient.post<{ return: Return }>(
      `${this.resourceName}/${returnId}/reopen`,
      data,
      options
    );

    return response.data.return;
  }

  /**
   * Add note to return
   */
  async addNote(
    returnId: string,
    content: string,
    isInternal: boolean = false,
    options: RequestOptions = {}
  ): Promise<ReturnNote> {
    const data = { content, is_internal: isInternal };

    const response = await this.httpClient.post<{ note: ReturnNote }>(
      `${this.resourceName}/${returnId}/notes`,
      data,
      options
    );

    return response.data.note;
  }

  /**
   * List return notes
   */
  async listNotes(
    returnId: string,
    includeInternal: boolean = false,
    options: RequestOptions = {}
  ): Promise<ReturnNote[]> {
    const queryParams = { include_internal: includeInternal };

    const response = await this.httpClient.get<{ notes: ReturnNote[] }>(
      `${this.resourceName}/${returnId}/notes`,
      { ...options, params: queryParams }
    );

    return response.data.notes;
  }

  /**
   * Get return by order ID
   */
  async getByOrderId(orderId: string, options: RequestOptions = {}): Promise<Return[]> {
    const response = await this.httpClient.get<{ returns: Return[] }>(
      `orders/${orderId}/returns`,
      options
    );

    return response.data.returns;
  }

  /**
   * Get return analytics
   */
  async getAnalytics(
    filters?: {
      start_date?: string;
      end_date?: string;
      status?: ReturnStatus;
      reason?: ReturnReason;
    },
    options: RequestOptions = {}
  ): Promise<{
    total_returns: number;
    total_value: number;
    average_processing_time: number;
    status_breakdown: Record<ReturnStatus, number>;
    reason_breakdown: Record<ReturnReason, number>;
    refund_rate: number;
  }> {
    const queryParams = filters || {};

    const response = await this.httpClient.get<any>(`${this.resourceName}/analytics`, {
      ...options,
      params: queryParams,
    });

    return response.data;
  }

  /**
   * Estimate return processing time
   */
  async estimateProcessingTime(
    returnData: {
      reason: ReturnReason;
      item_count: number;
      value: number;
    },
    options: RequestOptions = {}
  ): Promise<{
    estimated_days: number;
    factors: string[];
  }> {
    const response = await this.httpClient.post<any>(
      `${this.resourceName}/estimate-processing-time`,
      returnData,
      options
    );

    return response.data;
  }

  /**
   * Validate return eligibility
   */
  async validateEligibility(
    orderItemIds: string[],
    options: RequestOptions = {}
  ): Promise<{
    eligible: boolean;
    items: Array<{
      order_item_id: string;
      eligible: boolean;
      reason?: string;
      days_since_delivery?: number;
    }>;
  }> {
    const data = { order_item_ids: orderItemIds };

    const response = await this.httpClient.post<any>(
      `${this.resourceName}/validate-eligibility`,
      data,
      options
    );

    return response.data;
  }
}
