'use strict';

import StatesetResource from '../../StatesetResource';

export default StatesetResource.extend({
  path: 'returnlineitems/',
  operations: ['create', 'list', 'retrieve'],
});
