export default abstract class BaseIntegration {
    protected apiKey: string;
    protected baseUrl: string;
    constructor(apiKey: string, baseUrl: string);
    protected request(method: string, path: string, data?: any): Promise<any>;
}
