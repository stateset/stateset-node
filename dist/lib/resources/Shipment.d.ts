import { stateset } from '../../stateset-client';
declare class Shipments {
    private stateset;
    constructor(stateset: stateset);
    list(): Promise<any>;
    get(shipmentId: string): Promise<any>;
    create(shipmentData: any): Promise<any>;
    update(shipmentId: string, shipmentData: any): Promise<any>;
    delete(shipmentId: string): Promise<any>;
}
export default Shipments;
