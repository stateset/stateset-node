import { BaseResource } from './BaseResource';

// lib/resources/Compliance.ts

export default class Compliance extends BaseResource {
  constructor(client: any) {
    super(client, 'compliance', 'compliance');
  }
}
