'use strict';

import StatesetResource from '../../StatesetResource';

export default StatesetResource.extend({
  path: 'workorders/',
  operations: ['create', 'list', 'retrieve'],
});
