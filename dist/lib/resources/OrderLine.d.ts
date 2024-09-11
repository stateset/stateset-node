import { stateset } from '../../stateset-client';
declare class OrderLines {
    private stateset;
    constructor(stateset: stateset);
    list(): Promise<any>;
    get(orderLineId: string): Promise<any>;
    create(orderLineData: any): Promise<any>;
    update(orderLineId: string, orderLineData: any): Promise<any>;
    delete(orderLineId: string): Promise<any>;
}
export default OrderLines;
