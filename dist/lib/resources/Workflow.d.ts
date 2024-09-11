import { stateset } from '../../stateset-client';
declare class Workflows {
    private stateset;
    constructor(stateset: stateset);
    list(): Promise<any>;
    get(workflowId: string): Promise<any>;
    create(workflowData: any): Promise<any>;
    update(workflowId: string, workflowData: any): Promise<any>;
    delete(workflowId: string): Promise<any>;
}
export default Workflows;
