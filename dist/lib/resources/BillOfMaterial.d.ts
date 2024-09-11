import { stateset } from '../../stateset-client';
declare class BillOfMaterials {
    private stateset;
    constructor(stateset: stateset);
    list(): Promise<any>;
    get(billOfMaterialId: string): Promise<any>;
    create(billOfMaterialData: any): Promise<any>;
    update(billOfMaterialId: string, billOfMaterialData: any): Promise<any>;
    delete(billOfMaterialId: string): Promise<any>;
}
export default BillOfMaterials;
