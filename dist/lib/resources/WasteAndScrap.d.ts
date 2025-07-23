type WasteAndScrapStatus = 'PENDING' | 'PROCESSED' | 'DISPOSED' | 'RECYCLED';
interface BaseWasteAndScrapResponse {
    id: string;
    object: 'waste-and-scrap';
    status: WasteAndScrapStatus;
}
interface PendingWasteAndScrapResponse extends BaseWasteAndScrapResponse {
    status: 'PENDING';
    pending: true;
}
interface ProcessedWasteAndScrapResponse extends BaseWasteAndScrapResponse {
    status: 'PROCESSED';
    processed: true;
}
interface DisposedWasteAndScrapResponse extends BaseWasteAndScrapResponse {
    status: 'DISPOSED';
    disposed: true;
}
interface RecycledWasteAndScrapResponse extends BaseWasteAndScrapResponse {
    status: 'RECYCLED';
    recycled: true;
}
type WasteAndScrapResponse = PendingWasteAndScrapResponse | ProcessedWasteAndScrapResponse | DisposedWasteAndScrapResponse | RecycledWasteAndScrapResponse;
interface WasteAndScrapData {
    type: 'WASTE' | 'SCRAP';
    source: string;
    quantity: number;
    unit: string;
    description: string;
    [key: string]: any;
}
interface DisposalData {
    disposal_method: string;
    disposal_date: string;
    quantity_disposed: number;
    [key: string]: any;
}
interface ReportParams {
    start_date: string;
    end_date: string;
    type?: 'WASTE' | 'SCRAP' | 'ALL';
    [key: string]: any;
}
export default class WasteAndScrap {
    private client;
    constructor(client: any);
    private handleCommandResponse;
    /**
     * @param data - WasteAndScrapData object
     * @returns WasteAndScrapResponse object
     */
    create(data: WasteAndScrapData): Promise<WasteAndScrapResponse>;
    /**
     * @param id - WasteAndScrap ID
     * @returns WasteAndScrapResponse object
     */
    get(id: string): Promise<WasteAndScrapResponse>;
    /**
     * @param id - WasteAndScrap ID
     * @param data - Partial<WasteAndScrapData> object
     * @returns WasteAndScrapResponse object
     */
    update(id: string, data: Partial<WasteAndScrapData>): Promise<WasteAndScrapResponse>;
    /**
     * @param params - Filtering parameters
     * @returns Array of WasteAndScrapResponse objects
     */
    list(params?: any): Promise<WasteAndScrapResponse[]>;
    /**
     * @param id - WasteAndScrap ID
     */
    delete(id: string): Promise<void>;
    /**
     * @param params - Filtering parameters
     * @returns Array of WasteAndScrapResponse objects
     */
    generateReport(params: ReportParams): Promise<any>;
    /**
     * @param id - WasteAndScrap ID
     * @param data - DisposalData object
     * @returns DisposedWasteAndScrapResponse object
     */
    recordDisposal(id: string, data: DisposalData): Promise<DisposedWasteAndScrapResponse>;
    /**
     * @param id - WasteAndScrap ID
     * @returns ProcessedWasteAndScrapResponse object
     */
    markAsProcessed(id: string): Promise<ProcessedWasteAndScrapResponse>;
    /**
     * @param id - WasteAndScrap ID
     * @returns RecycledWasteAndScrapResponse object
     */
    markAsRecycled(id: string): Promise<RecycledWasteAndScrapResponse>;
    /**
     * @param id - WasteAndScrap ID
     * @returns Array of DisposalData objects
     */
    getDisposalHistory(id: string): Promise<DisposalData[]>;
}
export {};
//# sourceMappingURL=WasteAndScrap.d.ts.map