'use strict';

import StatesetResource from '../../StatesetResource';

export default StatesetResource.extend({
  path: 'manufactureorders/',
  operations: ['create', 'list', 'retrieve'],
});
