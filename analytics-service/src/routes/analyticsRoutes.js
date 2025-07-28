import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { getSummary, getTopProducts, getSalesTrend } from '../controllers/analyticsController.js';
import sequelize from '../db/db.js';

const router = Router();

router.get('/health', async (req, res) => {
    try {
        await sequelize.authenticate();
        res.status(200).json({
            service: 'analytics',
            status: 'up',
            uptime_seconds: process.uptime().toFixed(2),
            checked_at: new Date().toISOString(),
            db_host: process.env.MYSQL_HOST || 'mysql',
        });
    } catch (err) {
        res.status(500).json({ error: 'DB connection failed', details: err.message });
    }
});

router.get('/summary', requireAuth, requireRole(['vendor', 'admin']), getSummary);

router.get('/top-products', requireAuth, requireRole(['vendor', 'admin']), getTopProducts);

router.get('/sales-trend', requireAuth, requireRole(['vendor', 'admin']), getSalesTrend);

export default router; 