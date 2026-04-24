import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const startMemory = process.memoryUsage();

    const originalEnd = res.end.bind(res);
    res.end = ((chunk?: unknown, encoding?: BufferEncoding) => {
        const responseTime = Date.now() - startTime;
        const endMemory = process.memoryUsage();
        const heapDiff = endMemory.heapUsed - startMemory.heapUsed;

        logger.info(`[PERFORMANCE] ${req.method} ${req.url} - ${responseTime}ms - Memory: ${Math.round(heapDiff / 1024)}KB`);

        res.setHeader('X-Response-Time', `${responseTime}ms`);
        res.setHeader('X-Memory-Usage', `${Math.round(endMemory.heapUsed / 1024 / 1024)}MB`);

        if (responseTime > 1000) {
            logger.warn(`[SLOW RESPONSE] ${req.method} ${req.url} took ${responseTime}ms`);
        }
        if (heapDiff > 50 * 1024 * 1024) {
            logger.warn(`[HIGH MEMORY] ${req.method} ${req.url} used ${Math.round(heapDiff / 1024 / 1024)}MB`);
        }

        return originalEnd(chunk as never, encoding as never);
    }) as typeof res.end;

    next();
};

export const requestSizeMonitor = (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] ?? '0');
    const maxSize = 10 * 1024 * 1024;

    if (contentLength > maxSize) {
        return res.status(413).json({
            error: 'Payload Too Large',
            message: 'הקובץ גדול מדי',
            maxSize: `${Math.round(maxSize / 1024 / 1024)}MB`,
        });
    }

    next();
};

export const databaseMonitor = (req: Request, res: Response, next: NextFunction) => {
    const monitorStart = Date.now();

    // Use mongoose connection events to measure query time without patching prototype
    const onQuery = (coll: string, op: string, duration: number) => {
        if (duration > 100) {
            logger.warn(`[SLOW QUERY] ${op}() took ${duration}ms on collection: ${coll}`);
        }
    };

    // Attach mongoose debug only for this request's lifetime
    const origDebug = mongoose.get('debug');
    mongoose.set('debug', (coll: string, method: string, _query: unknown, _doc: unknown, _options: unknown) => {
        const t = Date.now();
        res.once('finish', () => onQuery(coll, method, Date.now() - t));
    });

    res.on('finish', () => {
        mongoose.set('debug', origDebug);
        const elapsed = Date.now() - monitorStart;
        if (elapsed > 500) {
            logger.warn(`[DB MONITOR] ${req.method} ${req.url} total time: ${elapsed}ms`);
        }
    });

    next();
};

export const errorTracker = (err: Error, req: Request, res: Response, _next: NextFunction) => {
    const errorInfo = {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        error: err.message,
        stack: err.stack,
        userAgent: req.headers['user-agent'],
        ip: req.ip ?? req.socket.remoteAddress,
    };

    logger.error('[ERROR]', JSON.stringify(errorInfo, null, 2));

    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' ? 'שגיאה פנימית בשרת' : err.message,
        timestamp: errorInfo.timestamp,
    });
};

export const apiAnalytics = (req: Request, res: Response, next: NextFunction) => {
    const analytics = {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        userAgent: req.headers['user-agent'],
        ip: req.ip ?? req.socket.remoteAddress,
        contentType: req.headers['content-type'],
        accept: req.headers['accept'],
    };

    logger.info('[API_USAGE]', JSON.stringify(analytics));

    next();
};
