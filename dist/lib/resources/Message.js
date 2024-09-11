"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Messages {
    constructor(stateset) {
        this.stateset = stateset;
    }
    async list() {
        return this.stateset.request('GET', 'messages');
    }
    async get(messageId) {
        return this.stateset.request('GET', `messages/${messageId}`);
    }
    async create(messageData) {
        return this.stateset.request('POST', 'messages', messageData);
    }
    async update(messageId, messageData) {
        return this.stateset.request('PUT', `messages/${messageId}`, messageData);
    }
    async delete(messageId) {
        return this.stateset.request('DELETE', `messages/${messageId}`);
    }
}
exports.default = Messages;
