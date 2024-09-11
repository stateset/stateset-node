import { stateset } from '../../stateset-client';
declare class ReturnLines {
    private stateset;
    constructor(stateset: stateset);
    list(): Promise<any>;
    get(returnLineId: string): Promise<any>;
    create(returnLineData: any): Promise<any>;
    update(returnLineId: string, returnLineData: any): Promise<any>;
    delete(returnLineId: string): Promise<any>;
}
export default ReturnLines;
