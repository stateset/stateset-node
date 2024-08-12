'use strict';

import StatesetResource from '../../StatesetResource';

export default StatesetResource.extend({
  path: 'billofmaterials/',
  operations: ['create', 'list', 'retrieve'],
});
