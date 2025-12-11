import { BaseResource } from './BaseResource';

// lib/resources/Contract.ts

export default class Contracts extends BaseResource {
  constructor(client: any) {
    super(client, 'contracts', 'contracts');
  }
}
