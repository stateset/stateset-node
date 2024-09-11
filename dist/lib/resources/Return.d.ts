import { stateset } from '../../stateset-client';
declare class Returns {
    private stateset;
    constructor(stateset: stateset);
    list(): Promise<any>;
    get(returnId: string): Promise<any>;
    create(returnData: any): Promise<any>;
    approve(returnId: string): Promise<any>;
    cancel(returnId: string): Promise<any>;
    close(returnId: string): Promise<any>;
    reopen(returnId: string): Promise<any>;
    update(returnId: string, returnData: any): Promise<any>;
    delete(returnId: string): Promise<any>;
}
export default Returns;
