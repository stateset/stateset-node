import { EnhancedHttpClient } from './http-client';
import { logger } from '../utils/logger';
import {
  BaseEntity,
  ListResponse,
  SearchParams,
  CreateParams,
  UpdateParams,
  GetParams,
  ListParams,
  DeleteParams,
  RequestOptions,
} from '../types';

export interface BulkOperationResult<T> {
  success: T[];
  errors: Array<{ index: number; error: string; item?: any }>;
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

export abstract class BaseResource<T extends BaseEntity> {
  protected resourceName: string;
  protected resourcePath: string;

  constructor(
    protected httpClient: EnhancedHttpClient,
    resourceName: string,
    resourcePath?: string
  ) {
    this.resourceName = resourceName;
    this.resourcePath = resourcePath || `/${resourceName.toLowerCase()}`;
  }

  /**
   * Get a single resource by ID
   */
  async get(params: GetParams): Promise<T> {
    const { id, options = {} } = params;

    logger.debug(`Getting ${this.resourceName}`, {
      operation: `${this.resourceName.toLowerCase()}.get`,
      metadata: { id },
    });

    try {
      const response = await this.httpClient.get<T>(`${this.resourcePath}/${id}`, {
        timeout: options.timeout,
        headers: options.headers,
      });

      logger.info(`${this.resourceName} retrieved successfully`, {
        operation: `${this.resourceName.toLowerCase()}.get`,
        metadata: { id, statusCode: response.status },
      });

      return response.data;
    } catch (error) {
      logger.error(
        `Failed to get ${this.resourceName}`,
        {
          operation: `${this.resourceName.toLowerCase()}.get`,
          metadata: { id },
        },
        error as Error
      );
      throw error;
    }
  }

  /**
   * List resources with pagination and filtering
   */
  async list(params: ListParams = {}): Promise<ListResponse<T>> {
    const { filters, sort, limit = 25, offset = 0, cursor, options = {} } = params;

    logger.debug(`Listing ${this.resourceName}`, {
      operation: `${this.resourceName.toLowerCase()}.list`,
      metadata: { limit, offset, cursor, filters, sort },
    });

    try {
      const queryParams: Record<string, unknown> = {
        limit,
        offset,
        ...(cursor && { cursor }),
        ...(sort && { sort }),
        ...filters,
      };

      const response = await this.httpClient.get<ListResponse<T>>(this.resourcePath, {
        params: queryParams,
        timeout: options.timeout,
        headers: options.headers,
      });

      logger.info(`${this.resourceName} list retrieved successfully`, {
        operation: `${this.resourceName.toLowerCase()}.list`,
        metadata: {
          count: response.data.data.length,
          hasMore: response.data.has_more,
          statusCode: response.status,
        },
      });

      return response.data;
    } catch (error) {
      logger.error(
        `Failed to list ${this.resourceName}`,
        {
          operation: `${this.resourceName.toLowerCase()}.list`,
          metadata: { limit, offset, cursor },
        },
        error as Error
      );
      throw error;
    }
  }

  /**
   * Create a new resource
   */
  async create(params: CreateParams<Partial<T>>): Promise<T> {
    const { data, options = {} } = params;

    logger.debug(`Creating ${this.resourceName}`, {
      operation: `${this.resourceName.toLowerCase()}.create`,
      metadata: { data: this.sanitizeLogData(data) },
    });

    try {
      const response = await this.httpClient.post<T>(this.resourcePath, data, {
        timeout: options.timeout,
        headers: options.headers,
      });

      logger.info(`${this.resourceName} created successfully`, {
        operation: `${this.resourceName.toLowerCase()}.create`,
        metadata: {
          id: response.data.id,
          statusCode: response.status,
        },
      });

      return response.data;
    } catch (error) {
      logger.error(
        `Failed to create ${this.resourceName}`,
        {
          operation: `${this.resourceName.toLowerCase()}.create`,
          metadata: { data: this.sanitizeLogData(data) },
        },
        error as Error
      );
      throw error;
    }
  }

  /**
   * Update an existing resource
   */
  async update(params: UpdateParams<Partial<T>>): Promise<T> {
    const { id, data, options = {} } = params;

    logger.debug(`Updating ${this.resourceName}`, {
      operation: `${this.resourceName.toLowerCase()}.update`,
      metadata: { id, data: this.sanitizeLogData(data) },
    });

    try {
      const response = await this.httpClient.put<T>(`${this.resourcePath}/${id}`, data, {
        timeout: options.timeout,
        headers: options.headers,
      });

      logger.info(`${this.resourceName} updated successfully`, {
        operation: `${this.resourceName.toLowerCase()}.update`,
        metadata: {
          id,
          statusCode: response.status,
        },
      });

      return response.data;
    } catch (error) {
      logger.error(
        `Failed to update ${this.resourceName}`,
        {
          operation: `${this.resourceName.toLowerCase()}.update`,
          metadata: { id },
        },
        error as Error
      );
      throw error;
    }
  }

  /**
   * Partially update an existing resource
   */
  async patch(params: UpdateParams<Partial<T>>): Promise<T> {
    const { id, data, options = {} } = params;

    logger.debug(`Patching ${this.resourceName}`, {
      operation: `${this.resourceName.toLowerCase()}.patch`,
      metadata: { id, data: this.sanitizeLogData(data) },
    });

    try {
      const response = await this.httpClient.patch<T>(`${this.resourcePath}/${id}`, data, {
        timeout: options.timeout,
        headers: options.headers,
      });

      logger.info(`${this.resourceName} patched successfully`, {
        operation: `${this.resourceName.toLowerCase()}.patch`,
        metadata: {
          id,
          statusCode: response.status,
        },
      });

      return response.data;
    } catch (error) {
      logger.error(
        `Failed to patch ${this.resourceName}`,
        {
          operation: `${this.resourceName.toLowerCase()}.patch`,
          metadata: { id },
        },
        error as Error
      );
      throw error;
    }
  }

  /**
   * Delete a resource
   */
  async delete(params: DeleteParams): Promise<void> {
    const { id, options = {} } = params;

    logger.debug(`Deleting ${this.resourceName}`, {
      operation: `${this.resourceName.toLowerCase()}.delete`,
      metadata: { id },
    });

    try {
      const response = await this.httpClient.delete(`${this.resourcePath}/${id}`, {
        timeout: options.timeout,
        headers: options.headers,
      });

      logger.info(`${this.resourceName} deleted successfully`, {
        operation: `${this.resourceName.toLowerCase()}.delete`,
        metadata: {
          id,
          statusCode: response.status,
        },
      });
    } catch (error) {
      logger.error(
        `Failed to delete ${this.resourceName}`,
        {
          operation: `${this.resourceName.toLowerCase()}.delete`,
          metadata: { id },
        },
        error as Error
      );
      throw error;
    }
  }

  /**
   * Search resources
   */
  async search(params: SearchParams): Promise<ListResponse<T>> {
    const { query, filters, limit = 25, offset = 0, cursor, options = {} } = params;

    logger.debug(`Searching ${this.resourceName}`, {
      operation: `${this.resourceName.toLowerCase()}.search`,
      metadata: { query, filters, limit, offset, cursor },
    });

    try {
      const queryParams: Record<string, unknown> = {
        q: query,
        limit,
        offset,
        ...(cursor && { cursor }),
        ...filters,
      };

      const response = await this.httpClient.get<ListResponse<T>>(`${this.resourcePath}/search`, {
        params: queryParams,
        timeout: options.timeout,
        headers: options.headers,
      });

      logger.info(`${this.resourceName} search completed successfully`, {
        operation: `${this.resourceName.toLowerCase()}.search`,
        metadata: {
          query,
          count: response.data.data.length,
          hasMore: response.data.has_more,
          statusCode: response.status,
        },
      });

      return response.data;
    } catch (error) {
      logger.error(
        `Failed to search ${this.resourceName}`,
        {
          operation: `${this.resourceName.toLowerCase()}.search`,
          metadata: { query },
        },
        error as Error
      );
      throw error;
    }
  }

  /**
   * Count resources matching filters
   */
  async count(
    filters: Record<string, unknown> = {},
    options: RequestOptions = {}
  ): Promise<number> {
    logger.debug(`Counting ${this.resourceName}`, {
      operation: `${this.resourceName.toLowerCase()}.count`,
      metadata: { filters },
    });

    try {
      const response = await this.httpClient.get<{ count: number }>(`${this.resourcePath}/count`, {
        params: filters,
        timeout: options.timeout,
        headers: options.headers,
      });

      logger.info(`${this.resourceName} count retrieved successfully`, {
        operation: `${this.resourceName.toLowerCase()}.count`,
        metadata: {
          count: response.data.count,
          statusCode: response.status,
        },
      });

      return response.data.count;
    } catch (error) {
      logger.error(
        `Failed to count ${this.resourceName}`,
        {
          operation: `${this.resourceName.toLowerCase()}.count`,
          metadata: { filters },
        },
        error as Error
      );
      throw error;
    }
  }

  /**
   * Check if a resource exists
   */
  async exists(id: string, options: RequestOptions = {}): Promise<boolean> {
    try {
      await this.get({ id, options });
      return true;
    } catch (error: any) {
      if (error.statusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Bulk create multiple resources
   */
  async bulkCreate(
    items: Partial<T>[],
    options: RequestOptions = {}
  ): Promise<BulkOperationResult<T>> {
    logger.debug(`Bulk creating ${this.resourceName}`, {
      operation: `${this.resourceName.toLowerCase()}.bulk_create`,
      metadata: { count: items.length },
    });

    try {
      const response = await this.httpClient.post<BulkOperationResult<T>>(
        `${this.resourcePath}/bulk`,
        {
          operation: 'create',
          items,
        },
        {
          timeout: options.timeout,
          headers: options.headers,
        }
      );

      logger.info(`${this.resourceName} bulk create completed`, {
        operation: `${this.resourceName.toLowerCase()}.bulk_create`,
        metadata: {
          successCount: response.data.successCount,
          errorCount: response.data.errorCount,
          statusCode: response.status,
        },
      });

      return response.data;
    } catch (error) {
      logger.error(
        `Failed to bulk create ${this.resourceName}`,
        {
          operation: `${this.resourceName.toLowerCase()}.bulk_create`,
          metadata: { count: items.length },
        },
        error as Error
      );
      throw error;
    }
  }

  /**
   * Bulk update multiple resources
   */
  async bulkUpdate(
    items: Array<{ id: string; data: Partial<T> }>,
    options: RequestOptions = {}
  ): Promise<BulkOperationResult<T>> {
    logger.debug(`Bulk updating ${this.resourceName}`, {
      operation: `${this.resourceName.toLowerCase()}.bulk_update`,
      metadata: { count: items.length },
    });

    try {
      const response = await this.httpClient.post<BulkOperationResult<T>>(
        `${this.resourcePath}/bulk`,
        {
          operation: 'update',
          items,
        },
        {
          timeout: options.timeout,
          headers: options.headers,
        }
      );

      logger.info(`${this.resourceName} bulk update completed`, {
        operation: `${this.resourceName.toLowerCase()}.bulk_update`,
        metadata: {
          successCount: response.data.successCount,
          errorCount: response.data.errorCount,
          statusCode: response.status,
        },
      });

      return response.data;
    } catch (error) {
      logger.error(
        `Failed to bulk update ${this.resourceName}`,
        {
          operation: `${this.resourceName.toLowerCase()}.bulk_update`,
          metadata: { count: items.length },
        },
        error as Error
      );
      throw error;
    }
  }

  /**
   * Bulk delete multiple resources
   */
  async bulkDelete(
    ids: string[],
    options: RequestOptions = {}
  ): Promise<BulkOperationResult<{ id: string }>> {
    logger.debug(`Bulk deleting ${this.resourceName}`, {
      operation: `${this.resourceName.toLowerCase()}.bulk_delete`,
      metadata: { count: ids.length },
    });

    try {
      const response = await this.httpClient.post<BulkOperationResult<{ id: string }>>(
        `${this.resourcePath}/bulk`,
        {
          operation: 'delete',
          ids,
        },
        {
          timeout: options.timeout,
          headers: options.headers,
        }
      );

      logger.info(`${this.resourceName} bulk delete completed`, {
        operation: `${this.resourceName.toLowerCase()}.bulk_delete`,
        metadata: {
          successCount: response.data.successCount,
          errorCount: response.data.errorCount,
          statusCode: response.status,
        },
      });

      return response.data;
    } catch (error) {
      logger.error(
        `Failed to bulk delete ${this.resourceName}`,
        {
          operation: `${this.resourceName.toLowerCase()}.bulk_delete`,
          metadata: { count: ids.length },
        },
        error as Error
      );
      throw error;
    }
  }

  /**
   * Export resources
   */
  async export(options: ExportOptions = {}): Promise<{ url?: string; data?: T[] }> {
    const { format = 'json', includeDeleted = false, chunkSize = 1000, ...listParams } = options;

    logger.debug(`Exporting ${this.resourceName}`, {
      operation: `${this.resourceName.toLowerCase()}.export`,
      metadata: { format, includeDeleted, chunkSize },
    });

    try {
      const response = await this.httpClient.post<{ url?: string; data?: T[] }>(
        `${this.resourcePath}/export`,
        {
          format,
          includeDeleted,
          chunkSize,
          ...listParams,
        },
        {
          timeout: options.options?.timeout || 300000, // 5 minutes for exports
          headers: options.options?.headers,
        }
      );

      logger.info(`${this.resourceName} export completed`, {
        operation: `${this.resourceName.toLowerCase()}.export`,
        metadata: {
          format,
          hasUrl: !!response.data.url,
          hasData: !!response.data.data,
          statusCode: response.status,
        },
      });

      return response.data;
    } catch (error) {
      logger.error(
        `Failed to export ${this.resourceName}`,
        {
          operation: `${this.resourceName.toLowerCase()}.export`,
          metadata: { format },
        },
        error as Error
      );
      throw error;
    }
  }

  /**
   * Get resource schema information
   */
  async getSchema(options: RequestOptions = {}): Promise<ResourceSchema> {
    logger.debug(`Getting ${this.resourceName} schema`, {
      operation: `${this.resourceName.toLowerCase()}.get_schema`,
    });

    try {
      const response = await this.httpClient.get<ResourceSchema>(`${this.resourcePath}/schema`, {
        timeout: options.timeout,
        headers: options.headers,
      });

      logger.info(`${this.resourceName} schema retrieved successfully`, {
        operation: `${this.resourceName.toLowerCase()}.get_schema`,
        metadata: {
          fieldCount: response.data.fields.length,
          operationCount: response.data.operations.length,
          statusCode: response.status,
        },
      });

      return response.data;
    } catch (error) {
      logger.error(
        `Failed to get ${this.resourceName} schema`,
        {
          operation: `${this.resourceName.toLowerCase()}.get_schema`,
        },
        error as Error
      );
      throw error;
    }
  }

  /**
   * Sanitize data for logging (remove sensitive fields)
   */
  protected sanitizeLogData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sensitiveFields = ['password', 'token', 'secret', 'key', 'apiKey', 'authorization'];
    const sanitized = { ...data };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  /**
   * Get the resource name
   */
  getResourceName(): string {
    return this.resourceName;
  }

  /**
   * Get the resource path
   */
  getResourcePath(): string {
    return this.resourcePath;
  }
}
