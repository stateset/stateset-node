# Stateset Node.js Library

The Stateset Node.js Library provides convenient access to the Stateset API from applications written in server-side JavaScript.

## Installation

Install the package with:

```bash
npm install stateset-node --save
```

## Usage

The package needs to be configured with your account's secret key, which is available in the Stateset Cloud Platform Dashboard.

## Get started with the Stateset API

1. **Go to the Stateset Cloud Platform Dashboard.**
2. **Login with your Stateset account.**
3. **Create an API key.**
4. **Try the Node.js quickstart**

### AI Agent capabilities

The SDK exposes helper classes for building intelligent agents. These include:

- **Agents** for managing agent state and assignments.
- **Responses** to store generated replies.
- **Rules** to automate behaviour.
- **Attributes** describing agent skills or traits.
- **Knowledge** base entries for retrieval.
- **Evals** to record evaluation metrics.
- **OpenAIIntegration** for generating chat completions.

## Usage example

See the Node.js quickstart for complete code.

1. **Install the SDK package**

```bash
npm install stateset-node
```

2. **Initialize the client**

```javascript
import stateset from 'stateset-node';

const client = new stateset({
  // apiKey and baseUrl can be omitted if the STATESET_API_KEY and
  // STATESET_BASE_URL environment variables are set.
  apiKey: process.env.STATESET_API_KEY,
  // Optional retry logic for transient failures
  retry: 3,
  retryDelayMs: 1000,
  // Optional request timeout and custom User-Agent
  timeout: 60000,
  userAgent: 'my-app/1.0',
  // Information about your app added to the User-Agent header
  appInfo: { name: 'MyApp', version: '1.0', url: 'https://example.com' },
  // Additional headers sent with every request
  additionalHeaders: { 'X-Customer-ID': 'abc123' },
  // Optional HTTP proxy
  proxy: 'http://localhost:3128'
});
```

Retry behaviour can also be configured using the `STATESET_RETRY` and
`STATESET_RETRY_DELAY_MS` environment variables. Proxy settings can be provided
via the `STATESET_PROXY` environment variable.

### Updating configuration after initialization

The SDK exposes helper methods to update the API key, base URL and timeout on an existing client instance:

```javascript
client.setApiKey('new-key');
client.setBaseUrl('https://api.example.com');
client.setTimeout(30000);
client.setRetryOptions(5, 500);
client.setRetryStrategy({ baseDelay: 750, jitter: false });
client.setHeaders({ 'X-Customer-ID': 'abc123' });
client.setProxy('http://localhost:3128');
client.setAppInfo({ name: 'MyApp', version: '1.0', url: 'https://example.com' });
```

3. **Make an API call**

```javascript
try {
  const response = await client.returns.list();
  const returns = response.returns;
  console.log(returns);
} catch (error) {
  console.error('Error fetching returns:', error);
}
```

### Error handling

All failed requests throw subclasses of `StatesetError`. You can check the
instance type to handle specific cases:

```javascript
import { StatesetNotFoundError } from 'stateset-node';

try {
  await client.orders.get('ord_123');
} catch (err) {
  if (err instanceof StatesetNotFoundError) {
    console.log('Order not found');
  } else {
    console.error('API request failed', err);
  }
}
```

### Working with case tickets

```javascript
const ticket = await client.casesTickets.create({
  customer_id: 'cust_123',
  status: 'OPEN',
  priority: 'MEDIUM',
  subject: 'Question about my order',
  description: 'The package arrived damaged.'
});

await client.casesTickets.assign(ticket.id, 'agent_123');
await client.casesTickets.addNote(ticket.id, 'Customer will provide photos.');
await client.casesTickets.escalate(ticket.id, 'HIGH');
await client.casesTickets.close(ticket.id);
await client.casesTickets.reopen(ticket.id, 'Additional information received.');

const searchResults = await client.casesTickets.search('damaged', {
  status: 'OPEN'
});
console.log(searchResults.cases_tickets);

const notes = await client.casesTickets.listNotes(ticket.id);
console.log(notes);
```

### Generating responses with OpenAI

```javascript
import { OpenAIIntegration } from 'stateset-node';

const openai = new OpenAIIntegration(process.env.OPENAI_API_KEY || 'sk-test');
const completion = await openai.createChatCompletion([
  { role: 'user', content: 'Where is my order?' }
]);
console.log(completion.choices[0].message.content);
```

### Advanced request options

Fine-tune caching, retries, and safety per request:

```typescript
const controller = new AbortController();

const inventory = await client.request('GET', '/inventory', null, {
  params: { org_id: 'org_123' },
  cache: { key: 'inventory:org_123', ttl: 60_000 },
  invalidateCachePaths: ['inventory/count'],
  idempotencyKey: 'idem-xyz',
  signal: controller.signal,
  retryOptions: { maxAttempts: 4, baseDelay: 250 },
  onRetryAttempt: ({ attempt, delay }) => {
    console.log(`retry #${attempt} scheduled in ${delay}ms`);
  }
});
```

Disable caching entirely with `cache: false`, or override the default retry strategy globally via `client.setRetryStrategy()` when your deployment requires different backoff semantics.

### Managing orders

```javascript
const order = await client.orders.create({
  customer_id: 'cust_123',
  items: [], // order items here
  shipping_address: {
    first_name: 'John',
    last_name: 'Doe',
    street_address1: '1 Market St',
    city: 'San Francisco',
    state: 'CA',
    postal_code: '94105',
    country: 'US'
  },
  payment_details: {
    payment_method: 'card',
    status: 'authorized',
    amount_paid: 0,
    currency: 'USD'
  },
  totals: {
    subtotal: 0,
    shipping_total: 0,
    tax_total: 0,
    discount_total: 0,
    grand_total: 0,
    currency: 'USD'
  }
});

await client.orders.updateShippingAddress(order.id, {
  first_name: 'Jane',
  last_name: 'Doe',
  street_address1: '2 Market St',
  city: 'San Francisco',
  state: 'CA',
  postal_code: '94105',
  country: 'US'
});

await client.orders.updateBillingAddress(order.id, {
  first_name: 'Jane',
  last_name: 'Doe',
  street_address1: '2 Market St',
  city: 'San Francisco',
  state: 'CA',
  postal_code: '94105',
  country: 'US'
});

await client.orders.addNote(order.id, 'Customer requested gift wrap');
const orderNotes = await client.orders.listNotes(order.id);
console.log(orderNotes);

// Search orders and delete when necessary
const searchResults = await client.orders.search('Doe', { status: 'CONFIRMED' });
console.log(searchResults.orders);
await client.orders.delete(order.id);
```

### Generating shipping labels

```javascript
// Generate a shipping label for an existing shipment
const label = await client.shipments.generateLabel('ship_123', { format: 'PDF' });
console.log(label.label_url);
```

## Try out a sample app

This repository contains sample Node and web apps demonstrating how the SDK can access and utilize the Stateset API for various use cases.

**To try out the sample Node app, follow these steps:**

1. **Check out the Stateset Node.js Library repository.**
2. **Obtain an API key from the Stateset Cloud Platform Dashboard.**
3. **Navigate to the `samples` folder and run `npm install`.**
4. **Set your API key as an environment variable: `export STATESET_API_KEY=YOUR_API_KEY`.**
   You can also override the API base URL with `export STATESET_BASE_URL=https://your-endpoint`.
5. **Open the sample file you're interested in, e.g., `returns_list.js`.**
6. **Run the sample file: `node returns_list.js`.**

## Documentation

See the [Stateset API Documentation](https://docs.stateset.io) for complete documentation.

## Contributing

See [CONTRIBUTING.md](https://github.com/stateset/stateset-node/blob/main/CONTRIBUTING.md) for more information on contributing to the Stateset Node.js Library.

## License

The contents of this repository are licensed under the Apache License, version 2.0.
