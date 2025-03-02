import ManufactureOrderLines from '../lib/ManufactureOrderLines'; // Adjust path as needed
import { stateset } from '../stateset-client'; // Adjust path as needed

// Initialize the SDK client (assuming stateset accepts an API key or similar config)
const client = new stateset({ apiKey: 'your-api-key-here' });
const manufactureOrderLines = new ManufactureOrderLines(client);

async function runManufactureOrderLinesSample() {
  try {
    // Sample 1: Create a new manufacture order line
    const newLineData = {
      manufacture_order_id: 'MO12345',
      type: 'FINISHED_GOOD',
      status: 'PLANNED',
      item: {
        item_id: 'ITEM001',
        sku: 'SKU-001',
        description: 'Widget A',
        quantity: 100,
        unit_of_measure: 'units',
        unit_cost: 5.0,
        total_cost: 500.0,
        currency: 'USD',
      },
      cost_details: {
        estimated_cost: 500.0,
        currency: 'USD',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status_history: [],
    };

    const createdLine = await manufactureOrderLines.create(newLineData);
    console.log('Created Manufacture Order Line:', createdLine);

    // Sample 2: List manufacture order lines with filtering
    const listParams = {
      manufacture_order_id: 'MO12345',
      status: 'PLANNED',
      limit: 10,
      offset: 0,
    };
    const linesList = await manufactureOrderLines.list(listParams);
    console.log('Listed Manufacture Order Lines:', linesList.manufacture_order_lines);

    // Sample 3: Update status of a manufacture order line
    const lineId = createdLine.id;
    const updatedLine = await manufactureOrderLines.updateStatus(lineId, 'IN_PROGRESS', 'Production started');
    console.log('Updated Manufacture Order Line Status:', updatedLine);

    // Sample 4: Record production for the line
    const productionData = {
      actual_start: new Date().toISOString(),
      produced_quantity: 50,
      operator_id: 'OP001',
    };
    const productionUpdatedLine = await manufactureOrderLines.recordProduction(lineId, productionData);
    console.log('Recorded Production:', productionUpdatedLine);

    // Sample 5: Get manufacturing metrics
    const metrics = await manufactureOrderLines.getMetrics({ manufacture_order_id: 'MO12345' });
    console.log('Manufacturing Metrics:', metrics);

  } catch (error) {
    console.error('Error in Manufacture Order Lines Sample:', error instanceof Error ? error.message : error);
  }
}

// Execute the sample
runManufactureOrderLinesSample();