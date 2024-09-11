import { stateset } from '../../stateset-client';
declare class Inventory {
    private stateset;
    constructor(stateset: stateset);
    list(): Promise<any>;
    get(inventoryId: string): Promise<any>;
    create(inventoryData: any): Promise<any>;
    update(inventoryId: string, inventoryData: any): Promise<any>;
    delete(inventoryId: string): Promise<any>;
}
export default Inventory;
