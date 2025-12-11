import Customers from '../src/lib/resources/Customer';
import { StatesetNotFoundError } from '../src/StatesetError';

describe('Resource error propagation', () => {
  it('does not wrap StatesetError instances', async () => {
    const notFound = new StatesetNotFoundError({
      type: 'not_found_error',
      message: 'not found',
      statusCode: 404,
    });

    const mockClient = {
      request: jest.fn().mockRejectedValue(notFound),
    };

    const customers = new Customers(mockClient as any);

    await expect(customers.get('cust_123' as any)).rejects.toBe(notFound);
  });
});

