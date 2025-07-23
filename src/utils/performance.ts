import { logger } from './logger';

export interface PerformanceMetrics {
  operation: string;
  duration: number;
  timestamp: string;
  success: boolean;
  error?: string;
  metadata?: Record<string, unknown>;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private readonly maxMetrics = 1000; // Keep last 1000 metrics

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(operation: string): PerformanceTimer {
    return new PerformanceTimer(operation, this);
  }

  recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Log slow operations
    if (metric.duration > 5000) { // 5 seconds
      logger.warn('Slow operation detected', {
        operation: 'performance_warning',
        metadata: {
          operation: metric.operation,
          duration: metric.duration,
          success: metric.success,
        },
      });
    }
  }

  getMetrics(operation?: string): PerformanceMetrics[] {
    if (operation) {
      return this.metrics.filter(m => m.operation === operation);
    }
    return [...this.metrics];
  }

  getAverageResponseTime(operation?: string): number {
    const relevantMetrics = this.getMetrics(operation).filter(m => m.success);
    if (relevantMetrics.length === 0) return 0;
    
    const total = relevantMetrics.reduce((sum, m) => sum + m.duration, 0);
    return total / relevantMetrics.length;
  }

  getSuccessRate(operation?: string): number {
    const relevantMetrics = this.getMetrics(operation);
    if (relevantMetrics.length === 0) return 0;
    
    const successful = relevantMetrics.filter(m => m.success).length;
    return successful / relevantMetrics.length;
  }

  getStats(operation?: string): {
    totalRequests: number;
    successRate: number;
    averageResponseTime: number;
    minResponseTime: number;
    maxResponseTime: number;
    p95ResponseTime: number;
  } {
    const metrics = this.getMetrics(operation).filter(m => m.success);
    
    if (metrics.length === 0) {
      return {
        totalRequests: 0,
        successRate: 0,
        averageResponseTime: 0,
        minResponseTime: 0,
        maxResponseTime: 0,
        p95ResponseTime: 0,
      };
    }

    const durations = metrics.map(m => m.duration).sort((a, b) => a - b);
    const p95Index = Math.floor(durations.length * 0.95);

    return {
      totalRequests: this.getMetrics(operation).length,
      successRate: this.getSuccessRate(operation),
      averageResponseTime: this.getAverageResponseTime(operation),
      minResponseTime: durations[0] || 0,
      maxResponseTime: durations[durations.length - 1] || 0,
      p95ResponseTime: durations[p95Index] || 0,
    };
  }

  clearMetrics(): void {
    this.metrics = [];
  }
}

export class PerformanceTimer {
  private startTime: number;

  constructor(
    private operation: string,
    private monitor: PerformanceMonitor
  ) {
    this.startTime = Date.now();
  }

  end(success: boolean = true, error?: string, metadata?: Record<string, unknown>): void {
    const duration = Date.now() - this.startTime;
    
    this.monitor.recordMetric({
      operation: this.operation,
      duration,
      timestamp: new Date().toISOString(),
      success,
      error,
      metadata,
    });

    logger.debug('Operation completed', {
      operation: 'performance',
      metadata: {
        operation: this.operation,
        duration,
        success,
        error,
      },
    });
  }
}

// Decorator for automatic performance monitoring
export function monitor(operation?: string) {
  return function <T extends (...args: any[]) => Promise<any>>(
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const originalMethod = descriptor.value!;
    const operationName = operation || `${target.constructor.name}.${propertyKey}`;
    
    descriptor.value = async function (this: any, ...args: any[]) {
      const timer = PerformanceMonitor.getInstance().startTimer(operationName);
      
      try {
        const result = await originalMethod.apply(this, args);
        timer.end(true);
        return result;
      } catch (error) {
        timer.end(false, (error as Error).message);
        throw error;
      }
    } as T;
    
    return descriptor;
  };
}

// Global performance monitor instance
export const performanceMonitor = PerformanceMonitor.getInstance();