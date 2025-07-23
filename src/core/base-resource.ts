import { HttpClient } from './http-client';
import {
  BaseEntity,
  ListParams,
  ListResponse,
  CreateParams,
  UpdateParams,
  GetParams,
  DeleteParams,
  SearchParams,
  RequestOptions,
} from '../types';
import { logger } from '../utils/logger';

export abstract class BaseResource<T extends BaseEntity> {
  protected resourceName: string;
  protected httpClient: HttpClient;

  constructor(httpClient: HttpClient, resourceName: string) {
    this.httpClient = httpClient;
    this.resourceName = resourceName;
  }

  /**
   * Get a single resource by ID
   */
  async get(params: GetParams): Promise<T> {
    const { id, options = {} } = params;
    
    logger.debug('Getting resource', {
      operation: 'get',
      resource: this.resourceName,
      metadata: { id },
    });

    const response = await this.httpClient.get<any>(
      `${this.resourceName}/${id}`,
      options
    );

    return response[this.resourceName.slice(0, -1)] || response.data || response;
  }

  /**
   * List resources with optional filtering and pagination
   */
  async list(params: ListParams = {}): Promise<ListResponse<T>> {
    const { filters, sort, limit, offset, cursor, options = {} } = params;
    
    logger.debug('Listing resources', {
      operation: 'list',
      resource: this.resourceName,
      metadata: { filters, sort, limit, offset, cursor },
    });

    const queryParams: Record<string, unknown> = {};
    
    if (filters) {
      Object.assign(queryParams, filters);
    }
    
    if (sort) queryParams.sort = sort;
    if (limit) queryParams.limit = limit;
    if (offset) queryParams.offset = offset;
    if (cursor) queryParams.cursor = cursor;

    const requestOptions: RequestOptions = {
      ...options,
      params: queryParams,
    };

    const response = await this.httpClient.get<any>(this.resourceName, requestOptions);

    // Handle different response formats
    if (response[this.resourceName]) {
      return {
        data: response[this.resourceName],
        has_more: response.has_more || false,
        total_count: response.total_count,
        next_cursor: response.next_cursor,
      };
    }

    if (Array.isArray(response.data)) {
      return {
        data: response.data,
        has_more: response.has_more || false,
        total_count: response.total_count,
        next_cursor: response.next_cursor,
      };
    }

    if (Array.isArray(response)) {
      return {
        data: response,
        has_more: false,
      };
    }

    throw new Error(`Unexpected response format for ${this.resourceName} list`);
  }

  /**
   * Create a new resource
   */
  async create(params: CreateParams<Partial<T>>): Promise<T> {
    const { data, options = {} } = params;
    
    logger.debug('Creating resource', {
      operation: 'create',
      resource: this.resourceName,
      metadata: { data },
    });

    const response = await this.httpClient.post<any>(
      this.resourceName,
      data,
      options
    );

    return response[this.resourceName.slice(0, -1)] || response.data || response;
  }

  /**
   * Update an existing resource
   */
  async update(params: UpdateParams<Partial<T>>): Promise<T> {
    const { id, data, options = {} } = params;
    
    logger.debug('Updating resource', {
      operation: 'update',
      resource: this.resourceName,
      metadata: { id, data },
    });

    const response = await this.httpClient.put<any>(
      `${this.resourceName}/${id}`,
      data,
      options
    );

    return response[this.resourceName.slice(0, -1)] || response.data || response;
  }

  /**
   * Partially update an existing resource
   */
  async patch(params: UpdateParams<Partial<T>>): Promise<T> {
    const { id, data, options = {} } = params;
    
    logger.debug('Patching resource', {
      operation: 'patch',
      resource: this.resourceName,
      metadata: { id, data },
    });

    const response = await this.httpClient.patch<any>(
      `${this.resourceName}/${id}`,
      data,
      options
    );

    return response[this.resourceName.slice(0, -1)] || response.data || response;
  }

  /**
   * Delete a resource
   */
  async delete(params: DeleteParams): Promise<{ success: boolean; id: string }> {
    const { id, options = {} } = params;
    
    logger.debug('Deleting resource', {
      operation: 'delete',
      resource: this.resourceName,
      metadata: { id },
    });

    await this.httpClient.delete(`${this.resourceName}/${id}`, options);

    return { success: true, id };
  }

  /**
   * Search resources
   */
  async search(params: SearchParams): Promise<ListResponse<T>> {
    const { query, filters, limit, offset, cursor, options = {} } = params;
    
    logger.debug('Searching resources', {
      operation: 'search',
      resource: this.resourceName,
      metadata: { query, filters, limit, offset, cursor },
    });

    const queryParams: Record<string, unknown> = { q: query };
    
    if (filters) {
      Object.assign(queryParams, filters);
    }
    
    if (limit) queryParams.limit = limit;
    if (offset) queryParams.offset = offset;
    if (cursor) queryParams.cursor = cursor;

    const requestOptions: RequestOptions = {
      ...options,
      params: queryParams,
    };

    const response = await this.httpClient.get<any>(
      `${this.resourceName}/search`,
      requestOptions
    );

    // Handle different response formats
    if (response[this.resourceName]) {
      return {
        data: response[this.resourceName],
        has_more: response.has_more || false,
        total_count: response.total_count,
        next_cursor: response.next_cursor,
      };
    }

    if (Array.isArray(response.data)) {
      return {
        data: response.data,
        has_more: response.has_more || false,
        total_count: response.total_count,
        next_cursor: response.next_cursor,
      };
    }

    return {
      data: Array.isArray(response) ? response : [],
      has_more: false,
    };
  }

  /**
   * Get resource count
   */
  async count(filters?: Record<string, unknown>): Promise<number> {
    logger.debug('Counting resources', {
      operation: 'count',
      resource: this.resourceName,
      metadata: { filters },
    });

    const queryParams = filters ? { ...filters } : {};
    
    const response = await this.httpClient.get<{ count: number }>(
      `${this.resourceName}/count`,
      { params: queryParams }
    );

    return response.count;
  }

  /**
   * Check if a resource exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      await this.get({ id });
      return true;
    } catch (error: any) {
      if (error.statusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Bulk operations
   */
  async bulkCreate(items: Partial<T>[], options: RequestOptions = {}): Promise<T[]> {
    logger.debug('Bulk creating resources', {
      operation: 'bulk_create',
      resource: this.resourceName,
      metadata: { count: items.length },
    });

    const response = await this.httpClient.post<any>(
      `${this.resourceName}/bulk`,
      { items },
      options
    );

    return response[this.resourceName] || response.data || response;
  }

  async bulkUpdate(updates: Array<{ id: string; data: Partial<T> }>, options: RequestOptions = {}): Promise<T[]> {
    logger.debug('Bulk updating resources', {
      operation: 'bulk_update',
      resource: this.resourceName,
      metadata: { count: updates.length },
    });

    const response = await this.httpClient.put<any>(
      `${this.resourceName}/bulk`,
      { updates },
      options
    );

    return response[this.resourceName] || response.data || response;
  }

  async bulkDelete(ids: string[], options: RequestOptions = {}): Promise<{ success: boolean; deleted: string[] }> {
    logger.debug('Bulk deleting resources', {
      operation: 'bulk_delete',
      resource: this.resourceName,
      metadata: { count: ids.length },
    });

    await this.httpClient.request('DELETE', `${this.resourceName}/bulk`, { ids }, options);

    return { success: true, deleted: ids };
  }

  /**
   * Export resources
   */
  async export(
    format: 'csv' | 'json' | 'xlsx' = 'json',
    filters?: Record<string, unknown>,
    options: RequestOptions = {}
  ): Promise<{ download_url: string; expires_at: string }> {
    logger.debug('Exporting resources', {
      operation: 'export',
      resource: this.resourceName,
      metadata: { format, filters },
    });

    const queryParams: Record<string, unknown> = { format };
    if (filters) {
      Object.assign(queryParams, filters);
    }

    const response = await this.httpClient.post<{ download_url: string; expires_at: string }>(
      `${this.resourceName}/export`,
      {},
      { ...options, params: queryParams }
    );

    return response;
  }

  /**
   * Get resource schema/metadata
   */
  async getSchema(): Promise<any> {
    const response = await this.httpClient.get(`${this.resourceName}/schema`);
    return response;
  }
}