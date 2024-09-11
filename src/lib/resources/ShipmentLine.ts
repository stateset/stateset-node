import { stateset } from '../../stateset-client';

class ShipmentLine {
  constructor(private stateset: stateset) {}

  async list() {
    return this.stateset.request('GET', 'shipment_line_items');
  }

  async get(shipmentLineId: string) {
    return this.stateset.request('GET', `shipment_line_items/${shipmentLineId}`);
  }

  async create(shipmentLineData: any) {
    return this.stateset.request('POST', 'shipment_line_items', shipmentLineData);
  }

  async update(shipmentLineId: string, shipmentLineData: any) {
    return this.stateset.request('PUT', `shipment_line_items/${shipmentLineId}`, shipmentLineData);
  }

  async delete(shipmentLineId: string) {
        return this.stateset.request('DELETE', `shipment_line_items/${shipmentLineId}`);
    }

}

export default ShipmentLine;