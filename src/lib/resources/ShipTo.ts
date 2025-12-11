import { BaseResource } from './BaseResource';

class ShipTo extends BaseResource {
  constructor(client: any) {
    super(client, 'ship_to', 'ship_to');
  }
}

export default ShipTo;
