import { EnhancedHttpClient } from './http-client';
import { BaseEntity, ListResponse, SearchParams, CreateParams, UpdateParams, GetParams, ListParams, DeleteParams, RequestOptions } from '../types';
export interface BulkOperationResult<T> {
    success: T[];
    errors: Array<{
        index: number;
        error: string;
        item?: any;
    }>;
    totalProcessed: number;
    successCount: number;
    errorCount: number;
}
export interface ExportOptions extends ListParams {
    format?: 'json' | 'csv';
    includeDeleted?: boolean;
    chunkSize?: number;
}
export interface ResourceSchema {
    name: string;
    fields: Array<{
        name: string;
        type: string;
        required: boolean;
        description?: string;
    }>;
    operations: string[];
    endpoints: Record<string, string>;
}
export declare abstract class BaseResource<T extends BaseEntity> {
    protected httpClient: EnhancedHttpClient;
    protected resourceName: string;
    protected resourcePath: string;
    constructor(httpClient: EnhancedHttpClient, resourceName: string, resourcePath?: string);
    /**
     * Get a single resource by ID
     */
    get(params: GetParams): Promise<T>;
    /**
     * List resources with pagination and filtering
     */
    list(params?: ListParams): Promise<ListResponse<T>>;
    /**
     * Create a new resource
     */
    create(params: CreateParams<Partial<T>>): Promise<T>;
    /**
     * Update an existing resource
     */
    update(params: UpdateParams<Partial<T>>): Promise<T>;
    /**
     * Partially update an existing resource
     */
    patch(params: UpdateParams<Partial<T>>): Promise<T>;
    /**
     * Delete a resource
     */
    delete(params: DeleteParams): Promise<void>;
    /**
     * Search resources
     */
    search(params: SearchParams): Promise<ListResponse<T>>;
    /**
     * Count resources matching filters
     */
    count(filters?: Record<string, unknown>, options?: RequestOptions): Promise<number>;
    /**
     * Check if a resource exists
     */
    exists(id: string, options?: RequestOptions): Promise<boolean>;
    /**
     * Bulk create multiple resources
     */
    bulkCreate(items: Partial<T>[], options?: RequestOptions): Promise<BulkOperationResult<T>>;
    /**
     * Bulk update multiple resources
     */
    bulkUpdate(items: Array<{
        id: string;
        data: Partial<T>;
    }>, options?: RequestOptions): Promise<BulkOperationResult<T>>;
    /**
     * Bulk delete multiple resources
     */
    bulkDelete(ids: string[], options?: RequestOptions): Promise<BulkOperationResult<{
        id: string;
    }>>;
    /**
     * Export resources
     */
    export(options?: ExportOptions): Promise<{
        url?: string;
        data?: T[];
    }>;
    /**
     * Get resource schema information
     */
    getSchema(options?: RequestOptions): Promise<ResourceSchema>;
    /**
     * Sanitize data for logging (remove sensitive fields)
     */
    protected sanitizeLogData(data: any): any;
    /**
     * Get the resource name
     */
    getResourceName(): string;
    /**
     * Get the resource path
     */
    getResourcePath(): string;
}
//# sourceMappingURL=base-resource.d.ts.map