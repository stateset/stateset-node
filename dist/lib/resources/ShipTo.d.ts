import type { ApiClientLike } from '../../types';
declare class ShipTo {
    private stateset;
    constructor(stateset: ApiClientLike);
    list(): Promise<any>;
    get(id: string): Promise<any>;
    create(shipToData: any): Promise<any>;
    update(id: string, shipToData: any): Promise<any>;
    delete(id: string): Promise<any>;
}
export default ShipTo;
//# sourceMappingURL=ShipTo.d.ts.map