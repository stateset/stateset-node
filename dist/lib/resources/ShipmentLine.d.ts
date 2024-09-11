import { stateset } from '../../stateset-client';
declare class ShipmentLine {
    private stateset;
    constructor(stateset: stateset);
    list(): Promise<any>;
    get(shipmentLineId: string): Promise<any>;
    create(shipmentLineData: any): Promise<any>;
    update(shipmentLineId: string, shipmentLineData: any): Promise<any>;
    delete(shipmentLineId: string): Promise<any>;
}
export default ShipmentLine;
