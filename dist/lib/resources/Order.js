"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Orders = exports.OrderValidationError = exports.OrderStateError = exports.OrderNotFoundError = exports.OrderError = exports.FulfillmentPriority = exports.PaymentStatus = exports.OrderStatus = void 0;
// Constants and Enums
const DEFAULT_CURRENCY = 'USD';
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
class OrderError extends Error {
    constructor(message, name) {
        super(message);
        this.name = name;
    }
}
exports.OrderError = OrderError;
class OrderNotFoundError extends OrderError {
    constructor(orderId) {
        super(`Order with ID ${orderId} not found`, 'OrderNotFoundError');
    }
}
exports.OrderNotFoundError = OrderNotFoundError;
class OrderStateError extends OrderError {
    constructor(message) {
        super(message, 'OrderStateError');
    }
}
exports.OrderStateError = OrderStateError;
class OrderValidationError extends OrderError {
    constructor(message) {
        super(message, 'OrderValidationError');
    }
}
exports.OrderValidationError = OrderValidationError;
// Utility Functions
const validateOrderTotals = (orderData) => {
    const calculatedTotal = orderData.items.reduce((total, item) => total + item.total_amount, 0);
    if (Math.abs(calculatedTotal - orderData.totals.subtotal) > 0.01) {
        throw new OrderValidationError('Order items total does not match subtotal');
    }
};
// Main Orders Class
class Orders {
    constructor(client) {
        this.client = client;
    }
    async request(method, path, data) {
        try {
            return await this.client.request(method, path, data);
        }
        catch (error) {
            if (error.status === 404) {
                throw new OrderNotFoundError(path.split('/')[2] || 'unknown');
            }
            if (error.status === 400) {
                throw new OrderValidationError(error.message);
            }
            throw error;
        }
    }
    async list(params = {}) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                queryParams.append(key, value instanceof Date ? value.toISOString() : String(value));
            }
        });
        const response = await this.request('GET', `orders?${queryParams.toString()}`);
        return response;
    }
    async get(orderId) {
        return this.request('GET', `orders/${orderId}`);
    }
    async create(orderData) {
        validateOrderTotals(orderData);
        return this.request('POST', 'orders', {
            ...orderData,
            totals: { ...orderData.totals, currency: orderData.totals.currency || DEFAULT_CURRENCY },
        });
    }
    async update(orderId, orderData) {
        if (orderData.totals && orderData.items) {
            validateOrderTotals(orderData);
        }
        return this.request('PUT', `orders/${orderId}`, orderData);
    }
    async confirm(orderId) {
        return this.request('POST', `orders/${orderId}/confirm`);
    }
    async process(orderId) {
        return this.request('POST', `orders/${orderId}/process`);
    }
    async ship(orderId, shippingDetails) {
        return this.request('POST', `orders/${orderId}/ship`, shippingDetails);
    }
    async markDelivered(orderId, confirmation) {
        return this.request('POST', `orders/${orderId}/deliver`, confirmation);
    }
    async cancel(orderId, cancellationData) {
        return this.request('POST', `orders/${orderId}/cancel`, cancellationData);
    }
    async processReturn(orderId, returnData) {
        return this.request('POST', `orders/${orderId}/return`, returnData);
    }
    async processRefund(orderId, refundData) {
        return this.request('POST', `orders/${orderId}/refund`, refundData);
    }
    async addFulfillmentEvent(orderId, event) {
        return this.request('POST', `orders/${orderId}/fulfillment-events`, event);
    }
    async getFulfillmentHistory(orderId, params = {}) {
        const queryParams = new URLSearchParams();
        if (params.start_date)
            queryParams.append('start_date', params.start_date.toISOString());
        if (params.end_date)
            queryParams.append('end_date', params.end_date.toISOString());
        return this.request('GET', `orders/${orderId}/fulfillment-history?${queryParams.toString()}`);
    }
    async getTracking(orderId) {
        return this.request('GET', `orders/${orderId}/tracking`);
    }
    async getMetrics(params = {}) {
        const queryParams = new URLSearchParams();
        if (params.start_date)
            queryParams.append('start_date', params.start_date.toISOString());
        if (params.end_date)
            queryParams.append('end_date', params.end_date.toISOString());
        if (params.org_id)
            queryParams.append('org_id', params.org_id);
        return this.request('GET', `orders/metrics?${queryParams.toString()}`);
    }
}
exports.Orders = Orders;
exports.default = Orders;
