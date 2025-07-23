"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryResource = exports.AgentsResource = exports.WorkOrdersResource = exports.ShipmentsResource = exports.CustomersResource = exports.ProductsResource = exports.OrdersResource = void 0;
const base_resource_1 = require("../core/base-resource");
// Placeholder resource implementations
class OrdersResource extends base_resource_1.BaseResource {
    constructor(httpClient) {
        super(httpClient, 'orders');
    }
}
exports.OrdersResource = OrdersResource;
class ProductsResource extends base_resource_1.BaseResource {
    constructor(httpClient) {
        super(httpClient, 'products');
    }
}
exports.ProductsResource = ProductsResource;
class CustomersResource extends base_resource_1.BaseResource {
    constructor(httpClient) {
        super(httpClient, 'customers');
    }
}
exports.CustomersResource = CustomersResource;
class ShipmentsResource extends base_resource_1.BaseResource {
    constructor(httpClient) {
        super(httpClient, 'shipments');
    }
}
exports.ShipmentsResource = ShipmentsResource;
class WorkOrdersResource extends base_resource_1.BaseResource {
    constructor(httpClient) {
        super(httpClient, 'work-orders');
    }
}
exports.WorkOrdersResource = WorkOrdersResource;
class AgentsResource extends base_resource_1.BaseResource {
    constructor(httpClient) {
        super(httpClient, 'agents');
    }
}
exports.AgentsResource = AgentsResource;
class InventoryResource extends base_resource_1.BaseResource {
    constructor(httpClient) {
        super(httpClient, 'inventory');
    }
}
exports.InventoryResource = InventoryResource;
//# sourceMappingURL=index.js.map