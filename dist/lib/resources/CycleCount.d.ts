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
    /**
     * Create cycle count
     * @param data - CycleCountData object
     * @returns CycleCountResponse object
     */
    create(data: CycleCountData): Promise<CycleCountResponse>;
    /**
     * Get cycle count
     * @param id - Cycle count ID
     * @returns CycleCountResponse object
     */
    get(id: string): Promise<CycleCountResponse>;
    /**
     * Update cycle count
     * @param id - Cycle count ID
     * @param data - Partial<CycleCountData> object
     * @returns CycleCountResponse object
     */
    update(id: string, data: Partial<CycleCountData>): Promise<CycleCountResponse>;
    /**
     * List cycle counts
     * @param params - Optional filtering parameters
     * @returns Array of CycleCountResponse objects
     */
    list(params?: any): Promise<CycleCountResponse[]>;
    /**
     * Delete cycle count
     * @param id - Cycle count ID
     */
    delete(id: string): Promise<void>;
    /**
     * Complete cycle count
     * @param id - Cycle count ID
     * @param data - CycleCountCompletionData object
     * @returns CompletedCycleCountResponse object
     */
    complete(id: string, data: CycleCountCompletionData): Promise<CompletedCycleCountResponse>;
    /**
     * Reconcile cycle count
     * @param id - Cycle count ID
     * @returns ReconciledCycleCountResponse object
     */
    reconcile(id: string): Promise<ReconciledCycleCountResponse>;
    /**
     * Start cycle count
     * @param id - Cycle count ID
     * @returns InProgressCycleCountResponse object
     */
    start(id: string): Promise<InProgressCycleCountResponse>;
    /**
     * Cancel cycle count
     * @param id - Cycle count ID
     * @returns PendingCycleCountResponse object
     */
    cancel(id: string): Promise<PendingCycleCountResponse>;
    /**
     * Get cycle count discrepancies
     * @param id - Cycle count ID
     * @returns Array of discrepancies
     */
    getDiscrepancies(id: string): Promise<any>;
}
export {};
