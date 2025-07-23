import { stateset } from '../../stateset-client';
export declare enum ReturnStatus {
    REQUESTED = "REQUESTED",
    PENDING_APPROVAL = "PENDING_APPROVAL",
    APPROVED = "APPROVED",
    AWAITING_RECEIPT = "AWAITING_RECEIPT",
    RECEIVED = "RECEIVED",
    INSPECTING = "INSPECTING",
    PROCESSING_REFUND = "PROCESSING_REFUND",
    COMPLETED = "COMPLETED",
    REJECTED = "REJECTED",
    CANCELLED = "CANCELLED",
    CLOSED = "CLOSED",
    REOPENED = "REOPENED"
}
export declare enum ReturnReason {
    WRONG_ITEM = "wrong_item",
    DEFECTIVE = "defective",
    NOT_AS_DESCRIBED = "not_as_described",
    DAMAGED_IN_SHIPPING = "damaged_in_shipping",
    SIZE_FIT_ISSUE = "size_fit_issue",
    QUALITY_ISSUE = "quality_issue",
    ARRIVED_LATE = "arrived_late",
    CHANGED_MIND = "changed_mind",
    OTHER = "other"
}
export declare enum ReturnCondition {
    NEW = "new",
    LIKE_NEW = "like_new",
    USED = "used",
    DAMAGED = "damaged",
    UNSALVAGEABLE = "unsalvageable"
}
export declare enum RefundMethod {
    ORIGINAL_PAYMENT = "original_payment",
    STORE_CREDIT = "store_credit",
    BANK_TRANSFER = "bank_transfer",
    GIFT_CARD = "gift_card"
}
export declare enum RecommendedAction {
    REFURBISH = "refurbish",
    LIQUIDATE = "liquidate",
    DISPOSE = "dispose",
    RESTOCK = "restock"
}
export declare enum DamageSeverity {
    MINOR = "minor",
    MODERATE = "moderate",
    SEVERE = "severe"
}
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
export type ReturnResponse = RequestedReturnResponse | PendingApprovalReturnResponse | ApprovedReturnResponse | AwaitingReceiptReturnResponse | ReceivedReturnResponse | InspectingReturnResponse | ProcessingRefundReturnResponse | CompletedReturnResponse | RejectedReturnResponse | CancelledReturnResponse | ClosedReturnResponse | ReopenedReturnResponse;
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
export interface ReturnMetricsParams {
    start_date?: Date;
    end_date?: Date;
    org_id?: string;
    include_monthly_trends?: boolean;
    include_top_products?: boolean;
    product_limit?: number;
}
export declare class ReturnNotFoundError extends Error {
    constructor(returnId: string);
}
export declare class ReturnValidationError extends Error {
    constructor(message: string);
}
export declare class ReturnStateError extends Error {
    constructor(currentState: ReturnStatus, requiredState: ReturnStatus | ReturnStatus[]);
}
export declare class ReturnApiError extends Error {
    status: number;
    code?: string;
    constructor(message: string, status: number, code?: string);
}
export interface Logger {
    debug(message: string, meta?: Record<string, any>): void;
    info(message: string, meta?: Record<string, any>): void;
    warn(message: string, meta?: Record<string, any>): void;
    error(message: string, meta?: Record<string, any>): void;
}
declare class Returns {
    private readonly stateset;
    private readonly logger;
    constructor(stateset: stateset, options?: {
        logger?: Logger;
    });
    /**
     * List returns with optional filtering
     * @param params - Filtering parameters
     * @returns Array of ReturnResponse objects and pagination data
     */
    list(params?: ReturnListParams): Promise<{
        returns: ReturnResponse[];
        total_count: number;
        limit: number;
        offset: number;
    }>;
    /**
     * Get specific return by ID
     * @param returnId - Return ID
     * @returns ReturnResponse object
     */
    get(returnId: string): Promise<ReturnResponse>;
    /**
     * Create new return request
     * @param returnData - ReturnData object
     * @returns ReturnResponse object
     */
    create(returnData: ReturnData): Promise<ReturnResponse>;
    /**
     * Update return request
     * @param returnId - Return ID
     * @param returnData - Partial<ReturnData> object
     * @returns ReturnResponse object
     */
    update(returnId: string, returnData: Partial<ReturnData>): Promise<ReturnResponse>;
    /**
     * Process return status changes
     * @param returnId - Return ID
     * @param approvalData - Approval data object
     * @returns ApprovedReturnResponse object
     */
    approve(returnId: string, approvalData: {
        shipping_label?: ShippingLabel;
        notes?: string;
    }): Promise<ApprovedReturnResponse>;
    /**
     * Mark return as received
     * @param returnId - Return ID
     * @param receiptData - Receipt data object
     * @returns ReceivedReturnResponse object
     */
    markReceived(returnId: string, receiptData: {
        received_by: string;
        condition_notes?: string;
        images?: string[];
    }): Promise<ReceivedReturnResponse>;
    /**
     * Submit return inspection
     * @param returnId - Return ID
     * @param inspection - QualityInspection object
     * @returns InspectingReturnResponse object
     */
    submitInspection(returnId: string, inspection: QualityInspection): Promise<InspectingReturnResponse>;
    /**
     * Process return refund
     * @param returnId - Return ID
     * @param refundDetails - RefundDetails object
     * @returns CompletedReturnResponse object
     */
    processRefund(returnId: string, refundDetails: RefundDetails): Promise<CompletedReturnResponse>;
    /**
     * Reject return
     * @param returnId - Return ID
     * @param rejectionData - Rejection data object
     * @returns RejectedReturnResponse object
     */
    reject(returnId: string, rejectionData: {
        reason: string;
        notes?: string;
    }): Promise<RejectedReturnResponse>;
    /**
     * Cancel a return
     * @param returnId - Return ID
     * @param cancellationData - Cancellation data object
     * @returns CancelledReturnResponse object
     */
    cancel(returnId: string, cancellationData: {
        reason: string;
        notes?: string;
    }): Promise<CancelledReturnResponse>;
    /**
     * Close a return
     * @param returnId - Return ID
     * @param closeData - Close data object
     * @returns ClosedReturnResponse object
     */
    close(returnId: string, closeData?: {
        reason?: string;
        notes?: string;
    }): Promise<ClosedReturnResponse>;
    /**
     * Reopen a closed or rejected return
     * @param returnId - Return ID
     * @param reopenData - Reopen data object
     * @returns ReopenedReturnResponse object
     */
    reopen(returnId: string, reopenData: {
        reason: string;
        notes?: string;
    }): Promise<ReopenedReturnResponse>;
    /**
     * Generate shipping label
     * @param returnId - Return ID
     * @param shippingData - Shipping data object
     * @returns ShippingLabel object
     */
    generateShippingLabel(returnId: string, shippingData?: {
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
    }): Promise<ShippingLabel>;
    /**
     * Get return metrics
     * @param params - Filtering parameters
     * @returns ReturnMetrics object
     */
    getMetrics(params?: ReturnMetricsParams): Promise<ReturnMetrics>;
    /**
     * Add a note to a return
     * @param returnId - Return ID
     * @param note - Note text
     * @returns ReturnResponse object
     */
    addNote(returnId: string, note: string): Promise<ReturnResponse>;
    /**
     * Export returns data
     * @param params - Filter parameters
     * @param format - Export format
     * @returns Buffer with export data
     */
    exportData(params?: ReturnListParams, format?: 'csv' | 'json' | 'xlsx'): Promise<Buffer>;
    /**
     * Check if a transition to the target state is allowed
     * @param returnId - Return ID
     * @param targetState - Target state to check
     * @returns Boolean indicating if transition is allowed
     */
    canTransitionTo(returnId: string, targetState: ReturnStatus): Promise<boolean>;
    /**
     * Get return history
     * @param returnId - Return ID
     * @returns Array of history events
     */
    getHistory(returnId: string): Promise<Array<{
        id: string;
        return_id: string;
        action: string;
        from_status?: ReturnStatus;
        to_status?: ReturnStatus;
        actor_id?: string;
        actor_type?: 'user' | 'system' | 'customer';
        metadata?: Record<string, any>;
        created_at: string;
    }>>;
    private handleApiError;
    private handleStateTransitionError;
}
export default Returns;
//# sourceMappingURL=Return.d.ts.map