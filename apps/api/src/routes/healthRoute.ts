import express, { Request, Response } from 'express';
import mongoose from 'mongoose';

const router: express.Router = express.Router();

// Health check endpoint
router.get('/', async (req: Request, res: Response) => {
    try {
        const healthCheck = {
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            version: process.env.npm_package_version || '1.0.0',
            services: {
                database: 'unknown',
                memory: {
                    used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                    total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
                }
            }
        };

        // בדיקת חיבור למסד נתונים
        if (mongoose.connection.readyState === 1) {
            healthCheck.services.database = 'connected';
        } else {
            healthCheck.services.database = 'disconnected';
            healthCheck.status = 'WARNING';
        }

        const statusCode = healthCheck.status === 'OK' ? 200 : 503;
        res.status(statusCode).json(healthCheck);
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            error: 'Health check failed'
        });
    }
});

// Detailed health check
router.get('/health/detailed', async (req: Request, res: Response) => {
    try {
        const detailedHealth = {
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            version: process.env.npm_package_version || '1.0.0',
            services: {
                database: {
                    status: 'unknown',
                    connectionState: mongoose.connection.readyState,
                    collections: 0,
                    models: 0
                },
                memory: {
                    used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                    total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                    external: Math.round(process.memoryUsage().external / 1024 / 1024),
                    rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
                },
                system: {
                    platform: process.platform,
                    nodeVersion: process.version,
                    pid: process.pid,
                    cpuUsage: process.cpuUsage()
                }
            }
        };

        // בדיקה מפורטת של מסד הנתונים
        if (mongoose.connection.readyState === 1) {
            detailedHealth.services.database.status = 'connected';
            detailedHealth.services.database.collections = Object.keys(mongoose.connection.collections).length;
            detailedHealth.services.database.models = Object.keys(mongoose.models).length;
        } else {
            detailedHealth.services.database.status = 'disconnected';
            detailedHealth.status = 'WARNING';
        }

        const statusCode = detailedHealth.status === 'OK' ? 200 : 503;
        res.status(statusCode).json(detailedHealth);
    } catch (error) {
        console.error('Detailed health check error:', error);
        res.status(500).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            error: 'Detailed health check failed'
        });
    }
});

// Readiness check
router.get('/ready', async (req: Request, res: Response) => {
    try {
        const readiness = {
            ready: true,
            timestamp: new Date().toISOString(),
            checks: {
                database: mongoose.connection.readyState === 1,
                memory: process.memoryUsage().heapUsed < 500 * 1024 * 1024 // פחות מ-500MB
            }
        };

        readiness.ready = Object.values(readiness.checks).every(check => check);
        const statusCode = readiness.ready ? 200 : 503;
        res.status(statusCode).json(readiness);
    } catch (error) {
        console.error('Readiness check error:', error);
        res.status(503).json({
            ready: false,
            timestamp: new Date().toISOString(),
            error: 'Readiness check failed'
        });
    }
});

export default router;
