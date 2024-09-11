import { stateset } from '../../stateset-client';
declare class Customers {
    private stateset;
    constructor(stateset: stateset);
    list(): Promise<any>;
    get(customerId: string): Promise<any>;
    create(customerData: any): Promise<any>;
    update(customerId: string, customerData: any): Promise<any>;
    delete(customerId: string): Promise<any>;
}
export default Customers;
