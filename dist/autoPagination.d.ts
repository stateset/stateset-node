import { AxiosPromise } from 'axios';
interface AutoPaginationMethods {
    autoPagingToArray: (opts: {
        limit: number;
    }) => Promise<any[]>;
    autoPagingEach: (callback: (item: any) => boolean | Promise<boolean>) => Promise<void>;
}
export declare const makeAutoPaginationMethods: (stateset: any, methodArgs: any[], spec: any, requestPromise: AxiosPromise) => AutoPaginationMethods;
export {};
