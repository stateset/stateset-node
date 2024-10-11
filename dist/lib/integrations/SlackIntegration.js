"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseIntegration_1 = __importDefault(require("./BaseIntegration"));
class XeroIntegration extends BaseIntegration_1.default {
    constructor(apiKey) {
        super(apiKey, 'https://api.xero.com');
    }
    async getChannels() {
        return this.request('GET', 'channels');
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
    async getUserMessages(userId) {
        return this.request('GET', `users/${userId}/messages`);
    }
}
exports.default = XeroIntegration;
