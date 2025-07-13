import { Request, Response } from 'express';

// Performance metrics storage
interface PerformanceMetric {
    timestamp: Date;
    method: string;
    url: string;
    responseTime: number;
    memoryUsage: number;
    statusCode: number;
}

class PerformanceMonitor {
    private metrics: PerformanceMetric[] = [];
    private maxMetrics = 1000; // Keep last 1000 metrics

    addMetric(metric: PerformanceMetric) {
        this.metrics.push(metric);

        // Keep only the last maxMetrics
        if (this.metrics.length > this.maxMetrics) {
            this.metrics = this.metrics.slice(-this.maxMetrics);
        }
    }

    getAverageResponseTime(): number {
        if (this.metrics.length === 0) return 0;
        const total = this.metrics.reduce((sum, m) => sum + m.responseTime, 0);
        return total / this.metrics.length;
    }

    getSlowestRequests(limit: number = 10): PerformanceMetric[] {
        return this.metrics
            .sort((a, b) => b.responseTime - a.responseTime)
            .slice(0, limit);
    }

    getMetricsByEndpoint(url: string): PerformanceMetric[] {
        return this.metrics.filter(m => m.url === url);
    }

    getMetricsByTimeRange(startTime: Date, endTime: Date): PerformanceMetric[] {
        return this.metrics.filter(m =>
            m.timestamp >= startTime && m.timestamp <= endTime
        );
    }

    clearMetrics() {
        this.metrics = [];
    }
}

// Security monitoring
interface SecurityEvent {
    timestamp: Date;
    type: 'failed_login' | 'suspicious_activity' | 'rate_limit_exceeded' | 'invalid_token';
    ip: string;
    userAgent: string;
    details: any;
}

class SecurityMonitor {
    private events: SecurityEvent[] = [];
    private maxEvents = 500;

    addEvent(event: SecurityEvent) {
        this.events.push(event);

        if (this.events.length > this.maxEvents) {
            this.events = this.events.slice(-this.maxEvents);
        }
    }

    getSuspiciousIPs(): string[] {
        const ipCounts = new Map<string, number>();

        this.events.forEach(event => {
            const count = ipCounts.get(event.ip) || 0;
            ipCounts.set(event.ip, count + 1);
        });

        return Array.from(ipCounts.entries())
            .filter(([_, count]) => count > 5)
            .map(([ip, _]) => ip);
    }

    getRecentEvents(minutes: number = 60): SecurityEvent[] {
        const cutoff = new Date(Date.now() - minutes * 60 * 1000);
        return this.events.filter(e => e.timestamp > cutoff);
    }
}

// Database monitoring
interface DatabaseMetric {
    timestamp: Date;
    operation: 'find' | 'findOne' | 'save' | 'update' | 'delete';
    collection: string;
    duration: number;
    success: boolean;
    error?: string;
}

class DatabaseMonitor {
    private metrics: DatabaseMetric[] = [];
    private maxMetrics = 500;

    addMetric(metric: DatabaseMetric) {
        this.metrics.push(metric);

        if (this.metrics.length > this.maxMetrics) {
            this.metrics = this.metrics.slice(-this.maxMetrics);
        }
    }

    getSlowQueries(threshold: number = 100): DatabaseMetric[] {
        return this.metrics.filter(m => m.duration > threshold);
    }

    getCollectionStats(): Record<string, { count: number; avgDuration: number }> {
        const stats: Record<string, { count: number; avgDuration: number }> = {};

        this.metrics.forEach(metric => {
            if (!stats[metric.collection]) {
                stats[metric.collection] = { count: 0, avgDuration: 0 };
            }

            stats[metric.collection].count++;
            stats[metric.collection].avgDuration += metric.duration;
        });

        // Calculate averages
        Object.keys(stats).forEach(collection => {
            stats[collection].avgDuration /= stats[collection].count;
        });

        return stats;
    }
}

// Create singleton instances
export const performanceMonitor = new PerformanceMonitor();
export const securityMonitor = new SecurityMonitor();
export const databaseMonitor = new DatabaseMonitor();

// Utility functions
export const getSystemInfo = () => {
    return {
        platform: process.platform,
        nodeVersion: process.version,
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        uptime: process.uptime(),
        pid: process.pid
    };
};

export const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${(ms / 60000).toFixed(2)}m`;
};

// Health check utilities
export const checkDatabaseHealth = async (): Promise<{ healthy: boolean; details: any }> => {
    try {
        const mongoose = require('mongoose');
        const isConnected = mongoose.connection.readyState === 1;

        if (!isConnected) {
            return {
                healthy: false,
                details: { error: 'Database not connected' }
            };
        }

        // Test a simple query
        const start = Date.now();
        await mongoose.connection.db.admin().ping();
        const pingTime = Date.now() - start;

        return {
            healthy: true,
            details: {
                connectionState: mongoose.connection.readyState,
                pingTime,
                collections: Object.keys(mongoose.connection.collections).length,
                models: Object.keys(mongoose.models).length
            }
        };
    } catch (error) {
        return {
            healthy: false,
            details: { error: error instanceof Error ? error.message : 'Unknown error' }
        };
    }
};

export const checkMemoryHealth = (): { healthy: boolean; details: any } => {
    const memUsage = process.memoryUsage();
    const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
    const heapTotalMB = memUsage.heapTotal / 1024 / 1024;
    const usagePercentage = (heapUsedMB / heapTotalMB) * 100;

    return {
        healthy: usagePercentage < 90, // Consider unhealthy if > 90%
        details: {
            heapUsed: formatBytes(memUsage.heapUsed),
            heapTotal: formatBytes(memUsage.heapTotal),
            usagePercentage: usagePercentage.toFixed(2) + '%',
            external: formatBytes(memUsage.external),
            rss: formatBytes(memUsage.rss)
        }
    };
}; 