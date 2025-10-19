import StatesetClient, { StatesetClientConfig } from './client';

export type StatesetOptions = StatesetClientConfig;

export class stateset extends StatesetClient {
  constructor(options: StatesetOptions = {}) {
    super(options);
  }
}

export default stateset;
