import { stateset } from '../../stateset-client';
declare class Attributes {
    private stateset;
    constructor(stateset: stateset);
    list(): Promise<any>;
    get(attributeId: string): Promise<any>;
    create(attributeData: any): Promise<any>;
    update(attributeId: string, attributeData: any): Promise<any>;
    delete(attributeId: string): Promise<any>;
}
export default Attributes;
