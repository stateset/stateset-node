"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkOrderStatus = exports.ShipmentStatus = exports.ReturnReason = exports.ReturnStatus = exports.OrderStatus = void 0;
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["DRAFT"] = "DRAFT";
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["CONFIRMED"] = "CONFIRMED";
    OrderStatus["PROCESSING"] = "PROCESSING";
    OrderStatus["SHIPPED"] = "SHIPPED";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["CANCELLED"] = "CANCELLED";
    OrderStatus["REFUNDED"] = "REFUNDED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var ReturnStatus;
(function (ReturnStatus) {
    ReturnStatus["REQUESTED"] = "REQUESTED";
    ReturnStatus["PENDING_APPROVAL"] = "PENDING_APPROVAL";
    ReturnStatus["APPROVED"] = "APPROVED";
    ReturnStatus["AWAITING_RECEIPT"] = "AWAITING_RECEIPT";
    ReturnStatus["RECEIVED"] = "RECEIVED";
    ReturnStatus["INSPECTING"] = "INSPECTING";
    ReturnStatus["PROCESSING_REFUND"] = "PROCESSING_REFUND";
    ReturnStatus["COMPLETED"] = "COMPLETED";
    ReturnStatus["REJECTED"] = "REJECTED";
    ReturnStatus["CANCELLED"] = "CANCELLED";
})(ReturnStatus || (exports.ReturnStatus = ReturnStatus = {}));
var ReturnReason;
(function (ReturnReason) {
    ReturnReason["WRONG_ITEM"] = "wrong_item";
    ReturnReason["DEFECTIVE"] = "defective";
    ReturnReason["NOT_AS_DESCRIBED"] = "not_as_described";
    ReturnReason["DAMAGED_IN_SHIPPING"] = "damaged_in_shipping";
    ReturnReason["SIZE_FIT_ISSUE"] = "size_fit_issue";
    ReturnReason["QUALITY_ISSUE"] = "quality_issue";
    ReturnReason["ARRIVED_LATE"] = "arrived_late";
    ReturnReason["CHANGED_MIND"] = "changed_mind";
    ReturnReason["OTHER"] = "other";
})(ReturnReason || (exports.ReturnReason = ReturnReason = {}));
var ShipmentStatus;
(function (ShipmentStatus) {
    ShipmentStatus["PENDING"] = "PENDING";
    ShipmentStatus["LABEL_CREATED"] = "LABEL_CREATED";
    ShipmentStatus["SHIPPED"] = "SHIPPED";
    ShipmentStatus["IN_TRANSIT"] = "IN_TRANSIT";
    ShipmentStatus["DELIVERED"] = "DELIVERED";
    ShipmentStatus["EXCEPTION"] = "EXCEPTION";
    ShipmentStatus["RETURNED"] = "RETURNED";
})(ShipmentStatus || (exports.ShipmentStatus = ShipmentStatus = {}));
var WorkOrderStatus;
(function (WorkOrderStatus) {
    WorkOrderStatus["OPEN"] = "OPEN";
    WorkOrderStatus["ASSIGNED"] = "ASSIGNED";
    WorkOrderStatus["IN_PROGRESS"] = "IN_PROGRESS";
    WorkOrderStatus["ON_HOLD"] = "ON_HOLD";
    WorkOrderStatus["COMPLETED"] = "COMPLETED";
    WorkOrderStatus["CANCELLED"] = "CANCELLED";
})(WorkOrderStatus || (exports.WorkOrderStatus = WorkOrderStatus = {}));
//# sourceMappingURL=index.js.map