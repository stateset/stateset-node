import { stateset } from '../../stateset-client';
export declare enum BOMStatus {
    DRAFT = "DRAFT",
    ACTIVE = "ACTIVE",
    OBSOLETE = "OBSOLETE",
    REVISION = "REVISION"
}
export declare enum ComponentType {
    RAW_MATERIAL = "raw_material",
    SUB_ASSEMBLY = "sub_assembly",
    FINISHED_GOOD = "finished_good",
    PACKAGING = "packaging"
}
export interface Component {
    id: string;
    item_id: string;
    quantity: number;
    unit_cost?: number;
    lead_time?: number;
    type: ComponentType;
    supplier_id?: string;
    notes?: string;
    alternative_items?: string[];
    minimum_order_quantity?: number;
    reorder_point?: number;
}
export interface BOMMetadata {
    version: string;
    effective_date?: string;
    expiry_date?: string;
    approved_by?: string;
    department?: string;
    facility_id?: string;
    [key: string]: any;
}
export interface BOMData {
    name: string;
    description?: string;
    product_id: string;
    components: Component[];
    metadata?: BOMMetadata;
    total_cost?: number;
    assembly_time?: number;
    revision_notes?: string;
    org_id?: string;
}
interface BaseBOMResponse {
    id: string;
    object: 'billofmaterials';
    created_at: string;
    updated_at: string;
    status: BOMStatus;
    data: BOMData;
}
interface DraftBOMResponse extends BaseBOMResponse {
    status: BOMStatus.DRAFT;
    draft: true;
}
interface ActiveBOMResponse extends BaseBOMResponse {
    status: BOMStatus.ACTIVE;
    active: true;
}
interface ObsoleteBOMResponse extends BaseBOMResponse {
    status: BOMStatus.OBSOLETE;
    obsolete: true;
}
interface RevisionBOMResponse extends BaseBOMResponse {
    status: BOMStatus.REVISION;
    revision: true;
    previous_version_id: string;
}
export type BOMResponse = DraftBOMResponse | ActiveBOMResponse | ObsoleteBOMResponse | RevisionBOMResponse;
export declare class BOMNotFoundError extends Error {
    constructor(bomId: string);
}
export declare class BOMValidationError extends Error {
    constructor(message: string);
}
export declare class BOMStateError extends Error {
    constructor(message: string);
}
declare class BillOfMaterials {
    private readonly stateset;
    constructor(stateset: stateset);
    /**
     * Validates a BOM component
     */
    private validateComponent;
    /**
     * Processes API response into typed BOMResponse
     */
    private handleCommandResponse;
    /**
     * List all BOMs with optional filtering
     */
    list(params?: {
        status?: BOMStatus;
        product_id?: string;
        org_id?: string;
        effective_after?: Date;
        effective_before?: Date;
    }): Promise<BOMResponse[]>;
    /**
     * Get a specific BOM by ID
     */
    get(bomId: string): Promise<BOMResponse>;
    /**
     * Create a new BOM
     * @param bomData - BOMData object
     * @returns BOMResponse object
     */
    create(bomData: BOMData): Promise<BOMResponse>;
    /**
     * Update an existing BOM
     * @param bomId - BOM ID
     * @param bomData - Partial<BOMData> object
     * @returns BOMResponse object
     */
    update(bomId: string, bomData: Partial<BOMData>): Promise<BOMResponse>;
    /**
     * Delete a BOM
     */
    delete(bomId: string): Promise<void>;
    /**
     * Status management methods
     */
    setActive(bomId: string): Promise<ActiveBOMResponse>;
    setObsolete(bomId: string): Promise<ObsoleteBOMResponse>;
    startRevision(bomId: string, revisionNotes?: string): Promise<RevisionBOMResponse>;
    completeRevision(bomId: string): Promise<ActiveBOMResponse>;
    /**
     * Component management methods
     */
    addComponent(bomId: string, component: Component): Promise<BOMResponse>;
    updateComponent(bomId: string, componentId: string, updates: Partial<Component>): Promise<BOMResponse>;
    removeComponent(bomId: string, componentId: string): Promise<BOMResponse>;
    /**
     * Cost calculation methods
     */
    calculateTotalCost(bomId: string): Promise<{
        total_cost: number;
        breakdown: Record<string, number>;
    }>;
    /**
     * Version management methods
     */
    getVersionHistory(bomId: string): Promise<Array<BOMResponse & {
        version: string;
        changed_by: string;
        timestamp: string;
    }>>;
    /**
     * Export methods
     */
    export(bomId: string, format: 'pdf' | 'csv' | 'json'): Promise<string>;
}
export default BillOfMaterials;
