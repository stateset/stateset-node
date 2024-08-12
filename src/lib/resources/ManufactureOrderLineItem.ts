'use strict';

import StatesetResource from '../../StatesetResource';

export default StatesetResource.extend({
  path: 'manufactureorderslineitems/',
  operations: ['create', 'list', 'retrieve'],
});
