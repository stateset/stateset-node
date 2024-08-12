'use strict';

import StatesetResource from '../../StatesetResource';

export default StatesetResource.extend({
  path: 'shipments/',
  operations: ['create', 'list', 'retrieve'],
});
