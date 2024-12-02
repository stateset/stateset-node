import { stateset } from '../../stateset-client';
type WarrantyStatus = 'APPROVED' | 'CANCELLED' | 'CLOSED' | 'REOPENED' | 'REJECTED';
interface BaseWarrantyResponse {
    id: string;
    object: 'warranty';
    status: WarrantyStatus;
}
interface ApprovedWarrantyResponse extends BaseWarrantyResponse {
    status: 'APPROVED';
    approved: true;
}
interface RejectedWarrantyResponse extends BaseWarrantyResponse {
    status: 'REJECTED';
    rejected: true;
}
interface CancelledWarrantyResponse extends BaseWarrantyResponse {
    status: 'CANCELLED';
    cancelled: true;
}
interface ClosedWarrantyResponse extends BaseWarrantyResponse {
    status: 'CLOSED';
    closed: true;
}
interface ReopenedWarrantyResponse extends BaseWarrantyResponse {
    status: 'REOPENED';
    reopened: true;
}
declare class Warranty {
    private stateset;
    constructor(stateset: stateset);
    private handleCommandResponse;
    /**
     * @returns Array of WarrantyResponse objects
     */
    list(): Promise<any>;
    /**
     * @param warrantyId - Warranty ID
     * @returns WarrantyResponse object
     */
    get(warrantyId: string): Promise<any>;
    /**
     * @param warrantyData - WarrantyData object
     * @returns WarrantyResponse object
     */
    create(warrantyData: any): Promise<any>;
    /**
     * @param warrantyId - Warranty ID
     * @returns ApprovedWarrantyResponse object
     */
    approve(warrantyId: string): Promise<ApprovedWarrantyResponse>;
    /**
     * @param warrantyId - Warranty ID
     * @returns RejectedWarrantyResponse object
     */
    reject(warrantyId: string): Promise<RejectedWarrantyResponse>;
    /**
     * @param warrantyId - Warranty ID
     * @returns CancelledWarrantyResponse object
     */
    cancel(warrantyId: string): Promise<CancelledWarrantyResponse>;
    /**
     * @param warrantyId - Warranty ID
     * @returns ClosedWarrantyResponse object
     */
    close(warrantyId: string): Promise<ClosedWarrantyResponse>;
    /**
     * @param warrantyId - Warranty ID
     * @returns ReopenedWarrantyResponse object
     */
    reopen(warrantyId: string): Promise<ReopenedWarrantyResponse>;
    /**
     * @param warrantyId - Warranty ID
     * @param warrantyData - WarrantyData object
     * @returns WarrantyResponse object
     */
    update(warrantyId: string, warrantyData: any): Promise<any>;
    /**
     * @param warrantyId - Warranty ID
     */
    delete(warrantyId: string): Promise<any>;
}
export default Warranty;
