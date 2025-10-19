interface StatesetErrorRaw {
    type: string;
    message: string;
    code?: string;
    detail?: string;
    path?: string;
    statusCode?: number;
    timestamp?: string;
    request_id?: string;
}
interface ErrorInterface extends Error {
    type: string;
    code?: string;
    detail?: string;
    path?: string;
    statusCode?: number;
    timestamp?: string;
    request_id?: string;
    populate(raw: StatesetErrorRaw): void;
}
declare class StatesetBaseError extends Error implements ErrorInterface {
    type: string;
    code?: string;
    detail?: string;
    path?: string;
    statusCode?: number;
    timestamp?: string;
    request_id?: string;
    constructor(type: string, message: string, raw?: StatesetErrorRaw);
    populate(raw: StatesetErrorRaw): void;
    static extend(subClass: Partial<typeof StatesetBaseError>): typeof StatesetBaseError;
}
declare class StatesetError extends StatesetBaseError {
    constructor(raw: StatesetErrorRaw);
    static generate(raw: StatesetErrorRaw): StatesetError;
}
declare class StatesetNotFoundError extends StatesetError {
    constructor(raw: StatesetErrorRaw);
}
declare class StatesetInvalidRequestError extends StatesetError {
    constructor(raw: StatesetErrorRaw);
}
declare class StatesetAPIError extends StatesetError {
    constructor(raw: StatesetErrorRaw);
}
declare class StatesetAuthenticationError extends StatesetError {
    constructor(raw: StatesetErrorRaw);
}
declare class StatesetConnectionError extends StatesetError {
    constructor(raw: StatesetErrorRaw);
}
declare class StatesetPermissionError extends StatesetError {
    constructor(message: string);
}
declare class StatesetRateLimitError extends StatesetError {
    constructor(message: string);
}
export { StatesetBaseError, StatesetError, StatesetNotFoundError, StatesetInvalidRequestError, StatesetAPIError, StatesetAuthenticationError, StatesetConnectionError, StatesetPermissionError, StatesetRateLimitError, };
//# sourceMappingURL=StatesetError.d.ts.map