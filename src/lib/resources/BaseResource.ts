import { StatesetClient } from '../../client';
import { RequestOptions, ListResponse, PaginationParams } from '../../types';
import { logger } from '../../utils/logger';
import { performanceMonitor } from '../../utils/performance';

export interface BaseResourceInterface {
  create(data: any, options?: RequestOptions): Promise<any>;
  get(id: string, options?: RequestOptions): Promise<any>;
  update(id: string, data: any, options?: RequestOptions): Promise<any>;
  delete(id: string, options?: RequestOptions): Promise<any>;
  list(params?: PaginationParams & any, options?: RequestOptions): Promise<ListResponse<any>>;
  search(query: string, params?: any, options?: RequestOptions): Promise<ListResponse<any>>;
  count(params?: any, options?: RequestOptions): Promise<{ count: number }>;
  exists(id: string, options?: RequestOptions): Promise<{ exists: boolean }>;
}

export abstract class BaseResource implements BaseResourceInterface {
  protected client: StatesetClient;
  protected resourcePath: string;
  protected resourceName: string;

  constructor(client: StatesetClient, resourcePath: string, resourceName: string) {
    this.client = client;
    this.resourcePath = resourcePath;
    this.resourceName = resourceName;
  }

  /**
   * Create a new resource
   */
  async create(data: any, options: RequestOptions = {}): Promise<any> {
    const timer = performanceMonitor.startTimer(`${this.resourceName}.create`);
    
    try {
      logger.debug(`Creating ${this.resourceName}`, {
        operation: `${this.resourceName}.create`,
        metadata: { resourcePath: this.resourcePath },
      });

      const response = await this.client.request('POST', this.resourcePath, data, options);
      
      timer.end(true);
      logger.info(`${this.resourceName} created successfully`, {
        operation: `${this.resourceName}.create`,
        metadata: { id: response.id },
      });
      
      return response;
    } catch (error) {
      timer.end(false, (error as Error).message);
      logger.error(`Failed to create ${this.resourceName}`, {
        operation: `${this.resourceName}.create`,
      }, error as Error);
      throw error;
    }
  }

  /**
   * Get a resource by ID
   */
  async get(id: string, options: RequestOptions = {}): Promise<any> {
    const timer = performanceMonitor.startTimer(`${this.resourceName}.get`);
    
    try {
      logger.debug(`Fetching ${this.resourceName}`, {
        operation: `${this.resourceName}.get`,
        metadata: { id, resourcePath: this.resourcePath },
      });

      const response = await this.client.request('GET', `${this.resourcePath}/${id}`, undefined, options);
      
      timer.end(true);
      return response;
    } catch (error) {
      timer.end(false, (error as Error).message);
      logger.error(`Failed to fetch ${this.resourceName}`, {
        operation: `${this.resourceName}.get`,
        metadata: { id },
      }, error as Error);
      throw error;
    }
  }

  /**
   * Update a resource
   */
  async update(id: string, data: any, options: RequestOptions = {}): Promise<any> {
    const timer = performanceMonitor.startTimer(`${this.resourceName}.update`);
    
    try {
      logger.debug(`Updating ${this.resourceName}`, {
        operation: `${this.resourceName}.update`,
        metadata: { id, resourcePath: this.resourcePath },
      });

      const response = await this.client.request('PUT', `${this.resourcePath}/${id}`, data, options);
      
      timer.end(true);
      logger.info(`${this.resourceName} updated successfully`, {
        operation: `${this.resourceName}.update`,
        metadata: { id },
      });
      
      return response;
    } catch (error) {
      timer.end(false, (error as Error).message);
      logger.error(`Failed to update ${this.resourceName}`, {
        operation: `${this.resourceName}.update`,
        metadata: { id },
      }, error as Error);
      throw error;
    }
  }

  /**
   * Delete a resource
   */
  async delete(id: string, options: RequestOptions = {}): Promise<any> {
    const timer = performanceMonitor.startTimer(`${this.resourceName}.delete`);
    
    try {
      logger.debug(`Deleting ${this.resourceName}`, {
        operation: `${this.resourceName}.delete`,
        metadata: { id, resourcePath: this.resourcePath },
      });

      const response = await this.client.request('DELETE', `${this.resourcePath}/${id}`, undefined, options);
      
      timer.end(true);
      logger.info(`${this.resourceName} deleted successfully`, {
        operation: `${this.resourceName}.delete`,
        metadata: { id },
      });
      
      return response;
    } catch (error) {
      timer.end(false, (error as Error).message);
      logger.error(`Failed to delete ${this.resourceName}`, {
        operation: `${this.resourceName}.delete`,
        metadata: { id },
      }, error as Error);
      throw error;
    }
  }

  /**
   * List resources with pagination
   */
  async list(params: PaginationParams & any = {}, options: RequestOptions = {}): Promise<ListResponse<any>> {
    const timer = performanceMonitor.startTimer(`${this.resourceName}.list`);
    
    try {
      logger.debug(`Listing ${this.resourceName}`, {
        operation: `${this.resourceName}.list`,
        metadata: { params, resourcePath: this.resourcePath },
      });

      const config = {
        ...options,
        params,
      };

      const response = await this.client.request('GET', this.resourcePath, undefined, config);
      
      timer.end(true);
      return response;
    } catch (error) {
      timer.end(false, (error as Error).message);
      logger.error(`Failed to list ${this.resourceName}`, {
        operation: `${this.resourceName}.list`,
      }, error as Error);
      throw error;
    }
  }

  /**
   * Search resources
   */
  async search(query: string, params: any = {}, options: RequestOptions = {}): Promise<ListResponse<any>> {
    const timer = performanceMonitor.startTimer(`${this.resourceName}.search`);
    
    try {
      logger.debug(`Searching ${this.resourceName}`, {
        operation: `${this.resourceName}.search`,
        metadata: { query, params, resourcePath: this.resourcePath },
      });

      const searchParams = {
        query,
        ...params,
      };

      const config = {
        ...options,
        params: searchParams,
      };

      const response = await this.client.request('GET', `${this.resourcePath}/search`, undefined, config);
      
      timer.end(true);
      return response;
    } catch (error) {
      timer.end(false, (error as Error).message);
      logger.error(`Failed to search ${this.resourceName}`, {
        operation: `${this.resourceName}.search`,
        metadata: { query },
      }, error as Error);
      throw error;
    }
  }

  /**
   * Count resources
   */
  async count(params: any = {}, options: RequestOptions = {}): Promise<{ count: number }> {
    const timer = performanceMonitor.startTimer(`${this.resourceName}.count`);
    
    try {
      logger.debug(`Counting ${this.resourceName}`, {
        operation: `${this.resourceName}.count`,
        metadata: { params, resourcePath: this.resourcePath },
      });

      const config = {
        ...options,
        params,
      };

      const response = await this.client.request('GET', `${this.resourcePath}/count`, undefined, config);
      
      timer.end(true);
      return response;
    } catch (error) {
      timer.end(false, (error as Error).message);
      logger.error(`Failed to count ${this.resourceName}`, {
        operation: `${this.resourceName}.count`,
      }, error as Error);
      throw error;
    }
  }

  /**
   * Check if a resource exists
   */
  async exists(id: string, options: RequestOptions = {}): Promise<{ exists: boolean }> {
    const timer = performanceMonitor.startTimer(`${this.resourceName}.exists`);
    
    try {
      logger.debug(`Checking if ${this.resourceName} exists`, {
        operation: `${this.resourceName}.exists`,
        metadata: { id, resourcePath: this.resourcePath },
      });

      try {
        await this.get(id, options);
        timer.end(true);
        return { exists: true };
      } catch (error: any) {
        if (error.statusCode === 404) {
          timer.end(true);
          return { exists: false };
        }
        throw error;
      }
    } catch (error) {
      timer.end(false, (error as Error).message);
      logger.error(`Failed to check if ${this.resourceName} exists`, {
        operation: `${this.resourceName}.exists`,
        metadata: { id },
      }, error as Error);
      throw error;
    }
  }

  /**
   * Bulk operations
   */
  async bulkCreate(items: any[], options: RequestOptions = {}): Promise<any> {
    const timer = performanceMonitor.startTimer(`${this.resourceName}.bulkCreate`);
    
    try {
      logger.debug(`Bulk creating ${this.resourceName}`, {
        operation: `${this.resourceName}.bulkCreate`,
        metadata: { count: items.length, resourcePath: this.resourcePath },
      });

      const response = await this.client.request('POST', `${this.resourcePath}/bulk`, { items }, options);
      
      timer.end(true);
      logger.info(`Bulk created ${this.resourceName}`, {
        operation: `${this.resourceName}.bulkCreate`,
        metadata: { count: items.length },
      });
      
      return response;
    } catch (error) {
      timer.end(false, (error as Error).message);
      logger.error(`Failed to bulk create ${this.resourceName}`, {
        operation: `${this.resourceName}.bulkCreate`,
      }, error as Error);
      throw error;
    }
  }

  async bulkUpdate(updates: { id: string; data: any }[], options: RequestOptions = {}): Promise<any> {
    const timer = performanceMonitor.startTimer(`${this.resourceName}.bulkUpdate`);
    
    try {
      logger.debug(`Bulk updating ${this.resourceName}`, {
        operation: `${this.resourceName}.bulkUpdate`,
        metadata: { count: updates.length, resourcePath: this.resourcePath },
      });

      const response = await this.client.request('PUT', `${this.resourcePath}/bulk`, { updates }, options);
      
      timer.end(true);
      logger.info(`Bulk updated ${this.resourceName}`, {
        operation: `${this.resourceName}.bulkUpdate`,
        metadata: { count: updates.length },
      });
      
      return response;
    } catch (error) {
      timer.end(false, (error as Error).message);
      logger.error(`Failed to bulk update ${this.resourceName}`, {
        operation: `${this.resourceName}.bulkUpdate`,
      }, error as Error);
      throw error;
    }
  }

  async bulkDelete(ids: string[], options: RequestOptions = {}): Promise<any> {
    const timer = performanceMonitor.startTimer(`${this.resourceName}.bulkDelete`);
    
    try {
      logger.debug(`Bulk deleting ${this.resourceName}`, {
        operation: `${this.resourceName}.bulkDelete`,
        metadata: { count: ids.length, resourcePath: this.resourcePath },
      });

      const response = await this.client.request('DELETE', `${this.resourcePath}/bulk`, { ids }, options);
      
      timer.end(true);
      logger.info(`Bulk deleted ${this.resourceName}`, {
        operation: `${this.resourceName}.bulkDelete`,
        metadata: { count: ids.length },
      });
      
      return response;
    } catch (error) {
      timer.end(false, (error as Error).message);
      logger.error(`Failed to bulk delete ${this.resourceName}`, {
        operation: `${this.resourceName}.bulkDelete`,
      }, error as Error);
      throw error;
    }
  }

  /**
   * Auto-paginating iterator
   */
  async *iterate(params: any = {}, options: RequestOptions = {}): AsyncIterableIterator<any> {
    let hasMore = true;
    let cursor: string | undefined = params.cursor;

    while (hasMore) {
      const response = await this.list({ ...params, cursor }, options);
      
      for (const item of response.data) {
        yield item;
      }
      
      hasMore = response.has_more;
      cursor = response.next_cursor;
    }
  }

  /**
   * Auto-paginating collect all
   */
  async collectAll(params: any = {}, options: RequestOptions = {}): Promise<any[]> {
    const items: any[] = [];
    
    for await (const item of this.iterate(params, options)) {
      items.push(item);
    }
    
    return items;
  }
}