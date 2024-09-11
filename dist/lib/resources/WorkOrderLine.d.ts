import { stateset } from '../../stateset-client';
declare class WorkOrderLines {
    private stateset;
    constructor(stateset: stateset);
    list(): Promise<any>;
    get(workOrderLineId: string): Promise<any>;
    create(workOrderLineData: any): Promise<any>;
    update(workOrderLineId: string, workOrderLineData: any): Promise<any>;
    delete(workOrderLineId: string): Promise<any>;
}
export default WorkOrderLines;
