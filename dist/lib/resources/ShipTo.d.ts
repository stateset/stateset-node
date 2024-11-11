import { stateset } from '../../stateset-client';
declare class ShipTo {
    private stateset;
    constructor(stateset: stateset);
    list(): Promise<any>;
    get(id: string): Promise<any>;
    create(shipToData: any): Promise<any>;
    update(id: string, shipToData: any): Promise<any>;
    delete(id: string): Promise<any>;
}
export default ShipTo;
