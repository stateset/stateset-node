import { AxiosError } from 'axios';
import { EnhancedHttpClient } from '../src/core/http-client';

describe('EnhancedHttpClient', () => {
  it('applies error interceptors before transforming axios errors', async () => {
    const client = new EnhancedHttpClient({
      baseURL: 'https://example.com',
      apiKey: 'test-key',
    });

    const axiosInstance = (client as any).axiosInstance;
    const axiosError: AxiosError = {
      isAxiosError: true,
      config: { url: '/resource', method: 'GET' } as any,
      message: 'original failure',
      name: 'AxiosError',
      toJSON: () => ({}),
      response: {
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config: {} as any,
        data: { message: 'boom' },
      },
    } as AxiosError;

    const originalAdapter = axiosInstance.defaults.adapter;
    axiosInstance.defaults.adapter = jest.fn().mockRejectedValue(axiosError);

    client.addErrorInterceptor(error => {
      error.response = {
        ...(error.response || {}),
        status: 404,
        data: { message: 'not found' },
        headers: {},
        config: error.config,
        statusText: 'Not Found',
      } as any;
      return error;
    });

    await expect(client.request({ url: '/resource', method: 'GET' })).rejects.toMatchObject({
      name: 'StatesetNotFoundError',
      statusCode: 404,
    });

    axiosInstance.defaults.adapter = originalAdapter;
    client.destroy();
  });
});
