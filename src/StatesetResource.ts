import utils from './utils';
import {
  StatesetConnectionError,
  StatesetAuthenticationError,
  StatesetPermissionError,
  StatesetRateLimitError,
  StatesetError,
  StatesetAPIError,
} from './StatesetError';
import HttpClient from './HttpClient';
import Stateset from './Stateset';
import StatesetMethod from './StatesetMethod';

interface StatesetResourceOptions {
  stateset: Stateset;
  // Add other options as needed
}

class StatesetResource {
  private _stateset: Stateset;
  private _httpClient: HttpClient;
  public basePath: (urlData: any) => string;
  public path: (urlData: any) => string;
  public resourcePath: string;

  public static extend = utils.protoExtend;
  public static method = StatesetMethod;
  public static BASIC_METHODS = require('./StatesetMethod.basic');
  public static MAX_BUFFERED_REQUEST_METRICS = 100;

  constructor(stateset: Stateset, deprecatedUrlData?: any) {
    this._stateset = stateset;
    this._httpClient = stateset.getApiField('httpClient');
  
    if (deprecatedUrlData) {
      throw new Error(
        'Support for curried url params was dropped in stateset-node v7.0.0. Instead, pass two ids.'
      );
    }
  
    const basePath = stateset.getApiField('basePath');
    this.basePath = utils.makeURLInterpolator(basePath);
    
    const path = '/default-path'; // or fetch it from stateset if dynamic
    this.path = utils.makeURLInterpolator(path);
    const urlData = {}; 
    this.resourcePath = this.path(urlData);
  
  }

  createFullPath(
    commandPath: string | ((urlData: any) => string),
    urlData: any
  ): string {
    const urlParts = [this.basePath(urlData), this.path(urlData)];

    if (typeof commandPath === 'function') {
      const computedCommandPath = commandPath(urlData);
      if (computedCommandPath) {
        urlParts.push(computedCommandPath);
      }
    } else {
      urlParts.push(commandPath);
    }

    return this._joinUrlParts(urlParts);
  }

  createResourcePathWithSymbols(pathWithSymbols?: string): string {
    return pathWithSymbols
      ? `/${this._joinUrlParts([this.resourcePath, pathWithSymbols])}`
      : `/${this.resourcePath}`;
  }

  private _joinUrlParts(parts: string[]): string {
    return parts.join('/').replace(/\/{2,}/g, '/');
  }

  private _getRequestOptions(
    method: string,
    host: string,
    path: string,
    data: any,
    auth: string,
    options: any
  ): any {
    return {
      method,
      url: `${host}${path}`,
      data,
      headers: {
        Authorization: auth,
        ...options.headers,
      },
      ...options,
    };
  }

  _request(
    method: string,
    host: string,
    path: string,
    data: any,
    auth: string,
    options: any = {},
    callback: (error: Error | null, response?: any) => void
  ): void {
    const requestOptions = this._getRequestOptions(
      method,
      host,
      path,
      data,
      auth,
      options
    );

    this._httpClient
      .request(requestOptions)
      .then((response) => {
        this._handleResponse(response, callback);
      })
      .catch((error) => {
        this._handleError(error, callback);
      });
  }

  private _handleResponse(
    response: any,
    callback: (error: Error | null, response?: any) => void
  ): void {
    // Process the response, handle different status codes, etc.
    callback(null, response);
  }

  private _handleError(
    error: any,
    callback: (error: Error | null, response?: any) => void
  ): void {
    if (error.isAxiosError) {
      switch (error.response?.status) {
        case 401:
          callback(new StatesetAuthenticationError({ type: 'AuthenticationError', message: 'Authentication failed.' }));
          break;
        case 403:
          callback(new StatesetPermissionError('Permission denied.'));
          break;
        case 429:
          callback(new StatesetRateLimitError('Rate limit exceeded.'));
          break;
        case 500:
        case 502:
        case 503:
          callback(new StatesetAPIError({ type: 'APIError', message: 'API error occurred.' }));
          break;
        default:
          callback(new StatesetError({ type: 'Error', message: 'An unknown error occurred.' }));
      }
    } else {
      callback(new StatesetConnectionError({ type: 'ConnectionError', message: 'Connection error occurred.' }));
    }
  }

  // Additional methods like _shouldRetry, _getSleepTimeInMS, etc. would be implemented here...
}

export default StatesetResource;
