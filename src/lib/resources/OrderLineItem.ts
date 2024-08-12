'use strict';

import StatesetResource from '../../StatesetResource';

export default StatesetResource.extend({
  path: 'orderlineitems/',
  operations: ['create', 'list', 'retrieve'],
});
