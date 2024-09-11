import { stateset } from '../../stateset-client';
declare class Warranties {
    private stateset;
    constructor(stateset: stateset);
    list(): Promise<any>;
    get(warrantyId: string): Promise<any>;
    create(warrantyData: any): Promise<any>;
    update(warrantyId: string, warrantyData: any): Promise<any>;
    delete(warrantyId: string): Promise<any>;
}
export default Warranties;
