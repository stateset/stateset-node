import type { ApiClientLike } from '../../types';
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
export type BOMResponse = BaseBOMResponse & {
    [K in BOMStatus]: {
        status: K;
    } & (K extends BOMStatus.REVISION ? {
        revision: true;
        previous_version_id: string;
    } : K extends BOMStatus.DRAFT ? {
        draft: true;
    } : K extends BOMStatus.ACTIVE ? {
        active: true;
    } : K extends BOMStatus.OBSOLETE ? {
        obsolete: true;
    } : {});
}[BOMStatus];
export declare class BOMError extends Error {
    constructor(message: string, name: string);
}
export declare class BOMNotFoundError extends BOMError {
    constructor(bomId: string);
}
export declare class BOMValidationError extends BOMError {
    constructor(message: string);
}
export declare class BOMStateError extends BOMError {
    constructor(message: string);
}
export declare class BillOfMaterials {
    private readonly client;
    constructor(client: ApiClientLike);
    private request;
    private validateComponent;
    list(params?: {
        status?: BOMStatus;
        product_id?: string;
        org_id?: string;
        effective_after?: Date;
        effective_before?: Date;
        limit?: number;
        offset?: number;
    }): Promise<{
        boms: BOMResponse[];
        total: number;
    }>;
    get(bomId: string): Promise<BOMResponse>;
    create(bomData: BOMData): Promise<BOMResponse>;
    update(bomId: string, bomData: Partial<BOMData>): Promise<BOMResponse>;
    delete(bomId: string): Promise<void>;
    setActive(bomId: string): Promise<BOMResponse>;
    setObsolete(bomId: string): Promise<BOMResponse>;
    startRevision(bomId: string, revisionNotes?: string): Promise<BOMResponse>;
    completeRevision(bomId: string): Promise<BOMResponse>;
    addComponent(bomId: string, component: Omit<Component, 'id'>): Promise<BOMResponse>;
    updateComponent(bomId: string, componentId: string, updates: Partial<Component>): Promise<BOMResponse>;
    removeComponent(bomId: string, componentId: string): Promise<BOMResponse>;
    calculateTotalCost(bomId: string): Promise<{
        total_cost: number;
        currency: string;
        breakdown: Record<string, {
            quantity: number;
            unit_cost: number;
            total: number;
        }>;
    }>;
    getVersionHistory(bomId: string): Promise<Array<{
        version: string;
        status: BOMStatus;
        changed_by: string;
        timestamp: string;
        changes: Record<string, {
            old: any;
            new: any;
        }>;
    }>>;
    export(bomId: string, format: 'pdf' | 'csv' | 'json'): Promise<{
        url: string;
        generated_at: string;
        expires_at: string;
    }>;
    validateBOM(bomId: string): Promise<{
        is_valid: boolean;
        issues: Array<{
            component_id?: string;
            type: string;
            message: string;
            severity: 'error' | 'warning';
        }>;
    }>;
}
export default BillOfMaterials;
//# sourceMappingURL=BillOfMaterial.d.ts.map