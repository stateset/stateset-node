'use strict';

import StatesetResource from '../../StatesetResource';

export default StatesetResource.extend({
  path: 'warranties/',
  operations: ['create', 'list', 'retrieve'],
});
