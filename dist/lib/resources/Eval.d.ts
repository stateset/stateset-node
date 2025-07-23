import { stateset } from '../../stateset-client';
export declare enum EvalType {
    AGENT = "agent",
    RESPONSE = "response",
    RULE = "rule",
    ATTRIBUTE = "attribute"
}
export interface EvalMetric {
    name: string;
    value: number;
    metadata?: Record<string, any>;
}
export interface EvalData {
    eval_type: EvalType;
    subject_id: string;
    metrics: EvalMetric[];
    summary?: string;
    agent_id?: string;
    org_id?: string;
    user_id?: string;
}
export interface EvalRecord {
    id: string;
    created_at: string;
    data: EvalData;
}
export declare class EvalNotFoundError extends Error {
    constructor(evalId: string);
}
export declare class EvalValidationError extends Error {
    constructor(message: string);
}
declare class Evals {
    private readonly stateset;
    constructor(stateset: stateset);
    /**
     * List evaluations with optional filtering
     */
    list(params?: {
        eval_type?: EvalType;
        subject_id?: string;
        agent_id?: string;
        org_id?: string;
    }): Promise<EvalRecord[]>;
    /**
     * Get a specific evaluation
     */
    get(evalId: string): Promise<EvalRecord>;
    /**
     * Create evaluation
     */
    create(data: EvalData): Promise<EvalRecord>;
    /**
     * Delete evaluation
     */
    delete(evalId: string): Promise<void>;
}
export default Evals;
//# sourceMappingURL=Eval.d.ts.map