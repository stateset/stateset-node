"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Users {
    constructor(stateset) {
        this.stateset = stateset;
    }
    async list() {
        return this.stateset.request('GET', 'users');
    }
    async get(userId) {
        return this.stateset.request('GET', `users/${userId}`);
    }
    async create(userData) {
        return this.stateset.request('POST', 'users', userData);
    }
    async update(userId, userData) {
        return this.stateset.request('PUT', `users/${userId}`, userData);
    }
    async delete(userId) {
        return this.stateset.request('DELETE', `users/${userId}`);
    }
}
exports.default = Users;
