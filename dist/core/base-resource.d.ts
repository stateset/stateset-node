import { HttpClient } from './http-client';
import { BaseEntity, ListParams, ListResponse, CreateParams, UpdateParams, GetParams, DeleteParams, SearchParams, RequestOptions } from '../types';
export declare abstract class BaseResource<T extends BaseEntity> {
    protected resourceName: string;
    protected httpClient: HttpClient;
    constructor(httpClient: HttpClient, resourceName: string);
    /**
     * Get a single resource by ID
     */
    get(params: GetParams): Promise<T>;
    /**
     * List resources with optional filtering and pagination
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
    delete(params: DeleteParams): Promise<{
        success: boolean;
        id: string;
    }>;
    /**
     * Search resources
     */
    search(params: SearchParams): Promise<ListResponse<T>>;
    /**
     * Get resource count
     */
    count(filters?: Record<string, unknown>): Promise<number>;
    /**
     * Check if a resource exists
     */
    exists(id: string): Promise<boolean>;
    /**
     * Bulk operations
     */
    bulkCreate(items: Partial<T>[], options?: RequestOptions): Promise<T[]>;
    bulkUpdate(updates: Array<{
        id: string;
        data: Partial<T>;
    }>, options?: RequestOptions): Promise<T[]>;
    bulkDelete(ids: string[], options?: RequestOptions): Promise<{
        success: boolean;
        deleted: string[];
    }>;
    /**
     * Export resources
     */
    export(format?: 'csv' | 'json' | 'xlsx', filters?: Record<string, unknown>, options?: RequestOptions): Promise<{
        download_url: string;
        expires_at: string;
    }>;
    /**
     * Get resource schema/metadata
     */
    getSchema(): Promise<any>;
}
//# sourceMappingURL=base-resource.d.ts.map