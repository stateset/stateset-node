import Returns from './lib/resources/Return';
import Warranties from './lib/resources/Warranty';
import Orders from './lib/resources/Order';
import Shipments from './lib/resources/Shipment';
import Inventory from './lib/resources/Inventory';
import Customers from './lib/resources/Customer';
interface StatesetOptions {
    apiKey: string;
    baseUrl?: string;
}
export declare class stateset {
    private baseUrl;
    private apiKey;
    returns: Returns;
    warranties: Warranties;
    orders: Orders;
    shipments: Shipments;
    inventory: Inventory;
    customers: Customers;
    constructor(options: StatesetOptions);
    request(method: string, path: string, data?: any): Promise<any>;
}
export default stateset;
