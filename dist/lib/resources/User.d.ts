import { stateset } from '../../stateset-client';
declare class Users {
    private stateset;
    constructor(stateset: stateset);
    list(): Promise<any>;
    get(userId: string): Promise<any>;
    create(userData: any): Promise<any>;
    update(userId: string, userData: any): Promise<any>;
    delete(userId: string): Promise<any>;
}
export default Users;
