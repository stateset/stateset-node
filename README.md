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
  // Additional headers sent with every request
  additionalHeaders: { 'X-Customer-ID': 'abc123' }
});
```

Retry behaviour can also be configured using the `STATESET_RETRY` and
`STATESET_RETRY_DELAY_MS` environment variables.

### Updating configuration after initialization

The SDK exposes helper methods to update the API key, base URL and timeout on an existing client instance:

```javascript
client.setApiKey('new-key');
client.setBaseUrl('https://api.example.com');
client.setTimeout(30000);
client.setRetryOptions(5, 500);
client.setHeaders({ 'X-Customer-ID': 'abc123' });
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