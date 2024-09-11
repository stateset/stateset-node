import { stateset } from '../../stateset-client';
declare class PurchaseOrderLines {
    private stateset;
    constructor(stateset: stateset);
    list(): Promise<any>;
    get(purchaseOrderLineId: string): Promise<any>;
    create(purchaseOrderLineData: any): Promise<any>;
    update(purchaseOrderLineId: string, purchaseOrderLineData: any): Promise<any>;
    delete(purchaseOrderLineId: string): Promise<any>;
}
export default PurchaseOrderLines;
