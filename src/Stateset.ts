import StatesetClient, { StatesetClientConfig } from './client';

export type StatesetOptions = StatesetClientConfig;

export class Stateset extends StatesetClient {
  constructor(options: StatesetOptions = {}) {
    super(options);
  }
}

export default Stateset;
