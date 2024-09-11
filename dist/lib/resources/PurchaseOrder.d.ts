import { stateset } from '../../stateset-client';
declare class PurchaseOrders {
    private stateset;
    constructor(stateset: stateset);
    list(): Promise<any>;
    get(purchaseOrderId: string): Promise<any>;
    create(purchaseOrderData: any): Promise<any>;
    update(purchaseOrderId: string, purchaseOrderData: any): Promise<any>;
    delete(purchaseOrderId: string): Promise<any>;
}
export default PurchaseOrders;
