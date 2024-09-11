import { stateset } from '../../stateset-client';
type ReturnStatus = 'APPROVED' | 'CANCELLED' | 'CLOSED' | 'REOPENED' | 'REJECTED';
interface BaseReturnResponse {
    id: string;
    object: 'return';
    status: ReturnStatus;
}
interface ApprovedReturnResponse extends BaseReturnResponse {
    status: 'APPROVED';
    approved: true;
}
interface RejectedReturnResponse extends BaseReturnResponse {
    status: 'REJECTED';
    rejected: true;
}
interface CancelledReturnResponse extends BaseReturnResponse {
    status: 'CANCELLED';
    cancelled: true;
}
interface ClosedReturnResponse extends BaseReturnResponse {
    status: 'CLOSED';
    closed: true;
}
interface ReopenedReturnResponse extends BaseReturnResponse {
    status: 'REOPENED';
    reopened: true;
}
declare class Returns {
    private stateset;
    constructor(stateset: stateset);
    private handleCommandResponse;
    list(): Promise<any>;
    get(returnId: string): Promise<any>;
    create(returnData: any): Promise<any>;
    approve(returnId: string): Promise<ApprovedReturnResponse>;
    reject(returnId: string): Promise<RejectedReturnResponse>;
    cancel(returnId: string): Promise<CancelledReturnResponse>;
    close(returnId: string): Promise<ClosedReturnResponse>;
    reopen(returnId: string): Promise<ReopenedReturnResponse>;
    update(returnId: string, returnData: any): Promise<any>;
    delete(returnId: string): Promise<any>;
}
export default Returns;
