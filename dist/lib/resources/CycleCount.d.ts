type CycleCountStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'RECONCILED';
interface BaseCycleCountResponse {
    id: string;
    object: 'cycle-count';
    status: CycleCountStatus;
}
interface PendingCycleCountResponse extends BaseCycleCountResponse {
    status: 'PENDING';
    pending: true;
}
interface InProgressCycleCountResponse extends BaseCycleCountResponse {
    status: 'IN_PROGRESS';
    inProgress: true;
}
interface CompletedCycleCountResponse extends BaseCycleCountResponse {
    status: 'COMPLETED';
    completed: true;
}
interface ReconciledCycleCountResponse extends BaseCycleCountResponse {
    status: 'RECONCILED';
    reconciled: true;
}
type CycleCountResponse = PendingCycleCountResponse | InProgressCycleCountResponse | CompletedCycleCountResponse | ReconciledCycleCountResponse;
interface CycleCountData {
    location: string;
    scheduled_date: string;
    items: {
        item_id: string;
        expected_quantity: number;
    }[];
    [key: string]: any;
}
interface CycleCountCompletionData {
    counted_items: {
        item_id: string;
        actual_quantity: number;
    }[];
}
export default class CycleCounts {
    private client;
    constructor(client: any);
    private handleCommandResponse;
    create(data: CycleCountData): Promise<CycleCountResponse>;
    get(id: string): Promise<CycleCountResponse>;
    update(id: string, data: Partial<CycleCountData>): Promise<CycleCountResponse>;
    list(params?: any): Promise<CycleCountResponse[]>;
    delete(id: string): Promise<void>;
    complete(id: string, data: CycleCountCompletionData): Promise<CompletedCycleCountResponse>;
    reconcile(id: string): Promise<ReconciledCycleCountResponse>;
    start(id: string): Promise<InProgressCycleCountResponse>;
    cancel(id: string): Promise<PendingCycleCountResponse>;
    getDiscrepancies(id: string): Promise<any>;
}
export {};
