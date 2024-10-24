"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderValidationError = exports.OrderStateError = exports.OrderNotFoundError = exports.FulfillmentPriority = exports.PaymentStatus = exports.OrderStatus = void 0;
// Enums for order management
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["DRAFT"] = "DRAFT";
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["CONFIRMED"] = "CONFIRMED";
    OrderStatus["PROCESSING"] = "PROCESSING";
    OrderStatus["PICKING"] = "PICKING";
    OrderStatus["PACKING"] = "PACKING";
    OrderStatus["SHIPPED"] = "SHIPPED";
    OrderStatus["IN_TRANSIT"] = "IN_TRANSIT";
    OrderStatus["OUT_FOR_DELIVERY"] = "OUT_FOR_DELIVERY";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["CANCELLED"] = "CANCELLED";
    OrderStatus["RETURNED"] = "RETURNED";
    OrderStatus["REFUNDED"] = "REFUNDED";
})(OrderStatus = exports.OrderStatus || (exports.OrderStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["AUTHORIZED"] = "authorized";
    PaymentStatus["PAID"] = "paid";
    PaymentStatus["PARTIALLY_REFUNDED"] = "partially_refunded";
    PaymentStatus["REFUNDED"] = "refunded";
    PaymentStatus["FAILED"] = "failed";
})(PaymentStatus = exports.PaymentStatus || (exports.PaymentStatus = {}));
var FulfillmentPriority;
(function (FulfillmentPriority) {
    FulfillmentPriority["URGENT"] = "urgent";
    FulfillmentPriority["HIGH"] = "high";
    FulfillmentPriority["NORMAL"] = "normal";
    FulfillmentPriority["LOW"] = "low";
})(FulfillmentPriority = exports.FulfillmentPriority || (exports.FulfillmentPriority = {}));
// Custom Error Classes
class OrderNotFoundError extends Error {
    constructor(orderId) {
        super(`Order with ID ${orderId} not found`);
        this.name = 'OrderNotFoundError';
    }
}
exports.OrderNotFoundError = OrderNotFoundError;
class OrderStateError extends Error {
    constructor(message) {
        super(message);
        this.name = 'OrderStateError';
    }
}
exports.OrderStateError = OrderStateError;
class OrderValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'OrderValidationError';
    }
}
exports.OrderValidationError = OrderValidationError;
// Main Orders Class
class Orders {
    constructor(stateset) {
        this.stateset = stateset;
    }
    /**
     * List orders with optional filtering
     */
    async list(params) {
        const queryParams = new URLSearchParams();
        if (params === null || params === void 0 ? void 0 : params.status)
            queryParams.append('status', params.status);
        if (params === null || params === void 0 ? void 0 : params.customer_id)
            queryParams.append('customer_id', params.customer_id);
        if (params === null || params === void 0 ? void 0 : params.date_from)
            queryParams.append('date_from', params.date_from.toISOString());
        if (params === null || params === void 0 ? void 0 : params.date_to)
            queryParams.append('date_to', params.date_to.toISOString());
        if (params === null || params === void 0 ? void 0 : params.priority)
            queryParams.append('priority', params.priority);
        if (params === null || params === void 0 ? void 0 : params.payment_status)
            queryParams.append('payment_status', params.payment_status);
        if (params === null || params === void 0 ? void 0 : params.org_id)
            queryParams.append('org_id', params.org_id);
        const response = await this.stateset.request('GET', `orders?${queryParams.toString()}`);
        return response.orders;
    }
    /**
     * Get specific order by ID
     */
    async get(orderId) {
        try {
            const response = await this.stateset.request('GET', `orders/${orderId}`);
            return response.order;
        }
        catch (error) {
            if (error.status === 404) {
                throw new OrderNotFoundError(orderId);
            }
            throw error;
        }
    }
    /**
     * Create new order
     */
    async create(orderData) {
        // Validate order totals
        const calculatedTotal = orderData.items.reduce((total, item) => total + item.total_amount, 0);
        if (calculatedTotal !== orderData.totals.subtotal) {
            throw new OrderValidationError('Order items total does not match subtotal');
        }
        try {
            const response = await this.stateset.request('POST', 'orders', orderData);
            return response.order;
        }
        catch (error) {
            if (error.status === 400) {
                throw new OrderValidationError(error.message);
            }
            throw error;
        }
    }
    /**
     * Update existing order
     */
    async update(orderId, orderData) {
        try {
            const response = await this.stateset.request('PUT', `orders/${orderId}`, orderData);
            return response.order;
        }
        catch (error) {
            if (error.status === 404) {
                throw new OrderNotFoundError(orderId);
            }
            throw error;
        }
    }
    /**
     * Process order status changes
     */
    async confirm(orderId) {
        const response = await this.stateset.request('POST', `orders/${orderId}/confirm`);
        return response.order;
    }
    async process(orderId) {
        const response = await this.stateset.request('POST', `orders/${orderId}/process`);
        return response.order;
    }
    async ship(orderId, shippingDetails) {
        const response = await this.stateset.request('POST', `orders/${orderId}/ship`, shippingDetails);
        return response.order;
    }
    async markDelivered(orderId, confirmation) {
        const response = await this.stateset.request('POST', `orders/${orderId}/deliver`, confirmation);
        return response.order;
    }
    async cancel(orderId, cancellationData) {
        const response = await this.stateset.request('POST', `orders/${orderId}/cancel`, cancellationData);
        return response.order;
    }
    async processReturn(orderId, returnData) {
        const response = await this.stateset.request('POST', `orders/${orderId}/return`, returnData);
        return response.order;
    }
    async processRefund(orderId, refundData) {
        const response = await this.stateset.request('POST', `orders/${orderId}/refund`, refundData);
        return response.order;
    }
    /**
     * Fulfillment tracking
     */
    async addFulfillmentEvent(orderId, event) {
        const response = await this.stateset.request('POST', `orders/${orderId}/fulfillment-events`, event);
        return response.order;
    }
    async getFulfillmentHistory(orderId, params) {
        const queryParams = new URLSearchParams();
        if (params === null || params === void 0 ? void 0 : params.start_date)
            queryParams.append('start_date', params.start_date.toISOString());
        if (params === null || params === void 0 ? void 0 : params.end_date)
            queryParams.append('end_date', params.end_date.toISOString());
        const response = await this.stateset.request('GET', `orders/${orderId}/fulfillment-history?${queryParams.toString()}`);
        return response.history;
    }
    /**
     * Order tracking
     */
    async getTracking(orderId) {
        const response = await this.stateset.request('GET', `orders/${orderId}/tracking`);
        return response.tracking;
    }
    /**
     * Order metrics
     */
    async getMetrics(params) {
        const queryParams = new URLSearchParams();
        if (params === null || params === void 0 ? void 0 : params.start_date)
            queryParams.append('start_date', params.start_date.toISOString());
        if (params === null || params === void 0 ? void 0 : params.end_date)
            queryParams.append('end_date', params.end_date.toISOString());
        if (params === null || params === void 0 ? void 0 : params.org_id)
            queryParams.append('org_id', params.org_id);
        const response = await this.stateset.request('GET', `orders/metrics?${queryParams.toString()}`);
        return response.metrics;
    }
}
exports.default = Orders;
