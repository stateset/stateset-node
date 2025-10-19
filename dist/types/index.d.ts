import type { RetryOptions, RetryAttempt } from '../utils/retry';
export interface StatesetConfig {
    apiKey?: string;
    baseUrl?: string;
    retry?: number;
    retryDelayMs?: number;
    retryOptions?: Partial<RetryOptions>;
    onRetryAttempt?: (attempt: RetryAttempt) => void;
    timeout?: number;
    userAgent?: string;
    additionalHeaders?: Record<string, string>;
    proxy?: string;
    appInfo?: {
        name: string;
        version?: string;
        url?: string;
    };
}
export interface ApiClientLike {
    request(method: string, path: string, data?: any, options?: any): Promise<any>;
}
export interface RequestOptions {
    timeout?: number;
    retries?: number;
    headers?: Record<string, string>;
    params?: Record<string, unknown>;
    signal?: AbortSignal;
    idempotencyKey?: string;
    cache?: boolean | CacheControlOptions;
    /**
     * @deprecated Use cache.key instead.
     */
    cacheKey?: string;
    /**
     * @deprecated Use cache.ttl instead.
     */
    cacheTTL?: number;
    invalidateCachePaths?: string | string[];
    retryOptions?: Partial<RetryOptions>;
    onRetryAttempt?: (attempt: RetryAttempt) => void;
}
export interface PaginationParams {
    limit?: number;
    offset?: number;
    cursor?: string;
}
export interface ListResponse<T> {
    data: T[];
    has_more: boolean;
    total_count?: number;
    next_cursor?: string;
}
export interface CacheControlOptions {
    key?: string;
    ttl?: number;
    invalidate?: string | string[];
}
export interface CreateParams<T = Record<string, unknown>> {
    data: T;
    options?: RequestOptions;
}
export interface UpdateParams<T = Record<string, unknown>> {
    id: string;
    data: Partial<T>;
    options?: RequestOptions;
}
export interface GetParams {
    id: string;
    options?: RequestOptions;
}
export interface ListParams extends PaginationParams {
    filters?: Record<string, unknown>;
    sort?: string;
    options?: RequestOptions;
}
export interface DeleteParams {
    id: string;
    options?: RequestOptions;
}
export interface SearchParams extends PaginationParams {
    query: string;
    filters?: Record<string, unknown>;
    options?: RequestOptions;
}
export interface BaseEntity {
    id: string;
    created_at: string;
    updated_at: string;
}
export interface User extends BaseEntity {
    email: string;
    name: string;
    role: string;
    status: 'active' | 'inactive' | 'pending';
}
export interface Customer extends BaseEntity {
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    company?: string;
    addresses: Address[];
}
export interface Address {
    id?: string;
    type: 'shipping' | 'billing';
    first_name: string;
    last_name: string;
    street_address1: string;
    street_address2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string;
}
export interface Product extends BaseEntity {
    sku: string;
    name: string;
    description?: string;
    category?: string;
    price: number;
    currency: string;
    weight?: number;
    dimensions?: {
        length: number;
        width: number;
        height: number;
        unit: string;
    };
    inventory_quantity: number;
    images?: string[];
    tags?: string[];
    status: 'active' | 'inactive' | 'archived';
}
export interface Order extends BaseEntity {
    order_number: string;
    customer_id: string;
    status: OrderStatus;
    items: OrderItem[];
    shipping_address: Address;
    billing_address?: Address;
    payment_details: PaymentDetails;
    totals: OrderTotals;
    notes?: string[];
    tags?: string[];
}
export declare enum OrderStatus {
    DRAFT = "DRAFT",
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    PROCESSING = "PROCESSING",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
    REFUNDED = "REFUNDED"
}
export interface OrderItem {
    id: string;
    product_id: string;
    sku: string;
    name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    currency: string;
}
export interface PaymentDetails {
    payment_method: string;
    status: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded';
    amount_paid: number;
    currency: string;
    transaction_id?: string;
}
export interface OrderTotals {
    subtotal: number;
    shipping_total: number;
    tax_total: number;
    discount_total: number;
    grand_total: number;
    currency: string;
}
export interface Return extends BaseEntity {
    return_number: string;
    order_id: string;
    customer_id: string;
    status: ReturnStatus;
    reason: ReturnReason;
    items: ReturnItem[];
    refund_details?: RefundDetails;
    shipping_label?: ShippingLabel;
    notes?: string[];
}
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
    CANCELLED = "CANCELLED"
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
export interface ReturnItem {
    order_item_id: string;
    product_id: string;
    quantity: number;
    reason: ReturnReason;
    condition?: 'new' | 'like_new' | 'used' | 'damaged';
    images?: string[];
    notes?: string;
    refund_amount: number;
}
export interface RefundDetails {
    method: 'original_payment' | 'store_credit' | 'bank_transfer';
    amount: number;
    currency: string;
    processed_at?: string;
    transaction_id?: string;
}
export interface ShippingLabel {
    carrier: string;
    tracking_number: string;
    label_url: string;
    cost: number;
    created_at: string;
    expiry_date?: string;
}
export interface Shipment extends BaseEntity {
    shipment_number: string;
    order_id: string;
    carrier: string;
    tracking_number?: string;
    status: ShipmentStatus;
    items: ShipmentItem[];
    shipping_address: Address;
    weight?: number;
    dimensions?: {
        length: number;
        width: number;
        height: number;
        unit: string;
    };
    cost?: number;
    currency?: string;
    shipped_at?: string;
    delivered_at?: string;
}
export declare enum ShipmentStatus {
    PENDING = "PENDING",
    LABEL_CREATED = "LABEL_CREATED",
    SHIPPED = "SHIPPED",
    IN_TRANSIT = "IN_TRANSIT",
    DELIVERED = "DELIVERED",
    EXCEPTION = "EXCEPTION",
    RETURNED = "RETURNED"
}
export interface ShipmentItem {
    order_item_id: string;
    product_id: string;
    sku: string;
    quantity: number;
}
export interface WorkOrder extends BaseEntity {
    work_order_number: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: WorkOrderStatus;
    type: 'maintenance' | 'repair' | 'inspection' | 'installation';
    assigned_to?: string;
    asset_id?: string;
    estimated_hours?: number;
    actual_hours?: number;
    scheduled_start?: string;
    scheduled_end?: string;
    actual_start?: string;
    actual_end?: string;
    parts_needed?: WorkOrderPart[];
    notes?: string[];
}
export declare enum WorkOrderStatus {
    OPEN = "OPEN",
    ASSIGNED = "ASSIGNED",
    IN_PROGRESS = "IN_PROGRESS",
    ON_HOLD = "ON_HOLD",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export interface WorkOrderPart {
    part_id: string;
    sku: string;
    name: string;
    quantity_needed: number;
    quantity_used?: number;
    unit_cost?: number;
}
export interface Agent extends BaseEntity {
    agent_name?: string;
    agent_type?: string;
    description?: string;
    activated?: boolean;
    last_updated?: string;
    org_id?: string;
    voice_model?: string;
    voice_model_id?: string;
    voice_model_provider?: string;
    user_id?: string;
    goal?: string;
    instructions?: string;
    role?: string;
    avatar_url?: string;
    mcp_servers?: Record<string, unknown>;
    model_id?: string;
    skills?: Record<string, unknown>;
    attributes?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    name?: string;
    type?: 'customer_service' | 'sales' | 'technical_support' | 'general';
    status?: 'active' | 'inactive' | 'training';
    capabilities?: string[];
    knowledge_base_ids?: string[];
    metrics?: AgentMetrics;
}
export interface AgentMetrics {
    total_conversations: number;
    average_response_time: number;
    satisfaction_score: number;
    resolution_rate: number;
    escalation_rate: number;
}
export interface Message extends BaseEntity {
    conversation_id: string;
    sender_type: 'user' | 'agent' | 'system';
    sender_id: string;
    content: string;
    content_type: 'text' | 'image' | 'file' | 'structured';
    metadata?: Record<string, unknown>;
}
export interface Knowledge extends BaseEntity {
    title: string;
    content: string;
    category: string;
    tags: string[];
    language: string;
    status: 'draft' | 'published' | 'archived';
    embeddings?: number[];
}
export interface StatesetErrorDetails {
    type: string;
    message: string;
    code?: string;
    detail?: string;
    path?: string;
    statusCode?: number;
    timestamp?: string;
    request_id?: string;
}
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
//# sourceMappingURL=index.d.ts.map