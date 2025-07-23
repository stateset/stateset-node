import { stateset } from '../../stateset-client';
export declare enum KnowledgeType {
    DOCUMENT = "document",
    FAQ = "faq",
    ARTICLE = "article",
    CODE_SNIPPET = "code_snippet",
    LINK = "link"
}
export interface KnowledgeData {
    title: string;
    content: string;
    type: KnowledgeType;
    tags?: string[];
    metadata?: Record<string, any>;
    agent_id?: string;
    org_id?: string;
    user_id?: string;
}
export interface KnowledgeRecord {
    id: string;
    created_at: string;
    updated_at: string;
    data: KnowledgeData;
}
export declare class KnowledgeNotFoundError extends Error {
    constructor(knowledgeId: string);
}
export declare class KnowledgeValidationError extends Error {
    constructor(message: string);
}
declare class Knowledge {
    private readonly stateset;
    constructor(stateset: stateset);
    /**
     * List knowledge items with optional filtering
     */
    list(params?: {
        type?: KnowledgeType;
        agent_id?: string;
        org_id?: string;
        user_id?: string;
        tag?: string;
    }): Promise<KnowledgeRecord[]>;
    /**
     * Get specific knowledge item
     */
    get(knowledgeId: string): Promise<KnowledgeRecord>;
    /**
     * Create knowledge
     */
    create(data: KnowledgeData): Promise<KnowledgeRecord>;
    /**
     * Update knowledge
     */
    update(knowledgeId: string, data: Partial<KnowledgeData>): Promise<KnowledgeRecord>;
    /**
     * Delete knowledge
     */
    delete(knowledgeId: string): Promise<void>;
}
export default Knowledge;
//# sourceMappingURL=Knowledge.d.ts.map