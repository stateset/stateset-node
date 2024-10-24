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
    create(data: WasteAndScrapData): Promise<WasteAndScrapResponse>;
    get(id: string): Promise<WasteAndScrapResponse>;
    update(id: string, data: Partial<WasteAndScrapData>): Promise<WasteAndScrapResponse>;
    list(params?: any): Promise<WasteAndScrapResponse[]>;
    delete(id: string): Promise<void>;
    generateReport(params: ReportParams): Promise<any>;
    recordDisposal(id: string, data: DisposalData): Promise<DisposedWasteAndScrapResponse>;
    markAsProcessed(id: string): Promise<ProcessedWasteAndScrapResponse>;
    markAsRecycled(id: string): Promise<RecycledWasteAndScrapResponse>;
    getDisposalHistory(id: string): Promise<DisposalData[]>;
}
export {};
