import StatesetResource from '../../StatesetResource';

export default StatesetResource.extend({
  path: 'accounts/',
  operations: ['create', 'list', 'retrieve'],
});