"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Channels {
    constructor(stateset) {
        this.stateset = stateset;
    }
    async list() {
        return this.stateset.request('GET', 'channels');
    }
    async get(channelId) {
        return this.stateset.request('GET', `channels/${channelId}`);
    }
    async create(channelData) {
        return this.stateset.request('POST', 'channels', channelData);
    }
    async update(channelId, channelData) {
        return this.stateset.request('PUT', `channels/${channelId}`, channelData);
    }
    async delete(channelId) {
        return this.stateset.request('DELETE', `channels/${channelId}`);
    }
}
exports.default = Channels;
