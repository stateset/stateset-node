declare class Stateset {
    private apiKey;
    private baseUri;
    private client;
    constructor(apiKey: string);
    private handleError;
    private createOptions;
    accounts: {
        create: (params: any) => import("axios").AxiosPromise<any>;
        retrieve: (id: string) => import("axios").AxiosPromise<any>;
        update: (id: string, params: any) => import("axios").AxiosPromise<any>;
        list: (params: any) => import("axios").AxiosPromise<any>;
    };
    transactions: {
        create: (params: any) => import("axios").AxiosPromise<any>;
        retrieve: (id: string) => import("axios").AxiosPromise<any>;
        list: (params: any) => import("axios").AxiosPromise<any>;
    };
}
declare const _default: (apiKey: string) => Stateset;
export = _default;
