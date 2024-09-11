import { stateset } from '../../stateset-client';
declare class Orders {
    private stateset;
    constructor(stateset: stateset);
    list(): Promise<any>;
    get(orderId: string): Promise<any>;
    create(orderData: any): Promise<any>;
    update(orderId: string, orderData: any): Promise<any>;
    delete(orderId: string): Promise<any>;
}
export default Orders;
