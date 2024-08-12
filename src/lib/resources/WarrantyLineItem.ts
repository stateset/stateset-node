'use strict';

import StatesetResource from '../../StatesetResource';

export default StatesetResource.extend({
  path: 'warrantylineitems/',
  operations: ['create', 'list', 'retrieve'],
});
