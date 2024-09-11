import { Stateset } from './Stateset';
export interface StatesetResourceOptions {
    stateset: Stateset;
    path: string;
    operations: string[];
}
declare class StatesetResource {
    protected stateset: Stateset;
    protected path: string;
    protected operations: string[];
    [key: string]: any;
    constructor(options: StatesetResourceOptions);
    private createMethod;
    private getHttpMethod;
    private getPath;
    private getData;
}
export default StatesetResource;
