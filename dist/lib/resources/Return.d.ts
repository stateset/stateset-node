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
export type ReturnResponse = RequestedReturnResponse | PendingApprovalReturnResponse | ApprovedReturnResponse | ReceivedReturnResponse | InspectingReturnResponse | CompletedReturnResponse | RejectedReturnResponse;
export declare class ReturnNotFoundError extends Error {
    constructor(returnId: string);
}
export declare class ReturnValidationError extends Error {
    constructor(message: string);
}
export declare class ReturnStateError extends Error {
    constructor(message: string);
}
declare class Returns {
    private readonly stateset;
    constructor(stateset: stateset);
    /**
     * List returns with optional filtering
     */
    list(params?: {
        status?: ReturnStatus;
        customer_id?: string;
        order_id?: string;
        date_from?: Date;
        date_to?: Date;
        org_id?: string;
    }): Promise<ReturnResponse[]>;
    /**
     * Get specific return by ID
     */
    get(returnId: string): Promise<ReturnResponse>;
    /**
     * Create new return request
     */
    create(returnData: ReturnData): Promise<ReturnResponse>;
    /**
     * Update return request
     */
    update(returnId: string, returnData: Partial<ReturnData>): Promise<ReturnResponse>;
    /**
     * Process return status changes
     */
    approve(returnId: string, approvalData: {
        shipping_label: ShippingLabel;
        notes?: string;
    }): Promise<ApprovedReturnResponse>;
    markReceived(returnId: string, receiptData: {
        received_by: string;
        condition_notes?: string;
        images?: string[];
    }): Promise<ReceivedReturnResponse>;
    submitInspection(returnId: string, inspection: QualityInspection): Promise<InspectingReturnResponse>;
    processRefund(returnId: string, refundDetails: RefundDetails): Promise<CompletedReturnResponse>;
    reject(returnId: string, rejectionData: {
        reason: string;
        notes?: string;
    }): Promise<RejectedReturnResponse>;
    /**
     * Generate shipping label
     */
    generateShippingLabel(returnId: string, shippingData?: {
        carrier?: string;
        service_level?: string;
        insurance_amount?: number;
    }): Promise<ShippingLabel>;
    /**
     * Get return metrics
     */
    getMetrics(params?: {
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
    }>;
}
export default Returns;
