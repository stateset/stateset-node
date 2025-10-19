export interface LogContext {
    requestId?: string;
    userId?: string;
    operation?: string;
    resource?: string;
    metadata?: Record<string, unknown>;
}
export declare enum LogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3
}
export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    context?: LogContext;
    error?: Error;
}
export type LogHandler = (entry: LogEntry) => void;
declare class Logger {
    private level;
    private handlers;
    constructor();
    setLevel(level: LogLevel): void;
    addHandler(handler: LogHandler): void;
    removeHandler(handler: LogHandler): void;
    removeConsoleHandler(): void;
    private log;
    error(message: string, context?: LogContext, error?: Error): void;
    warn(message: string, context?: LogContext): void;
    info(message: string, context?: LogContext): void;
    debug(message: string, context?: LogContext): void;
    private consoleHandler;
    static jsonHandler: (entry: LogEntry) => void;
    static createFileHandler: (filename: string) => LogHandler;
}
export declare const logger: Logger;
export { Logger };
//# sourceMappingURL=logger.d.ts.map