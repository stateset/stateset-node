'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const StatesetResource_1 = __importDefault(require("../../StatesetResource"));
exports.default = StatesetResource_1.default.extend({
    path: 'purchaseorders/',
    operations: ['create', 'list', 'retrieve'],
});
