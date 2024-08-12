'use strict';

import StatesetResource from '../../StatesetResource';

export default StatesetResource.extend({
  path: 'purchaseorders/',
  operations: ['create', 'list', 'retrieve'],
});
