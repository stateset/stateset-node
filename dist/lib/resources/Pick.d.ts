import type { ApiClientLike } from '../../types';
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string;
export declare enum PickStatus {
    DRAFT = "DRAFT",
    PENDING = "PENDING",
    ASSIGNED = "ASSIGNED",
    IN_PROGRESS = "IN_PROGRESS",
    ON_HOLD = "ON_HOLD",
    QUALITY_CHECK = "QUALITY_CHECK",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare enum PickType {
    SINGLE_ORDER = "SINGLE_ORDER",
    BATCH = "BATCH",
    ZONE = "ZONE",
    WAVE = "WAVE",
    CLUSTER = "CLUSTER"
}
export declare enum PickPriority {
    URGENT = "URGENT",
    HIGH = "HIGH",
    NORMAL = "NORMAL",
    LOW = "LOW"
}
export declare enum PickMethod {
    DISCRETE = "DISCRETE",
    BATCH = "BATCH",
    ZONE = "ZONE",
    WAVE = "WAVE",
    CLUSTER = "CLUSTER"
}
export interface PickLocation {
    zone_id: NonEmptyString<string>;
    aisle: NonEmptyString<string>;
    rack: NonEmptyString<string>;
    shelf: NonEmptyString<string>;
    bin: NonEmptyString<string>;
    sequence_number: number;
    coordinates?: {
        x: number;
        y: number;
        z?: number;
    };
}
export interface PickItem {
    item_id: NonEmptyString<string>;
    sku: NonEmptyString<string>;
    product_name: NonEmptyString<string>;
    quantity: {
        requested: number;
        picked: number;
        available: number;
    };
    unit_of_measure: NonEmptyString<string>;
    location: PickLocation;
    batch_number?: string;
    lot_number?: string;
    expiration_date?: Timestamp;
    substitutions: {
        allowed: boolean;
        items?: NonEmptyString<string>[];
        used?: NonEmptyString<string>;
    };
    status: 'PENDING' | 'PICKED' | 'PARTIAL' | 'SUBSTITUTED' | 'UNAVAILABLE';
    notes?: string[];
    serial_numbers?: string[];
}
export interface PickerAssignment {
    picker_id: NonEmptyString<string>;
    name: NonEmptyString<string>;
    assigned_at: Timestamp;
    equipment?: {
        id: string;
        type: string;
    };
    restrictions?: {
        zones?: string[];
        weight_limit?: number;
    };
    certifications?: string[];
    status: 'ACTIVE' | 'UNAVAILABLE' | 'ON_BREAK';
}
export interface PickRoute {
    sequence: PickLocation[];
    optimization: {
        distance: number;
        time: number;
        algorithm: 'SHORTEST_PATH' | 'NEAREST_NEIGHBOR' | 'GENETIC';
    };
    zones?: string[];
    requirements?: {
        equipment: string[];
        instructions: string[];
    };
}
export interface QualityCheck {
    checker_id: NonEmptyString<string>;
    checked_at: Timestamp;
    items: Array<{
        item_id: NonEmptyString<string>;
        passed: boolean;
        issues?: string[];
        notes?: string;
    }>;
    status: 'PASSED' | 'FAILED' | 'PARTIAL';
    resolution?: {
        action: 'RETURN' | 'REPROCESS' | 'APPROVE';
        timestamp: Timestamp;
    };
}
export interface PickMetrics {
    items: {
        total: number;
        picked: number;
        accuracy: number;
    };
    quantity: {
        total: number;
        picked: number;
    };
    performance: {
        completion_rate: number;
        time: number;
        distance: number;
        picks_per_hour: number;
    };
    timestamp: Timestamp;
}
export interface PickData {
    order_ids: NonEmptyString<string>[];
    warehouse_id: NonEmptyString<string>;
    type: PickType;
    priority: PickPriority;
    method: PickMethod;
    items: PickItem[];
    assignment?: PickerAssignment;
    route?: PickRoute;
    schedule: {
        due?: Timestamp;
        started?: Timestamp;
        completed?: Timestamp;
    };
    quality?: QualityCheck;
    metrics?: PickMetrics;
    grouping?: {
        batch_id?: string;
        wave_id?: string;
    };
    instructions?: string[];
    org_id?: string;
    tags?: string[];
}
export type PickResponse = {
    id: NonEmptyString<string>;
    created_at: Timestamp;
    updated_at: Timestamp;
    status: PickStatus;
    data: PickData;
} & ({
    status: PickStatus.DRAFT | PickStatus.PENDING;
} | {
    status: PickStatus.ASSIGNED;
    assignment: PickerAssignment;
} | {
    status: PickStatus.IN_PROGRESS;
    progress: {
        started_at: Timestamp;
        completed_items: number;
    };
} | {
    status: PickStatus.ON_HOLD;
    hold_reason: string;
} | {
    status: PickStatus.QUALITY_CHECK;
    quality: QualityCheck;
} | {
    status: PickStatus.COMPLETED;
    metrics: PickMetrics;
} | {
    status: PickStatus.CANCELLED;
    cancellation_reason?: string;
});
export declare class PickError extends Error {
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, details?: Record<string, unknown> | undefined);
}
export declare class PickNotFoundError extends PickError {
    constructor(pickId: string);
}
export declare class PickValidationError extends PickError {
    readonly errors?: Record<string, string> | undefined;
    constructor(message: string, errors?: Record<string, string> | undefined);
}
export declare class PickOperationError extends PickError {
    readonly operation?: string | undefined;
    constructor(message: string, operation?: string | undefined);
}
export declare class Picks {
    private readonly client;
    constructor(client: ApiClientLike);
    private validatePickData;
    list(params?: {
        status?: PickStatus;
        type?: PickType;
        priority?: PickPriority;
        warehouse_id?: string;
        picker_id?: string;
        batch_id?: string;
        wave_id?: string;
        org_id?: string;
        date_range?: {
            from: Date;
            to: Date;
        };
        limit?: number;
        offset?: number;
    }): Promise<{
        picks: PickResponse[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    get(pickId: NonEmptyString<string>): Promise<PickResponse>;
    create(data: PickData): Promise<PickResponse>;
    update(pickId: NonEmptyString<string>, data: Partial<PickData>): Promise<PickResponse>;
    delete(pickId: NonEmptyString<string>): Promise<void>;
    optimizeRoute(pickId: NonEmptyString<string>, params?: {
        algorithm?: 'SHORTEST_PATH' | 'NEAREST_NEIGHBOR' | 'GENETIC';
        constraints?: {
            max_distance?: number;
            max_time?: number;
            zone_restrictions?: string[];
            picker_capabilities?: string[];
        };
    }): Promise<PickRoute>;
    start(pickId: NonEmptyString<string>, data: {
        picker_id: NonEmptyString<string>;
        equipment_id?: string;
        start_time?: Timestamp;
    }): Promise<PickResponse>;
    recordItemPick(pickId: NonEmptyString<string>, itemData: {
        item_id: NonEmptyString<string>;
        quantity_picked: number;
        location?: PickLocation;
        batch_number?: string;
        serial_numbers?: string[];
        notes?: string[];
        substituted_item_id?: string;
    }): Promise<PickResponse>;
    completeQualityCheck(pickId: NonEmptyString<string>, checkData: QualityCheck): Promise<PickResponse>;
    complete(pickId: NonEmptyString<string>, data: {
        end_time: Timestamp;
        metrics?: Partial<PickMetrics>;
        notes?: string[];
    }): Promise<PickResponse>;
    getMetrics(pickId: NonEmptyString<string>): Promise<PickMetrics>;
    private handleError;
}
export default Picks;
//# sourceMappingURL=Pick.d.ts.map