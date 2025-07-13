import { Request, Response, NextFunction } from 'express';

// Performance monitoring middleware
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const startMemory = process.memoryUsage();

    // Override res.end to capture response time
    const originalEnd = res.end;
    (res as any).end = function (chunk?: any, encoding?: any) {
        const end = Date.now();
        const endMemory = process.memoryUsage();
        const responseTime = end - start;
        const memoryDiff = {
            heapUsed: endMemory.heapUsed - startMemory.heapUsed,
            heapTotal: endMemory.heapTotal - startMemory.heapTotal,
            external: endMemory.external - startMemory.external,
            rss: endMemory.rss - startMemory.rss
        };

        // Log performance metrics
        console.log(`[PERFORMANCE] ${req.method} ${req.url} - ${responseTime}ms - Memory: ${Math.round(memoryDiff.heapUsed / 1024)}KB`);

        // Add performance headers
        res.setHeader('X-Response-Time', `${responseTime}ms`);
        res.setHeader('X-Memory-Usage', `${Math.round(endMemory.heapUsed / 1024 / 1024)}MB`);

        // Alert for slow responses
        if (responseTime > 1000) {
            console.warn(`[SLOW RESPONSE] ${req.method} ${req.url} took ${responseTime}ms`);
        }

        // Alert for high memory usage
        if (memoryDiff.heapUsed > 50 * 1024 * 1024) { // 50MB
            console.warn(`[HIGH MEMORY] ${req.method} ${req.url} used ${Math.round(memoryDiff.heapUsed / 1024 / 1024)}MB`);
        }

        originalEnd.call(this, chunk, encoding);
    };

    next();
};

// Request size monitoring
export const requestSizeMonitor = (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (contentLength > maxSize) {
        return res.status(413).json({
            error: 'Payload Too Large',
            message: 'הקובץ גדול מדי',
            maxSize: `${Math.round(maxSize / 1024 / 1024)}MB`
        });
    }

    next();
};

// Database query monitoring
export const databaseMonitor = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    // Store original mongoose query methods
    const originalFind = require('mongoose').Query.prototype.find;
    const originalFindOne = require('mongoose').Query.prototype.findOne;
    const originalSave = require('mongoose').Document.prototype.save;

    // Monitor find queries
    require('mongoose').Query.prototype.find = function () {
        const queryStart = Date.now();
        const result = originalFind.apply(this, arguments);

        result.then(() => {
            const queryTime = Date.now() - queryStart;
            if (queryTime > 100) {
                console.warn(`[SLOW QUERY] find() took ${queryTime}ms on collection: ${this.model.collection.name}`);
            }
        });

        return result;
    };

    // Monitor findOne queries
    require('mongoose').Query.prototype.findOne = function () {
        const queryStart = Date.now();
        const result = originalFindOne.apply(this, arguments);

        result.then(() => {
            const queryTime = Date.now() - queryStart;
            if (queryTime > 50) {
                console.warn(`[SLOW QUERY] findOne() took ${queryTime}ms on collection: ${this.model.collection.name}`);
            }
        });

        return result;
    };

    // Monitor save operations
    require('mongoose').Document.prototype.save = function () {
        const saveStart = Date.now();
        const result = originalSave.apply(this, arguments);

        result.then(() => {
            const saveTime = Date.now() - saveStart;
            if (saveTime > 200) {
                console.warn(`[SLOW SAVE] save() took ${saveTime}ms on collection: ${this.constructor.collection.name}`);
            }
        });

        return result;
    };

    next();
};

// Error tracking middleware
export const errorTracker = (err: Error, req: Request, res: Response, next: NextFunction) => {
    const errorInfo = {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        error: err.message,
        stack: err.stack,
        userAgent: req.headers['user-agent'],
        ip: req.ip || req.connection.remoteAddress
    };

    console.error('[ERROR]', JSON.stringify(errorInfo, null, 2));

    // Send error response
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' ? 'שגיאה פנימית בשרת' : err.message,
        timestamp: errorInfo.timestamp
    });
};

// API usage analytics
export const apiAnalytics = (req: Request, res: Response, next: NextFunction) => {
    const analytics = {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        userAgent: req.headers['user-agent'],
        ip: req.ip || req.connection.remoteAddress,
        contentType: req.headers['content-type'],
        accept: req.headers['accept']
    };

    // Log API usage (you can send this to analytics service)
    console.log('[API_USAGE]', JSON.stringify(analytics));

    next();
}; 