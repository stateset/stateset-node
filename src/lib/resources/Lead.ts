import { BaseResource } from './BaseResource';

// lib/resources/Lead.ts

export default class Leads extends BaseResource {
  constructor(client: any) {
    super(client, 'leads', 'leads');
  }
}
