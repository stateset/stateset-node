"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseIntegration_1 = __importDefault(require("./BaseIntegration"));
class TwilioIntegration extends BaseIntegration_1.default {
    constructor(apiKey) {
        super(apiKey, 'https://api.twilio.com');
    }
    async getMessages(channelId) {
        return this.request('GET', `channels/${channelId}/messages`);
    }
    async getUsers() {
        return this.request('GET', 'users');
    }
    async getUser(userId) {
        return this.request('GET', `users/${userId}`);
    }
}
exports.default = TwilioIntegration;
//# sourceMappingURL=TwilioIntegration.js.map