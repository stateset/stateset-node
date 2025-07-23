import { AxiosRequestConfig } from 'axios';
type StatesetMethodFunction = (params?: Record<string, any>, options?: AxiosRequestConfig) => Promise<any>;
interface CommonMethods {
    create: StatesetMethodFunction;
    list: StatesetMethodFunction;
    retrieve: StatesetMethodFunction;
    update: StatesetMethodFunction;
    del: StatesetMethodFunction;
}
declare const commonMethods: CommonMethods;
export default commonMethods;
//# sourceMappingURL=StatesetMethod.basic.d.ts.map