import { stateset } from '../../stateset-client';
declare class Workorders {
    private stateset;
    constructor(stateset: stateset);
    list(): Promise<any>;
    get(workorderId: string): Promise<any>;
    create(workorderData: any): Promise<any>;
    update(workorderId: string, workorderData: any): Promise<any>;
    delete(workorderId: string): Promise<any>;
}
export default Workorders;
