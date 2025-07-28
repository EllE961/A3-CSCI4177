import { OrdersFact } from '../db/db.js';
import { Op, fn, col, literal } from 'sequelize';

function getVendorId(req) {
    return req.user.vendorId || req.user.sub || req.user.id;
}

export async function getSummary(req, res) {
    const vendorId = getVendorId(req);
    if (!vendorId) return res.status(400).json({ error: 'vendorId missing' });
    const result = await OrdersFact.findAll({
        where: { vendorId },
        attributes: [
            [fn('SUM', col('subtotal')), 'totalRevenue'],
            [fn('COUNT', literal('DISTINCT orderId')), 'totalOrders'],
            [fn('AVG', col('subtotal')), 'averageOrderValue'],
            [fn('MAX', col('loadTimestamp')), 'lastUpdated'],
        ],
        raw: true,
    });
    res.json(result[0]);
}

export async function getTopProducts(req, res) {
    const vendorId = getVendorId(req);
    if (!vendorId) return res.status(400).json({ error: 'vendorId missing' });
    const limit = parseInt(req.query.limit || '5', 10);
    const startDate = req.query.startDate || '1970-01-01';
    const endDate = req.query.endDate || new Date().toISOString().slice(0, 10);
    const rows = await OrdersFact.findAll({
        where: {
            vendorId,
            orderDate: { [Op.between]: [startDate, endDate] },
        },
        attributes: [
            'productId',
            [fn('SUM', col('subtotal')), 'revenue'],
            [fn('SUM', col('quantity')), 'unitsSold'],
        ],
        group: ['productId'],
        order: [[literal('revenue'), 'DESC']],
        limit,
        raw: true,
    });
    res.json({ topProducts: rows });
}

export async function getSalesTrend(req, res) {
    const vendorId = getVendorId(req);
    if (!vendorId) return res.status(400).json({ error: 'vendorId missing' });
    const interval = req.query.interval === 'month' ? 'month' : 'day';
    const months = parseInt(req.query.months || '6', 10);
    const end = new Date();
    const start = new Date(end);
    start.setMonth(end.getMonth() - months);
    const startDate = start.toISOString().slice(0, 10);
    const endDate = end.toISOString().slice(0, 10);
    const dateFormat = interval === 'month' ? '%Y-%m' : '%Y-%m-%d';
    const rows = await OrdersFact.findAll({
        where: {
            vendorId,
            orderDate: { [Op.between]: [startDate, endDate] },
        },
        attributes: [
            [fn('DATE_FORMAT', col('orderDate'), dateFormat), 'period'],
            [fn('SUM', col('subtotal')), 'revenue'],
        ],
        group: ['period'],
        order: [[literal('period'), 'ASC']],
        raw: true,
    });
    res.json({ trend: rows });
} 