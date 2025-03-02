import ShipStationIntegration from '../src/lib/integrations/ShipStationIntegration';

// Initialize the ShipStation integration with an API key
const shipStation = new ShipStationIntegration('your-shipstation-api-key-here');

async function runShipStationSample() {
  try {
    // Sample 1: List all products
    const productsList = await shipStation.getProducts({ page: 1, pageSize: 50 });
    console.log('ShipStation Products:', productsList.products);

    // Sample 2: Create a new product
    const newProductData = {
      sku: 'SKU-TEST-001',
      name: 'Test Widget',
      price: 10.99,
      defaultCost: 5.0,
      weight: { value: 1.5, units: 'pounds' },
      dimensions: { length: 10, width: 5, height: 2, units: 'inches' },
      active: true,
    };
    const createdProduct = await shipStation.createProduct(newProductData);
    console.log('Created ShipStation Product:', createdProduct);

    // Sample 3: List orders awaiting shipment
    const ordersList = await shipStation.getOrders({
      orderStatus: 'awaiting_shipment',
      page: 1,
      pageSize: 25,
    });
    console.log('ShipStation Orders:', ordersList.orders);

    // Sample 4: Create a new order
    const newOrderData = {
      orderNumber: 'TEST-ORDER-001',
      orderStatus: 'awaiting_shipment',
      shipTo: {
        name: 'John Doe',
        street1: '123 Main St',
        city: 'Austin',
        state: 'TX',
        postalCode: '78701',
        country: 'US',
      },
      items: [
        {
          sku: 'SKU-TEST-001',
          name: 'Test Widget',
          quantity: 2,
          unitPrice: 10.99,
        },
      ],
      orderTotal: 21.98,
    };
    const createdOrder = await shipStation.createOrder(newOrderData);
    console.log('Created ShipStation Order:', createdOrder);

    // Sample 5: Get shipping rates
    const rateData = {
      carrierCode: 'usps',
      fromPostalCode: '78701',
      toPostalCode: '90210',
      weight: { value: 1.5, units: 'pounds' },
      dimensions: { length: 10, width: 5, height: 2, units: 'inches' },
    };
    const rates = await shipStation.getRates(rateData);
    console.log('Shipping Rates:', rates);

  } catch (error) {
    console.error('Error in ShipStation Sample:', error instanceof Error ? error.message : error);
  }
}

// Execute the sample
runShipStationSample();