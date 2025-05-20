import stateset from '../src';

test('exports stateset class', () => {
  expect(typeof stateset).toBe('function');
});

test('sets default timeout and user agent', () => {
  const client: any = new stateset({ apiKey: 'test-key' });
  expect(client.httpClient.defaults.timeout).toBe(60000);
  expect(client.httpClient.defaults.headers['User-Agent']).toMatch(/^stateset-node\//);
});
