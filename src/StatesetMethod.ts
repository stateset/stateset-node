'use strict';

import utils from './utils';
import makeRequest from './makeRequest';
import { makeAutoPaginationMethods } from './autoPagination';
import { AxiosInstance } from 'axios';

export interface StatesetMethodOptions  {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path?: string;
  fullPath?: string;
  urlParams?: string[];
  encode?: (data: any) => any;
  host?: string;
  methodType?: 'list' | 'search' | string;
}

interface StatesetResource {
  createResourcePathWithSymbols(path: string): string;
  _request: AxiosInstance;
  [key: string]: any;
}

type StatesetMethodFunction = (
  this: StatesetResource,
  ...args: any[]
) => Promise<any>;

/**
 * Creates a method for interacting with the Stateset API.
 * @param {MethodSpec} spec - The specification for the method, defining the HTTP method, path, etc.
 * @returns {StatesetMethodFunction} - The function to be used for making the API request.
 */
function statesetMethod(spec: StatesetMethodOptions): StatesetMethodFunction {
  if (spec.path && spec.fullPath) {
    throw new Error(
      `Method spec should not specify both 'path' (${spec.path}) and 'fullPath' (${spec.fullPath}).`
    );
  }

  return function (this: StatesetResource, ...args: any[]): Promise<any> {
    const callback = typeof args[args.length - 1] === 'function' ? args.pop() : undefined;

    const urlParams = utils.extractUrlParams(
      spec.fullPath || this.createResourcePathWithSymbols(spec.path || '')
    );

    spec.urlParams = urlParams;

    const requestPromise = utils.callbackifyPromiseWithTimeout(
      makeRequest(this, { method: spec.method || 'GET', path: spec.fullPath || this.createResourcePathWithSymbols(spec.path || ''), params: args }),
      callback
    );

    if (spec.methodType === 'list' || spec.methodType === 'search') {
      const autoPaginationMethods = makeAutoPaginationMethods(
        this,
        args,
        spec,
        requestPromise
      );
      Object.assign(requestPromise, autoPaginationMethods);
    }

    return requestPromise;
  };
}

export default statesetMethod;
