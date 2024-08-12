import { AxiosInstance } from 'axios';

interface MakeRequestOptions {
  method: string;
  path: string;
  data?: any;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  spec?: any; // Add spec if necessary
  args?: any[]; // Add args if necessary
}

const makeRequest = (
  stateset: { _request: AxiosInstance },
  options: MakeRequestOptions
) => {
  // Use options.spec and options.args if needed
  return stateset._request({
    method: options.method,
    url: options.path,
    data: options.data,
    headers: options.headers,
    params: options.params,
  });
};

export default makeRequest;
