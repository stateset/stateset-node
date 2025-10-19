import { Stateset } from './Stateset';
import { AxiosResponse } from 'axios';

export interface StatesetResourceOptions {
  stateset: Stateset;
  path: string;
  operations: string[];
}

class StatesetResource {
  protected stateset: Stateset;
  protected path: string;
  protected operations: string[];
  [key: string]: any;

  constructor(options: StatesetResourceOptions) {
    this.stateset = options.stateset;
    this.path = options.path;
    this.operations = options.operations;

    this.operations.forEach(operation => {
      this[operation] = this.createMethod(operation);
    });
  }

  private createMethod(operation: string) {
    return async (params?: any): Promise<AxiosResponse> => {
      const method = this.getHttpMethod(operation);
      const path = this.getPath(operation, params);
      const data = this.getData(operation, params);

      return this.stateset.request(method, path, data);
    };
  }

  private getHttpMethod(operation: string): string {
    switch (operation) {
      case 'list':
      case 'retrieve':
        return 'GET';
      case 'create':
        return 'POST';
      case 'update':
        return 'PUT';
      case 'delete':
        return 'DELETE';
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
  }

  private getPath(operation: string, params?: any): string {
    switch (operation) {
      case 'list':
        return this.path;
      case 'retrieve':
      case 'update':
      case 'delete':
        return `${this.path}${params.id}`;
      case 'create':
        return this.path;
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
  }

  private getData(operation: string, params?: any): any {
    switch (operation) {
      case 'list':
      case 'retrieve':
        return { params };
      case 'create':
      case 'update':
        return params;
      case 'delete':
        return null;
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
  }
}

export default StatesetResource;
