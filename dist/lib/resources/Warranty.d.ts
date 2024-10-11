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
    list(): Promise<any>;
    get(warrantyId: string): Promise<any>;
    create(warrantyData: any): Promise<any>;
    approve(warrantyId: string): Promise<ApprovedWarrantyResponse>;
    reject(warrantyId: string): Promise<RejectedWarrantyResponse>;
    cancel(warrantyId: string): Promise<CancelledWarrantyResponse>;
    close(warrantyId: string): Promise<ClosedWarrantyResponse>;
    reopen(warrantyId: string): Promise<ReopenedWarrantyResponse>;
    update(warrantyId: string, warrantyData: any): Promise<any>;
    delete(warrantyId: string): Promise<any>;
}
export default Warranty;
