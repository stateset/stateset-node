"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

class Orders {
    constructor(stateset) {
        this.stateset = stateset;
    }

    handleCommandResponse(response) {
        if (response.error) {
            throw new Error(response.error);
        }
        if (!response.update_orders_by_pk) {
            throw new Error('Unexpected response format');
        }
        const orderData = response.update_orders_by_pk;
        const baseResponse = {
            id: orderData.id,
            object: 'order',
            status: orderData.status,
        };
        switch (orderData.status) {
            case 'COMPLETED':
                return { ...baseResponse, status: 'COMPLETED', completed: true };
            case 'CANCELLED':
                return { ...baseResponse, status: 'CANCELLED', cancelled: true };
            case 'REFUNDED':
                return { ...baseResponse, status: 'REFUNDED', refunded: true };
            case 'VOIDED':
                return { ...baseResponse, status: 'VOIDED', voided: true };
            case 'HELD':
                return { ...baseResponse, status: 'HELD', held: true };
            case 'RELEASED':
                return { ...baseResponse, status: 'RELEASED', released: true };
            default:
                throw new Error(`Unexpected order status: ${orderData.status}`);
        }
    }

    async list() {
        return this.stateset.request('GET', 'orders');
    }

    async get(orderId) {
        return this.stateset.request('GET', `orders/${orderId}`);
    }

    async create(orderData) {
        return this.stateset.request('POST', 'orders', orderData);
    }

    async update(orderId, orderData) {
        return this.stateset.request('PUT', `orders/${orderId}`, orderData);
    }

    async delete(orderId) {
        return this.stateset.request('DELETE', `orders/${orderId}`);
    }

    async cancel(orderId) {
        const response = await this.stateset.request('POST', `orders/${orderId}/cancel`);
        return this.handleCommandResponse(response);
    }

    async complete(orderId) {
        const response = await this.stateset.request('POST', `orders/${orderId}/complete`);
        return this.handleCommandResponse(response);
    }

    async refund(orderId, refundData) {
        const response = await this.stateset.request('POST', `orders/${orderId}/refund`, refundData);
        return this.handleCommandResponse(response);
    }

    async void(orderId) {
        const response = await this.stateset.request('POST', `orders/${orderId}/void`);
        return this.handleCommandResponse(response);
    }

    async capture(orderId) {
        return this.stateset.request('POST', `orders/${orderId}/capture`);
    }

    async hold(orderId) {
        const response = await this.stateset.request('POST', `orders/${orderId}/hold`);
        return this.handleCommandResponse(response);
    }

    async release(orderId) {
        const response = await this.stateset.request('POST', `orders/${orderId}/release`);
        return this.handleCommandResponse(response);
    }

    async ship(orderId, shipmentData) {
        return this.stateset.request('POST', `orders/${orderId}/ship`, shipmentData);
    }

    async return(orderId, returnData) {
        return this.stateset.request('POST', `orders/${orderId}/return`, returnData);
    }

    async exchange(orderId, exchangeData) {
        return this.stateset.request('POST', `orders/${orderId}/exchange`, exchangeData);
    }

    async split(orderId, splitData) {
        return this.stateset.request('POST', `orders/${orderId}/split`, splitData);
    }

    async merge(orderId, mergeData) {
        return this.stateset.request('POST', `orders/${orderId}/merge`, mergeData);
    }

    async tag(orderId, tagData) {
        return this.stateset.request('POST', `orders/${orderId}/tag`, tagData);
    }

    async removeTag(orderId, tagData) {
        return this.stateset.request('POST', `orders/${orderId}/remove-tag`, tagData);
    }

    async addItem(orderId, itemData) {
        return this.stateset.request('POST', `orders/${orderId}/items`, itemData);
    }

    async removeItem(orderId, itemId) {
        return this.stateset.request('DELETE', `orders/${orderId}/items/${itemId}`);
    }

    async addDiscount(orderId, discountData) {
        return this.stateset.request('POST', `orders/${orderId}/discounts`, discountData);
    }

    async removeDiscount(orderId, discountId) {
        return this.stateset.request('DELETE', `orders/${orderId}/discounts/${discountId}`);
    }

    async applyPromotion(orderId, promotionData) {
        return this.stateset.request('POST', `orders/${orderId}/promotions`, promotionData);
    }

    async removePromotion(orderId, promotionId) {
        return this.stateset.request('DELETE', `orders/${orderId}/promotions/${promotionId}`);
    }

    async addCoupon(orderId, couponData) {
        return this.stateset.request('POST', `orders/${orderId}/coupons`, couponData);
    }

    async removeCoupon(orderId, couponId) {
        return this.stateset.request('DELETE', `orders/${orderId}/coupons/${couponId}`);
    }

    async addNote(orderId, noteData) {
        return this.stateset.request('POST', `orders/${orderId}/notes`, noteData);
    }

    async removeNote(orderId, noteId) {
        return this.stateset.request('DELETE', `orders/${orderId}/notes/${noteId}`);
    }
}

exports.default = Orders;