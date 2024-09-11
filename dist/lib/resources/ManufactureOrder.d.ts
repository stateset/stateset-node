import { stateset } from '../../stateset-client';
declare class ManufacturerOrders {
    private stateset;
    constructor(stateset: stateset);
    list(): Promise<any>;
    get(manufacturerOrderId: string): Promise<any>;
    create(manufacturerOrderData: any): Promise<any>;
    update(manufacturerOrderId: string, manufacturerOrderData: any): Promise<any>;
    delete(manufacturerOrderId: string): Promise<any>;
}
export default ManufacturerOrders;
