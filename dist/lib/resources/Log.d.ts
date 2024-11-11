import { stateset } from '../../stateset-client';
declare class Log {
    private stateset;
    constructor(stateset: stateset);
    list(): Promise<any>;
    get(id: string): Promise<any>;
    create(logData: any): Promise<any>;
    update(id: string, logData: any): Promise<any>;
    delete(id: string): Promise<any>;
}
export default Log;
