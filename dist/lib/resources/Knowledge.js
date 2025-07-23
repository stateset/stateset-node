"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeValidationError = exports.KnowledgeNotFoundError = exports.KnowledgeType = void 0;
// Enums for knowledge management
var KnowledgeType;
(function (KnowledgeType) {
    KnowledgeType["DOCUMENT"] = "document";
    KnowledgeType["FAQ"] = "faq";
    KnowledgeType["ARTICLE"] = "article";
    KnowledgeType["CODE_SNIPPET"] = "code_snippet";
    KnowledgeType["LINK"] = "link";
})(KnowledgeType || (exports.KnowledgeType = KnowledgeType = {}));
// Custom error classes
class KnowledgeNotFoundError extends Error {
    constructor(knowledgeId) {
        super(`Knowledge with ID ${knowledgeId} not found`);
        this.name = 'KnowledgeNotFoundError';
    }
}
exports.KnowledgeNotFoundError = KnowledgeNotFoundError;
class KnowledgeValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'KnowledgeValidationError';
    }
}
exports.KnowledgeValidationError = KnowledgeValidationError;
// Main Knowledge class
class Knowledge {
    stateset;
    constructor(stateset) {
        this.stateset = stateset;
    }
    /**
     * List knowledge items with optional filtering
     */
    async list(params) {
        const queryParams = new URLSearchParams();
        if (params?.type)
            queryParams.append('type', params.type);
        if (params?.agent_id)
            queryParams.append('agent_id', params.agent_id);
        if (params?.org_id)
            queryParams.append('org_id', params.org_id);
        if (params?.user_id)
            queryParams.append('user_id', params.user_id);
        if (params?.tag)
            queryParams.append('tag', params.tag);
        const response = await this.stateset.request('GET', `knowledge?${queryParams.toString()}`);
        return response.knowledge;
    }
    /**
     * Get specific knowledge item
     */
    async get(knowledgeId) {
        try {
            const response = await this.stateset.request('GET', `knowledge/${knowledgeId}`);
            return response.knowledge;
        }
        catch (error) {
            if (error.status === 404) {
                throw new KnowledgeNotFoundError(knowledgeId);
            }
            throw error;
        }
    }
    /**
     * Create knowledge
     */
    async create(data) {
        if (!data.title || !data.content) {
            throw new KnowledgeValidationError('Title and content are required');
        }
        const response = await this.stateset.request('POST', 'knowledge', data);
        return response.knowledge;
    }
    /**
     * Update knowledge
     */
    async update(knowledgeId, data) {
        try {
            const response = await this.stateset.request('PUT', `knowledge/${knowledgeId}`, data);
            return response.knowledge;
        }
        catch (error) {
            if (error.status === 404) {
                throw new KnowledgeNotFoundError(knowledgeId);
            }
            throw error;
        }
    }
    /**
     * Delete knowledge
     */
    async delete(knowledgeId) {
        try {
            await this.stateset.request('DELETE', `knowledge/${knowledgeId}`);
        }
        catch (error) {
            if (error.status === 404) {
                throw new KnowledgeNotFoundError(knowledgeId);
            }
            throw error;
        }
    }
}
exports.default = Knowledge;
//# sourceMappingURL=Knowledge.js.map