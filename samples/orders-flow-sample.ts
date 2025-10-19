/**
 * Orders end-to-end happy path using a mocked transport.
 *
 * Run with:
 *    npx ts-node samples/orders-flow-sample.ts
 *
 * The sample exercises resource helpers, cache configuration, cache invalidation,
 * and the typed metrics endpoint without making real HTTP calls.
 */

import StatesetClient from '../src';

type MockHandler = (config: any) => any;

interface MockRoute {
  match(method: string, path: string): boolean;
  handle: MockHandler;
}

interface OrderRecord {
  id: string;
  status: string;
  data: {
    customer_id: string;
    notes: string[];
    shipping_address: Record<string, any>;
    totals: Record<string, any>;
  };
  timeline: string[];
}

function createMockedClient(): StatesetClient {
  const client = new StatesetClient({
    apiKey: 'sk-mock',
    baseUrl: 'https://mock.stateset.local',
    cache: { enabled: true, ttl: 60_000 },
  });

  const transport = (client as any).httpClient;
  const db: { order: OrderRecord | null } = { order: null };

  const routes: MockRoute[] = [
    {
      match: (method, path) => method === 'POST' && path === 'orders',
      handle: config => {
        const id = 'ord_mock_123';
        const now = new Date().toISOString();
        db.order = {
          id,
          status: 'CONFIRMED',
          data: {
            customer_id: config.data.customer_id,
            notes: [],
            shipping_address: config.data.shipping_address,
            totals: config.data.totals,
          },
          timeline: [`${now}: order created`],
        };
        return { id, object: 'order', status: db.order.status, data: { ...config.data, id } };
      },
    },
    {
      match: (method, path) => method === 'PUT' && path.endsWith('/shipping-address'),
      handle: config => {
        if (!db.order) throw new Error('Order not found');
        db.order.data.shipping_address = config.data;
        db.order.timeline.push(`${new Date().toISOString()}: shipping address updated`);
        return { ...db.order, data: { ...db.order.data, totals: db.order.data.totals } };
      },
    },
    {
      match: (method, path) => method === 'POST' && path.endsWith('/notes'),
      handle: config => {
        if (!db.order) throw new Error('Order not found');
        db.order.data.notes.push(config.data.note);
        db.order.timeline.push(`${new Date().toISOString()}: note added`);
        return { ...db.order, data: { ...db.order.data, totals: db.order.data.totals } };
      },
    },
    {
      match: (method, path) => method === 'GET' && path.endsWith('/notes'),
      handle: () => {
        if (!db.order) throw new Error('Order not found');
        return { notes: [...db.order.data.notes] };
      },
    },
    {
      match: (method, path) => method === 'POST' && path.endsWith('/process'),
      handle: () => {
        if (!db.order) throw new Error('Order not found');
        db.order.status = 'PROCESSING';
        db.order.timeline.push(`${new Date().toISOString()}: order processing started`);
        return { ...db.order, data: { ...db.order.data, totals: db.order.data.totals } };
      },
    },
    {
      match: (method, path) => method === 'POST' && path.endsWith('/ship'),
      handle: config => {
        if (!db.order) throw new Error('Order not found');
        db.order.status = 'SHIPPED';
        db.order.timeline.push(
          `${new Date().toISOString()}: shipped via ${config.data.carrier} ${config.data.method}`
        );
        return { ...db.order, data: { ...db.order.data, totals: db.order.data.totals } };
      },
    },
    {
      match: (method, path) => method === 'POST' && path.endsWith('/deliver'),
      handle: () => {
        if (!db.order) throw new Error('Order not found');
        db.order.status = 'DELIVERED';
        db.order.timeline.push(`${new Date().toISOString()}: order delivered`);
        return { ...db.order, data: { ...db.order.data, totals: db.order.data.totals } };
      },
    },
    {
      match: (method, path) => method === 'GET' && path === 'orders/metrics',
      handle: () => {
        if (!db.order) throw new Error('Order not found');
        return {
          total_orders: 1,
          total_revenue: Number(db.order.data.totals.grand_total),
          average_order_value: Number(db.order.data.totals.grand_total),
          fulfillment_rate: db.order.status === 'DELIVERED' ? 1 : 0,
          return_rate: 0,
          status_breakdown: {
            DRAFT: 0,
            PENDING: 0,
            CONFIRMED: db.order.status === 'CONFIRMED' ? 1 : 0,
            PROCESSING: db.order.status === 'PROCESSING' ? 1 : 0,
            PICKING: 0,
            PACKING: 0,
            SHIPPED: db.order.status === 'SHIPPED' ? 1 : 0,
            IN_TRANSIT: 0,
            OUT_FOR_DELIVERY: 0,
            DELIVERED: db.order.status === 'DELIVERED' ? 1 : 0,
            CANCELLED: 0,
            RETURNED: 0,
            REFUNDED: 0,
          },
        };
      },
    },
    {
      match: (method, path) => method === 'GET' && path.startsWith('orders/ord_mock_123'),
      handle: () => {
        if (!db.order) throw new Error('Order not found');
        return {
          id: db.order.id,
          status: db.order.status,
          notes: [...db.order.data.notes],
          shipping_address: db.order.data.shipping_address,
        };
      },
    },
  ];

  transport.request = async (config: any) => {
    const method = String(config.method || 'get').toUpperCase();
    const path = String(config.url || '').replace(/^\//, '');
    const normalizedPath = path.split('?')[0];
    const route = routes.find(r => r.match(method, normalizedPath));

    if (!route) {
      throw new Error(`No mock handler for ${method} ${normalizedPath}`);
    }

    const data = route.handle(config);
    return {
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
      data,
    };
  };

  return client;
}

async function run(): Promise<void> {
  const client = createMockedClient();

  const newOrder = await client.orders.create({
    customer_id: 'cust_001',
    items: [
      {
        product_id: 'prod_001',
        quantity: 1,
        unit_price: 125,
        total_amount: 125,
      },
    ],
    shipping_address: {
      first_name: 'Ada',
      last_name: 'Lovelace',
      street_address1: '10 Analytical Engine Way',
      city: 'London',
      state: 'LND',
      postal_code: 'E1 6AN',
      country: 'UK',
    },
    payment_details: {
      payment_method: 'card',
      status: 'authorized',
      amount_paid: 125,
      currency: 'GBP',
    },
    totals: {
      subtotal: 125,
      shipping_total: 0,
      tax_total: 0,
      discount_total: 0,
      grand_total: 125,
      currency: 'GBP',
    },
  } as any);

  console.log('Created order:', newOrder.id);

  await client.orders.updateShippingAddress(newOrder.id, {
    first_name: 'Ada',
    last_name: 'Lovelace',
    street_address1: '12 Analytical Engine Way',
    city: 'London',
    state: 'LND',
    postal_code: 'E1 6AN',
    country: 'UK',
  } as any);
  console.log('Updated shipping address.');

  await client.orders.addNote(
    newOrder.id,
    'Gift wrap requested',
    {
      cache: false,
      invalidateCachePaths: [`orders/${newOrder.id}`],
    } as any
  );
  console.log('Added customer note.');

  const notes = await client.orders.listNotes(newOrder.id);
  console.log('Current notes:', notes);

  await client.orders.process(newOrder.id);
  await client.orders.ship(newOrder.id, {
    carrier: 'DHL',
    method: 'EXPRESS',
    shipping_cost: 12.5,
  } as any);
  await client.orders.markDelivered(newOrder.id);
  console.log('Order fulfilled.');

  // Demonstrate cached read with explicit cache key
  const cacheKey = `order:${newOrder.id}`;
  const firstFetch = await client.request('GET', `orders/${newOrder.id}`, undefined, {
    cache: { key: cacheKey, ttl: 30_000 },
  });
  const cachedFetch = await client.request('GET', `orders/${newOrder.id}`, undefined, {
    cache: { key: cacheKey },
  });
  console.log('Cache hit returns the same payload:', firstFetch.id === cachedFetch.id);

  const metrics = await client.orders.getMetrics();
  console.log('Order metrics snapshot:', metrics);
}

run().catch(error => {
  console.error('Sample failed', error);
  process.exitCode = 1;
});
