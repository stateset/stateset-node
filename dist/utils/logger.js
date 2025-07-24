"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.logger = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["ERROR"] = 0] = "ERROR";
    LogLevel[LogLevel["WARN"] = 1] = "WARN";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["DEBUG"] = 3] = "DEBUG";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    level = LogLevel.INFO;
    handlers = [];
    constructor() {
        // Default handler for development
        if (process.env.NODE_ENV !== 'production') {
            this.addHandler(this.consoleHandler);
        }
    }
    setLevel(level) {
        this.level = level;
    }
    addHandler(handler) {
        this.handlers.push(handler);
    }
    removeHandler(handler) {
        const index = this.handlers.indexOf(handler);
        if (index > -1) {
            this.handlers.splice(index, 1);
        }
    }
    log(level, message, context, error) {
        if (level <= this.level) {
            const entry = {
                level,
                message,
                timestamp: new Date().toISOString(),
                context,
                error,
            };
            this.handlers.forEach(handler => {
                try {
                    handler(entry);
                }
                catch (handlerError) {
                    // Prevent logging errors from breaking the application
                    // eslint-disable-next-line no-console
                    console.error('Error in log handler:', handlerError);
                }
            });
        }
    }
    error(message, context, error) {
        this.log(LogLevel.ERROR, message, context, error);
    }
    warn(message, context) {
        this.log(LogLevel.WARN, message, context);
    }
    info(message, context) {
        this.log(LogLevel.INFO, message, context);
    }
    debug(message, context) {
        this.log(LogLevel.DEBUG, message, context);
    }
    // Built-in handlers
    consoleHandler = (entry) => {
        const levelNames = ['ERROR', 'WARN', 'INFO', 'DEBUG'];
        const levelName = levelNames[entry.level];
        let output = `[${entry.timestamp}] ${levelName}: ${entry.message}`;
        if (entry.context) {
            output += ` | Context: ${JSON.stringify(entry.context)}`;
        }
        if (entry.error) {
            output += ` | Error: ${entry.error.message}`;
            if (entry.error.stack) {
                output += `\nStack: ${entry.error.stack}`;
            }
        }
        switch (entry.level) {
            case LogLevel.ERROR:
                // eslint-disable-next-line no-console
                console.error(output);
                break;
            case LogLevel.WARN:
                // eslint-disable-next-line no-console
                console.warn(output);
                break;
            case LogLevel.INFO:
                // eslint-disable-next-line no-console
                console.info(output);
                break;
            case LogLevel.DEBUG:
                // eslint-disable-next-line no-console
                console.debug(output);
                break;
        }
    };
    // JSON handler for production logging
    static jsonHandler = (entry) => {
        // eslint-disable-next-line no-console
        console.log(JSON.stringify(entry));
    };
    // File handler (would require fs in a real implementation)
    static createFileHandler = (filename) => {
        return (entry) => {
            // In a real implementation, this would write to a file
            // For now, we'll just use console
            // eslint-disable-next-line no-console
            console.log(`[FILE:${filename}] ${JSON.stringify(entry)}`);
        };
    };
}
exports.Logger = Logger;
// Create a singleton logger instance
exports.logger = new Logger();
// Configure logger based on environment
if (process.env.NODE_ENV === 'production') {
    exports.logger.setLevel(LogLevel.WARN);
    exports.logger.removeHandler(exports.logger['consoleHandler']);
    exports.logger.addHandler(Logger.jsonHandler);
}
else if (process.env.NODE_ENV === 'development') {
    exports.logger.setLevel(LogLevel.DEBUG);
}
else if (process.env.NODE_ENV === 'test') {
    exports.logger.setLevel(LogLevel.ERROR);
}
//# sourceMappingURL=logger.js.map