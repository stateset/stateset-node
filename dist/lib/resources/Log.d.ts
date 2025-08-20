import type { ApiClientLike } from '../../types';
declare class Log {
    private stateset;
    constructor(stateset: ApiClientLike);
    /**
     * List logs
     * @returns Array of LogResponse objects
     */
    list(): Promise<any>;
    /**
     * Get a log by ID
     * @param id - Log ID
     * @returns LogResponse object
     */
    get(id: string): Promise<any>;
    /**
     * Create a new log
     * @param logData - LogData object
     * @returns LogResponse object
     */
    create(logData: any): Promise<any>;
    /**
     * Update a log
     * @param id - Log ID
     * @param logData - Partial<LogData> object
     * @returns LogResponse object
     */
    update(id: string, logData: any): Promise<any>;
    /**
     * Delete a log
     * @param id - Log ID
     */
    delete(id: string): Promise<any>;
}
export default Log;
//# sourceMappingURL=Log.d.ts.map