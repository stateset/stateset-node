import { stateset } from '../../stateset-client';
declare class Agents {
    private stateset;
    constructor(stateset: stateset);
    list(): Promise<any>;
    get(agentId: string): Promise<any>;
    create(agentData: any): Promise<any>;
    update(agentId: string, agentData: any): Promise<any>;
    delete(agentId: string): Promise<any>;
}
export default Agents;
