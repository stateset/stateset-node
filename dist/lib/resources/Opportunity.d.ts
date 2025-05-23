import { stateset } from '../../stateset-client';
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string;
export declare enum OpportunityStatus {
    PROSPECTING = "PROSPECTING",
    QUALIFIED = "QUALIFIED",
    PROPOSAL_SENT = "PROPOSAL_SENT",
    NEGOTIATION = "NEGOTIATION",
    WON = "WON",
    LOST = "LOST",
    ON_HOLD = "ON_HOLD"
}
export declare enum OpportunityStage {
    LEAD = "LEAD",
    OPPORTUNITY = "OPPORTUNITY",
    CUSTOMER = "CUSTOMER"
}
export interface OpportunityData {
    lead_id: NonEmptyString<string>;
    customer_id?: NonEmptyString<string>;
    status: OpportunityStatus;
    stage: OpportunityStage;
    amount: number;
    currency: string;
    expected_close_date?: Timestamp;
    assigned_to: NonEmptyString<string>;
    description: string;
    probability: number;
    created_at: Timestamp;
    updated_at: Timestamp;
    org_id?: string;
    metadata?: Record<string, any>;
}
export interface OpportunityResponse {
    id: NonEmptyString<string>;
    object: 'opportunity';
    data: OpportunityData;
}
export declare class OpportunityError extends Error {
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, details?: Record<string, unknown> | undefined);
}
export declare class OpportunityNotFoundError extends OpportunityError {
    constructor(opportunityId: string);
}
export declare class OpportunityValidationError extends OpportunityError {
    readonly errors?: Record<string, string> | undefined;
    constructor(message: string, errors?: Record<string, string> | undefined);
}
export default class Opportunities {
    private readonly stateset;
    constructor(stateset: stateset);
    private validateOpportunityData;
    private mapResponse;
    list(params?: {
        lead_id?: string;
        customer_id?: string;
        status?: OpportunityStatus;
        stage?: OpportunityStage;
        org_id?: string;
        date_from?: Date;
        date_to?: Date;
        limit?: number;
        offset?: number;
    }): Promise<{
        opportunities: OpportunityResponse[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    get(opportunityId: NonEmptyString<string>): Promise<OpportunityResponse>;
    create(data: OpportunityData): Promise<OpportunityResponse>;
    update(opportunityId: NonEmptyString<string>, data: Partial<OpportunityData>): Promise<OpportunityResponse>;
    delete(opportunityId: NonEmptyString<string>): Promise<void>;
    convertToCustomer(opportunityId: NonEmptyString<string>, customerId: NonEmptyString<string>): Promise<OpportunityResponse>;
    private handleError;
}
export {};
