'use strict';

import StatesetResource from '../../StatesetResource';

export default StatesetResource.extend({
  path: 'workorderlineitems/',
  operations: ['create', 'list', 'retrieve'],
});
