'use strict';

import StatesetResource from '../../StatesetResource';

export default StatesetResource.extend({
  path: 'purchaseorderlineitems/',
  operations: ['create', 'list', 'retrieve'],
});
