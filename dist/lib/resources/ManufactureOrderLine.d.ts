import { stateset } from '../../stateset-client';
declare class ManufactureOrderLines {
    private stateset;
    constructor(stateset: stateset);
    list(): Promise<any>;
    get(manufactureOrderLineId: string): Promise<any>;
    create(manufactureOrderLineData: any): Promise<any>;
    update(manufactureOrderLineId: string, manufactureOrderLineData: any): Promise<any>;
    delete(manufactureOrderLineId: string): Promise<any>;
}
export default ManufactureOrderLines;
