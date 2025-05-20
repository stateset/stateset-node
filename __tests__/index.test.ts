import stateset from '../src';

test('exports stateset class', () => {
  expect(typeof stateset).toBe('function');
});

test('sets default timeout and user agent', () => {
  const client: any = new stateset({ apiKey: 'test-key' });
  expect(client.httpClient.defaults.timeout).toBe(60000);
  expect(client.httpClient.defaults.headers['User-Agent']).toMatch(/^stateset-node\//);
});

test('uses environment variables when options are omitted', () => {
  process.env.STATESET_API_KEY = 'env-key';
  process.env.STATESET_BASE_URL = 'https://example.com/api';

  const client: any = new stateset({});

  expect(client.httpClient.defaults.baseURL).toBe('https://example.com/api');
  expect(client.httpClient.defaults.headers['Authorization']).toBe('Bearer env-key');

  delete process.env.STATESET_API_KEY;
  delete process.env.STATESET_BASE_URL;
});

test('allows updating configuration after init', () => {
  const client: any = new stateset({ apiKey: 'init-key', baseUrl: 'https://a' });
  client.setApiKey('new-key');
  client.setBaseUrl('https://b');
  client.setTimeout(12345);

  client.setHeaders({ 'X-Test': 'true' });

  expect(client.httpClient.defaults.headers['Authorization']).toBe('Bearer new-key');
  expect(client.httpClient.defaults.baseURL).toBe('https://b');
  expect(client.httpClient.defaults.timeout).toBe(12345);
  expect(client.httpClient.defaults.headers['X-Test']).toBe('true');
});

test('applies additional headers from options', () => {
  const client: any = new stateset({
    apiKey: 'test',
    additionalHeaders: { 'X-Example': 'example' }
  });

  expect(client.httpClient.defaults.headers['X-Example']).toBe('example');
});
