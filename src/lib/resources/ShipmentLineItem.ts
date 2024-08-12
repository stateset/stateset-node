'use strict';

import StatesetResource from '../../StatesetResource';

export default StatesetResource.extend({
  path: 'shipmentlineitems/',
  operations: ['create', 'list', 'retrieve'],
});
