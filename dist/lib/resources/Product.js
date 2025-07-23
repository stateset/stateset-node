"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductValidationError = exports.ProductNotFoundError = exports.ProductError = exports.ProductType = exports.ProductStatus = void 0;
// Enums
var ProductStatus;
(function (ProductStatus) {
    ProductStatus["ACTIVE"] = "ACTIVE";
    ProductStatus["INACTIVE"] = "INACTIVE";
    ProductStatus["DRAFT"] = "DRAFT";
    ProductStatus["DISCONTINUED"] = "DISCONTINUED";
})(ProductStatus || (exports.ProductStatus = ProductStatus = {}));
var ProductType;
(function (ProductType) {
    ProductType["PHYSICAL"] = "PHYSICAL";
    ProductType["DIGITAL"] = "DIGITAL";
    ProductType["SERVICE"] = "SERVICE";
    ProductType["BUNDLE"] = "BUNDLE";
})(ProductType || (exports.ProductType = ProductType = {}));
// Error Classes
class ProductError extends Error {
    details;
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = this.constructor.name;
    }
}
exports.ProductError = ProductError;
class ProductNotFoundError extends ProductError {
    constructor(productId) {
        super(`Product with ID ${productId} not found`, { productId });
    }
}
exports.ProductNotFoundError = ProductNotFoundError;
class ProductValidationError extends ProductError {
    errors;
    constructor(message, errors) {
        super(message);
        this.errors = errors;
    }
}
exports.ProductValidationError = ProductValidationError;
class Products {
    client;
    constructor(client) {
        this.client = client;
    }
    validateProductData(data) {
        if (!data.name)
            throw new ProductValidationError('Product name is required');
        if (!data.sku)
            throw new ProductValidationError('SKU is required');
        if (data.price < 0)
            throw new ProductValidationError('Price cannot be negative');
        if (data.cost && data.cost < 0)
            throw new ProductValidationError('Cost cannot be negative');
    }
    mapResponse(data) {
        if (!data?.id)
            throw new ProductError('Invalid response format');
        return {
            id: data.id,
            object: 'product',
            data: {
                name: data.name,
                type: data.type,
                status: data.status,
                sku: data.sku,
                description: data.description,
                price: data.price,
                cost: data.cost,
                currency: data.currency,
                variants: data.variants,
                inventory: data.inventory,
                categories: data.categories,
                tags: data.tags,
                images: data.images,
                specifications: data.specifications,
                created_at: data.created_at,
                updated_at: data.updated_at,
                org_id: data.org_id,
                metadata: data.metadata,
            },
        };
    }
    async create(data) {
        this.validateProductData(data);
        try {
            const response = await this.client.request('POST', 'products', data);
            return this.mapResponse(response.product);
        }
        catch (error) {
            throw this.handleError(error, 'create');
        }
    }
    async get(id) {
        try {
            const response = await this.client.request('GET', `products/${id}`);
            return this.mapResponse(response.product);
        }
        catch (error) {
            throw this.handleError(error, 'get', id);
        }
    }
    async update(id, data) {
        try {
            const response = await this.client.request('PUT', `products/${id}`, data);
            return this.mapResponse(response.product);
        }
        catch (error) {
            throw this.handleError(error, 'update', id);
        }
    }
    async list(params = {}) {
        const query = new URLSearchParams({
            ...(params.status && { status: params.status }),
            ...(params.type && { type: params.type }),
            ...(params.category && { category: params.category }),
            ...(params.tag && { tag: params.tag }),
            ...(params.org_id && { org_id: params.org_id }),
            ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
            ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
            ...(params.limit && { limit: params.limit.toString() }),
            ...(params.offset && { offset: params.offset.toString() }),
            ...(params.search && { search: params.search }),
        });
        try {
            const response = await this.client.request('GET', `products?${query.toString()}`);
            return {
                products: response.products.map(this.mapResponse),
                pagination: response.pagination || { total: response.products.length, limit: params.limit || 100, offset: params.offset || 0 },
            };
        }
        catch (error) {
            throw this.handleError(error, 'list');
        }
    }
    async delete(id) {
        try {
            await this.client.request('DELETE', `products/${id}`);
        }
        catch (error) {
            throw this.handleError(error, 'delete', id);
        }
    }
    async getInventory(id) {
        try {
            const response = await this.client.request('GET', `products/${id}/inventory`);
            return response.inventory;
        }
        catch (error) {
            throw this.handleError(error, 'getInventory', id);
        }
    }
    async updateInventory(id, data) {
        if (!data.warehouse_id)
            throw new ProductValidationError('Warehouse ID is required for inventory update');
        if (data.quantity && data.quantity < 0)
            throw new ProductValidationError('Inventory quantity cannot be negative');
        try {
            const response = await this.client.request('PUT', `products/${id}/inventory`, data);
            return response.inventory;
        }
        catch (error) {
            throw this.handleError(error, 'updateInventory', id);
        }
    }
    async getMetrics(params = {}) {
        const query = new URLSearchParams({
            ...(params.org_id && { org_id: params.org_id }),
            ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
            ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
            ...(params.type && { type: params.type }),
        });
        try {
            const response = await this.client.request('GET', `products/metrics?${query.toString()}`);
            return response.metrics;
        }
        catch (error) {
            throw this.handleError(error, 'getMetrics');
        }
    }
    async addVariant(id, variantData) {
        try {
            const response = await this.client.request('POST', `products/${id}/variants`, variantData);
            return this.mapResponse(response.product);
        }
        catch (error) {
            throw this.handleError(error, 'addVariant', id);
        }
    }
    handleError(error, operation, productId) {
        if (error.status === 404)
            throw new ProductNotFoundError(productId || 'unknown');
        if (error.status === 400)
            throw new ProductValidationError(error.message, error.errors);
        throw new ProductError(`Failed to ${operation} product: ${error.message}`, { operation, originalError: error });
    }
}
exports.default = Products;
//# sourceMappingURL=Product.js.map