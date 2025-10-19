/**
 * Inventory snapshot caching demo with mocked HTTP responses.
 *
 * Run with:
 *    npx ts-node samples/inventory-cache-sample.ts
 */

import StatesetClient from '../src';

interface InventoryRecord {
  org_id: string;
  version: number;
  quantityOnHand: number;
}

type AxiosLikeConfig = {
  method?: string;
  url?: string;
  data?: any;
  params?: any;
};

function createMockedInventoryClient(): StatesetClient {
  const client = new StatesetClient({
    apiKey: 'sk-mock',
    baseUrl: 'https://mock.stateset.local',
    cache: { enabled: true, ttl: 120_000 },
  });

  const db: InventoryRecord = {
    org_id: 'acme-co',
    version: 1,
    quantityOnHand: 240,
  };

  const transport = (client as any).httpClient;

  transport.request = async (config: AxiosLikeConfig) => {
    const method = String(config.method || 'get').toUpperCase();
    const path = String(config.url || '').replace(/^\//, '').split('?')[0];

    if (method === 'GET' && path === 'inventory') {
      return {
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        data: {
          org_id: db.org_id,
          version: db.version,
          products: [
            { sku: 'SKU-001', quantity: db.quantityOnHand, updated_at: new Date().toISOString() },
          ],
        },
      };
    }

    if (method === 'GET' && path === 'inventory/count') {
      return {
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        data: { count: db.quantityOnHand, version: db.version },
      };
    }

    if (method === 'POST' && path === 'inventory/recount') {
      db.version += 1;
      db.quantityOnHand = config.data?.adjustment ?? db.quantityOnHand;
      return {
        status: 202,
        statusText: 'Accepted',
        headers: {},
        config,
        data: { message: 'Recount scheduled', version: db.version },
      };
    }

    throw new Error(`No mock route for ${method} ${path}`);
  };

  return client;
}

async function run(): Promise<void> {
  const client = createMockedInventoryClient();
  const cacheKey = 'inventory:acme-co';

  const firstSnapshot = await client.request('GET', 'inventory', undefined, {
    params: { org_id: 'acme-co' },
    cache: { key: cacheKey, ttl: 5_000 },
  });
  console.log('Initial snapshot:', firstSnapshot);

  const cachedSnapshot = await client.request('GET', 'inventory', undefined, {
    params: { org_id: 'acme-co' },
    cache: { key: cacheKey },
  });
  console.log('Served from cache:', cachedSnapshot);

  await client.request(
    'POST',
    'inventory/recount',
    { adjustment: 260 },
    {
      invalidateCachePaths: ['inventory', 'inventory/count'],
    }
  );
  console.log('Inventory recount requested, cache invalidated.');

  const refreshedSnapshot = await client.request('GET', 'inventory', undefined, {
    params: { org_id: 'acme-co' },
    cache: { key: cacheKey, ttl: 5_000 },
  });
  console.log('Refreshed snapshot:', refreshedSnapshot);

  const count = await client.request('GET', 'inventory/count', undefined, {
    params: { org_id: 'acme-co' },
    cache: false,
  });
  console.log('Live count fetch bypassing cache:', count);
}

run().catch(error => {
  console.error('Inventory sample failed', error);
  process.exitCode = 1;
});
