import { BaseResource } from '../core/base-resource';
import { HttpClient } from '../core/http-client';
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
export declare class ReturnsResource extends BaseResource<Return> {
    constructor(httpClient: HttpClient);
    /**
     * Update return status
     */
    updateStatus(returnId: string, status: ReturnStatus, notes?: string, options?: RequestOptions): Promise<Return>;
    /**
     * Approve or reject a return
     */
    approve(returnId: string, params: ApprovalParams, options?: RequestOptions): Promise<Return>;
    /**
     * Generate shipping label for return
     */
    generateShippingLabel(returnId: string, params?: ShippingLabelParams, options?: RequestOptions): Promise<ShippingLabel>;
    /**
     * Mark return as received
     */
    markReceived(returnId: string, inspectionNotes?: string, options?: RequestOptions): Promise<Return>;
    /**
     * Process refund for return
     */
    processRefund(returnId: string, refundData: {
        amount: number;
        method: 'original_payment' | 'store_credit' | 'bank_transfer';
        notes?: string;
    }, options?: RequestOptions): Promise<Return>;
    /**
     * Cancel a return
     */
    cancel(returnId: string, reason: string, options?: RequestOptions): Promise<Return>;
    /**
     * Reopen a return
     */
    reopen(returnId: string, reason: string, options?: RequestOptions): Promise<Return>;
    /**
     * Add note to return
     */
    addNote(returnId: string, content: string, isInternal?: boolean, options?: RequestOptions): Promise<ReturnNote>;
    /**
     * List return notes
     */
    listNotes(returnId: string, includeInternal?: boolean, options?: RequestOptions): Promise<ReturnNote[]>;
    /**
     * Get return by order ID
     */
    getByOrderId(orderId: string, options?: RequestOptions): Promise<Return[]>;
    /**
     * Get return analytics
     */
    getAnalytics(filters?: {
        start_date?: string;
        end_date?: string;
        status?: ReturnStatus;
        reason?: ReturnReason;
    }, options?: RequestOptions): Promise<{
        total_returns: number;
        total_value: number;
        average_processing_time: number;
        status_breakdown: Record<ReturnStatus, number>;
        reason_breakdown: Record<ReturnReason, number>;
        refund_rate: number;
    }>;
    /**
     * Estimate return processing time
     */
    estimateProcessingTime(returnData: {
        reason: ReturnReason;
        item_count: number;
        value: number;
    }, options?: RequestOptions): Promise<{
        estimated_days: number;
        factors: string[];
    }>;
    /**
     * Validate return eligibility
     */
    validateEligibility(orderItemIds: string[], options?: RequestOptions): Promise<{
        eligible: boolean;
        items: Array<{
            order_item_id: string;
            eligible: boolean;
            reason?: string;
            days_since_delivery?: number;
        }>;
    }>;
}
//# sourceMappingURL=returns.d.ts.map