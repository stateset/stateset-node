export interface LogContext {
  requestId?: string;
  userId?: string;
  operation?: string;
  resource?: string;
  metadata?: Record<string, unknown>;
}

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: Error;
}

export type LogHandler = (entry: LogEntry) => void;

class Logger {
  private level: LogLevel = LogLevel.INFO;
  private handlers: LogHandler[] = [];

  constructor() {
    // Default handler for development
    if (process.env.NODE_ENV !== 'production') {
      this.addHandler(this.consoleHandler);
    }
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  addHandler(handler: LogHandler): void {
    this.handlers.push(handler);
  }

  removeHandler(handler: LogHandler): void {
    const index = this.handlers.indexOf(handler);
    if (index > -1) {
      this.handlers.splice(index, 1);
    }
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    if (level <= this.level) {
      const entry: LogEntry = {
        level,
        message,
        timestamp: new Date().toISOString(),
        context,
        error,
      };

      this.handlers.forEach(handler => {
        try {
          handler(entry);
        } catch (handlerError) {
          // Prevent logging errors from breaking the application
          // eslint-disable-next-line no-console
          console.error('Error in log handler:', handlerError);
        }
      });
    }
  }

  error(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  // Built-in handlers
  private consoleHandler = (entry: LogEntry): void => {
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
  static jsonHandler = (entry: LogEntry): void => {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(entry));
  };

  // File handler (would require fs in a real implementation)
  static createFileHandler = (filename: string): LogHandler => {
    return (entry: LogEntry) => {
      // In a real implementation, this would write to a file
      // For now, we'll just use console
      // eslint-disable-next-line no-console
      console.log(`[FILE:${filename}] ${JSON.stringify(entry)}`);
    };
  };
}

// Create a singleton logger instance
export const logger = new Logger();

// Configure logger based on environment
if (process.env.NODE_ENV === 'production') {
  logger.setLevel(LogLevel.WARN);
  logger.removeHandler(logger['consoleHandler']);
  logger.addHandler(Logger.jsonHandler);
} else if (process.env.NODE_ENV === 'development') {
  logger.setLevel(LogLevel.DEBUG);
} else if (process.env.NODE_ENV === 'test') {
  logger.setLevel(LogLevel.ERROR);
}

export { Logger };
