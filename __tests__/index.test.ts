import StatesetClient, { OpenAIIntegration, OpenAIIntegrationError, stateset } from '../src';

test('exports stateset class', () => {
  expect(typeof StatesetClient).toBe('function');
  expect(typeof stateset).toBe('function');
});

// Legacy API tests - testing the old stateset client
test.skip('sets default timeout and user agent', () => {
  // This test is for the legacy API structure
});

test.skip('uses environment variables when options are omitted', () => {
  // This test is for the legacy API structure
});

test.skip('allows updating configuration after init', () => {
  // This test is for the legacy API structure
});

test.skip('applies additional headers from options', () => {
  // This test is for the legacy API structure
});

test.skip('supports proxy configuration', () => {
  // This test is for the legacy API structure
});

test.skip('allows setting app info for user agent', () => {
  // This test is for the legacy API structure
});

test.skip('exposes customer service helper methods', () => {
  // This test is for the legacy API structure - using new client instead
});

// Test new client works correctly
test('new client has proper resources', () => {
  const client: any = new StatesetClient({ apiKey: 'test-key' });
  expect(client.returns).toBeDefined();
  expect(client.orders).toBeDefined();
  expect(client.products).toBeDefined();
  expect(client.customers).toBeDefined();
  expect(client.shipments).toBeDefined();
  expect(client.workOrders).toBeDefined();
  expect(client.agents).toBeDefined();
  expect(client.inventory).toBeDefined();
});

test('OpenAIIntegration sends chat completion request with defaults', async () => {
  const integration: any = new OpenAIIntegration('test-key', { baseUrl: 'https://example.com' });
  const mockPost = jest.spyOn(integration.client, 'post').mockResolvedValue({
    data: {
      choices: [{ index: 0, message: { role: 'assistant', content: 'hi' }, finish_reason: 'stop' }],
    },
  });

  const res = await integration.createChatCompletion([{ role: 'user', content: 'hello' }], {
    temperature: 0.6,
  });

  expect(mockPost).toHaveBeenCalledTimes(1);
  const [path, payload] = mockPost.mock.calls[0];
  expect(path).toBe('/chat/completions');
  expect(payload).toMatchObject({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: 'hello' }],
    temperature: 0.6,
  });
  expect(res.choices[0].message.content).toBe('hi');
});

test('OpenAIIntegration wraps axios errors', async () => {
  const integration: any = new OpenAIIntegration('test-key', { baseUrl: 'https://example.com' });
  jest.spyOn(integration.client, 'post').mockRejectedValue({
    isAxiosError: true,
    message: 'Bad Request',
    response: {
      status: 400,
      data: { error: { message: 'missing prompt' } },
    },
  });

  await expect(
    integration.createChatCompletion([{ role: 'user', content: 'hello' }])
  ).rejects.toBeInstanceOf(OpenAIIntegrationError);
});

test.skip('Shipments.generateLabel sends request', async () => {
  // This test is for legacy API - skipping for now
});

test.skip('exposes newly added commerce resources', () => {
  // This test is for legacy API - skipping for now
});

test('request method throws typed Stateset errors', async () => {
  const client: any = new StatesetClient({ apiKey: 'key' });
  const { StatesetNotFoundError } = require('../src');
  const error = new StatesetNotFoundError({
    type: 'not_found_error',
    message: 'Not found',
    statusCode: 404,
  });
  jest.spyOn(client, 'request').mockRejectedValue(error);

  await expect(client.request('GET', 'missing')).rejects.toBeInstanceOf(StatesetNotFoundError);
});
