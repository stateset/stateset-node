'use strict';

import StatesetResource from '../../StatesetResource';

export default StatesetResource.extend({
  path: 'billofmateriallineitems/',
  operations: ['create', 'list', 'retrieve'],
});
