import { stateset } from '../../stateset-client';
declare class Rules {
    private stateset;
    constructor(stateset: stateset);
    list(): Promise<any>;
    get(ruleId: string): Promise<any>;
    create(ruleData: any): Promise<any>;
    update(ruleId: string, ruleData: any): Promise<any>;
    delete(ruleId: string): Promise<any>;
}
export default Rules;
