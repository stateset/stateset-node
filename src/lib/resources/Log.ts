import { BaseResource } from './BaseResource';

class Log extends BaseResource {
  constructor(client: any) {
    super(client, 'log', 'log');
  }
}

export default Log;
