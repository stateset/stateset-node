"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatesetPermissionError = exports.StatesetRateLimitError = exports.StatesetNotFoundError = exports.StatesetInvalidRequestError = exports.StatesetConnectionError = exports.StatesetAuthenticationError = exports.StatesetAPIError = exports.StatesetError = exports.OpenAIIntegration = exports.StatesetClient = exports.stateset = exports.Stateset = void 0;
const client_1 = require("./client");
Object.defineProperty(exports, "StatesetClient", { enumerable: true, get: function () { return client_1.StatesetClient; } });
const stateset_client_1 = require("./stateset-client");
const OpenAIIntegration_1 = __importDefault(require("./lib/integrations/OpenAIIntegration"));
exports.OpenAIIntegration = OpenAIIntegration_1.default;
const StatesetError_1 = require("./StatesetError");
Object.defineProperty(exports, "StatesetError", { enumerable: true, get: function () { return StatesetError_1.StatesetError; } });
Object.defineProperty(exports, "StatesetAPIError", { enumerable: true, get: function () { return StatesetError_1.StatesetAPIError; } });
Object.defineProperty(exports, "StatesetAuthenticationError", { enumerable: true, get: function () { return StatesetError_1.StatesetAuthenticationError; } });
Object.defineProperty(exports, "StatesetConnectionError", { enumerable: true, get: function () { return StatesetError_1.StatesetConnectionError; } });
Object.defineProperty(exports, "StatesetInvalidRequestError", { enumerable: true, get: function () { return StatesetError_1.StatesetInvalidRequestError; } });
Object.defineProperty(exports, "StatesetNotFoundError", { enumerable: true, get: function () { return StatesetError_1.StatesetNotFoundError; } });
Object.defineProperty(exports, "StatesetRateLimitError", { enumerable: true, get: function () { return StatesetError_1.StatesetRateLimitError; } });
Object.defineProperty(exports, "StatesetPermissionError", { enumerable: true, get: function () { return StatesetError_1.StatesetPermissionError; } });
// Export new client as default
exports.default = client_1.StatesetClient;
// Export legacy client for backward compatibility
exports.Stateset = client_1.StatesetClient;
exports.stateset = stateset_client_1.stateset;
// Export types
__exportStar(require("./types"), exports);
//# sourceMappingURL=index.js.map