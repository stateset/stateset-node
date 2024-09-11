import { stateset } from '../../stateset-client';
declare class WarrantyLines {
    private stateset;
    constructor(stateset: stateset);
    list(): Promise<any>;
    get(warrantyLineId: string): Promise<any>;
    create(warrantyLineData: any): Promise<any>;
    update(warrantyLineId: string, warrantyLineData: any): Promise<any>;
    delete(warrantyLineId: string): Promise<any>;
}
export default WarrantyLines;
