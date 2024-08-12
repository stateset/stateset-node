interface Utils {
    isOptionsHash(o: any): boolean;
    stringifyRequestData(data: any): string;
    makeURLInterpolator(str: string): (outputs: {
        [key: string]: string;
    }) => string;
    extractUrlParams(path: string): string[];
    getDataFromArgs(args: any[]): any;
    getOptionsFromArgs(args: any[]): {
        auth: string | null;
        headers: {
            [key: string]: string;
        };
        settings: {
            [key: string]: any;
        };
    };
    protoExtend(sub: any): any;
    secureCompare(a: string, b: string): boolean;
    removeNullish(obj: {
        [key: string]: any;
    }): {
        [key: string]: any;
    };
    normalizeHeaders(obj: {
        [key: string]: string;
    }): {
        [key: string]: string;
    };
    normalizeHeader(header: string): string;
    checkForStream(obj: any): boolean;
    callbackifyPromiseWithTimeout(promise: Promise<any>, callback?: (error: Error | null, response?: any) => void): Promise<any>;
    pascalToCamelCase(name: string): string;
    emitWarning(warning: string): void;
    safeExec(cmd: string, cb: (error: Error | null, result: string | null) => void): void;
    isObject(obj: any): boolean;
    flattenAndStringify(data: any): {
        [key: string]: string;
    };
    uuid4(): string;
    validateInteger(name: string, n: number, defaultVal?: number): number;
    determineProcessUserAgentProperties(): {
        lang_version?: string;
        platform?: string;
    };
}
declare const utils: Utils;
export default utils;
