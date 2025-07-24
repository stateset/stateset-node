'use strict';

import StatesetMethod from './StatesetMethod';
import { AxiosRequestConfig } from 'axios';

// Interface to define method definition structure
interface MethodDefinition {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path?: string;
  urlParams?: string[];
}

// StatesetMethodFunction signature to ensure consistent method implementation
type StatesetMethodFunction = (
  params?: Record<string, any>,
  options?: AxiosRequestConfig
) => Promise<any>;

// Define common method configurations
const createMethod = (config: MethodDefinition): StatesetMethodFunction => {
  return StatesetMethod(config);
};

// Interface for common CRUD methods
interface CommonMethods {
  create: StatesetMethodFunction;
  list: StatesetMethodFunction;
  retrieve: StatesetMethodFunction;
  update: StatesetMethodFunction;
  del: StatesetMethodFunction;
}

// Common CRUD methods implemented using StatesetMethod
const commonMethods: CommonMethods = {
  create: createMethod({
    method: 'POST',
    path: '/', // Assuming the base path handles POST for creation
  }),

  list: createMethod({
    method: 'GET',
    path: '/',
  }),

  retrieve: createMethod({
    method: 'GET',
    path: '/{id}',
    urlParams: ['id'],
  }),

  update: createMethod({
    method: 'PUT',
    path: '/{id}',
    urlParams: ['id'],
  }),

  del: createMethod({
    method: 'DELETE',
    path: '/{id}',
    urlParams: ['id'],
  }),
};

export default commonMethods;
