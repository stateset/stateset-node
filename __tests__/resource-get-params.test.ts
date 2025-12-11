import InvoiceLines from '../src/lib/resources/InvoiceLine';
import Fulfillment from '../src/lib/resources/Fulfillment';
import Settlements from '../src/lib/resources/Settlement';
import Payouts from '../src/lib/resources/Payout';
import Invoices from '../src/lib/resources/Invoice';
import Compliance from '../src/lib/resources/Compliance';
import Locations from '../src/lib/resources/Location';
import Promotions from '../src/lib/resources/Promotion';
import Assets from '../src/lib/resources/Asset';
import Contracts from '../src/lib/resources/Contract';
import CycleCounts from '../src/lib/resources/CycleCount';
import WasteAndScrap from '../src/lib/resources/WasteAndScrap';
import Leads from '../src/lib/resources/Lead';

type ResourceFactory = (client: any) => any;

describe('Resource list requests use query params', () => {
  const fixtures: Array<{
    name: string;
    factory: ResourceFactory;
    path: string;
    params: Record<string, any>;
    response: any;
  }> = [
    {
      name: 'InvoiceLines',
      factory: client => new InvoiceLines(client),
      path: 'invoice-lines',
      params: { status: 'PAID' },
      response: [],
    },
    {
      name: 'Fulfillment',
      factory: client => new Fulfillment(client),
      path: 'fulfillments',
      params: { status: 'PENDING' },
      response: [{ id: 'ful1', status: 'PENDING' }],
    },
    {
      name: 'Settlements',
      factory: client => new Settlements(client),
      path: 'settlements',
      params: { org_id: 'org_123' },
      response: [],
    },
    {
      name: 'Payouts',
      factory: client => new Payouts(client),
      path: 'payouts',
      params: { platform: 'stripe' },
      response: [],
    },
    {
      name: 'Invoices',
      factory: client => new Invoices(client),
      path: 'invoices',
      params: { customer_id: 'cust_1' },
      response: [{ id: 'inv1', status: 'PAID' }],
    },
    {
      name: 'Compliance',
      factory: client => new Compliance(client),
      path: 'compliance',
      params: { region: 'us' },
      response: [],
    },
    {
      name: 'Locations',
      factory: client => new Locations(client),
      path: 'locations',
      params: { type: 'warehouse' },
      response: [],
    },
    {
      name: 'Promotions',
      factory: client => new Promotions(client),
      path: 'promotions',
      params: { active: true },
      response: [],
    },
    {
      name: 'Assets',
      factory: client => new Assets(client),
      path: 'assets',
      params: { status: 'ACTIVE' },
      response: [{ id: 'asset1', status: 'ACTIVE' }],
    },
    {
      name: 'Contracts',
      factory: client => new Contracts(client),
      path: 'contracts',
      params: { org_id: 'org_123' },
      response: [],
    },
    {
      name: 'CycleCounts',
      factory: client => new CycleCounts(client),
      path: 'cycle-counts',
      params: { status: 'PENDING' },
      response: [{ id: 'cc1', status: 'PENDING' }],
    },
    {
      name: 'WasteAndScrap',
      factory: client => new WasteAndScrap(client),
      path: 'waste-and-scrap',
      params: { type: 'WASTE' },
      response: [{ id: 'ws1', status: 'PENDING' }],
    },
    {
      name: 'Leads',
      factory: client => new Leads(client),
      path: 'leads',
      params: { source: 'ads' },
      response: [],
    },
  ];

  fixtures.forEach(({ name, factory, path, params, response }) => {
    it(`passes params to GET query for ${name}`, async () => {
      const mockRequest = jest.fn().mockResolvedValue(response);
      const resource = factory({ request: mockRequest });

      await resource.list(params);

      expect(mockRequest).toHaveBeenCalledWith('GET', path, undefined, { params });
    });
  });
});

describe('WasteAndScrap.generateReport uses query params', () => {
  it('sends report filters via params', async () => {
    const mockRequest = jest.fn().mockResolvedValue({ ok: true });
    const resource = new WasteAndScrap({ request: mockRequest });
    const params = { start_date: '2024-01-01', end_date: '2024-02-01' };

    await resource.generateReport(params as any);

    expect(mockRequest).toHaveBeenCalledWith(
      'GET',
      'waste-and-scrap/report',
      undefined,
      { params }
    );
  });
});
