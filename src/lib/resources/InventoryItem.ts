'use strict';

import StatesetResource from '../../StatesetResource';

export default StatesetResource.extend({
  path: 'inventoryitems/',
  operations: ['create', 'list', 'retrieve'],
});
