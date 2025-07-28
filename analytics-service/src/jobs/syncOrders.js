import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import cron from 'node-cron';
import { OrdersFact } from '../db/db.js';

const ORDERS_API_URL = process.env.ORDERS_API_URL;
const ORDER_SERVICE_TOKEN = process.env.ORDER_SERVICE_TOKEN;
const LAST_SYNC_FILE = path.resolve('last_sync.txt');

async function getLastSync() {
    try {
        const ts = await fs.readFile(LAST_SYNC_FILE, 'utf-8');
        return ts.trim();
    } catch {
        return '1970-01-01T00:00:00Z';
    }
}

async function setLastSync(ts) {
    await fs.writeFile(LAST_SYNC_FILE, ts, 'utf-8');
}

async function fetchOrders(updatedSince, page = 1) {
    try {
        const res = await axios.get(`${ORDERS_API_URL}/api/orders`, {
            params: { updatedSince, page },
            headers: { Authorization: `Bearer ${ORDER_SERVICE_TOKEN}` },
        });
        console.log(`[syncOrders] Fetched page ${page}, got ${res.data.orders?.length || 0} orders`);
        if (res.data.orders && res.data.orders.length > 0) {
            console.log('[syncOrders] Example order:', JSON.stringify(res.data.orders[0], null, 2));
        }
        return res.data;
    } catch (err) {
        console.error(`[syncOrders] Error fetching orders:`, err.response?.data || err.message);
        return { orders: [] };
    }
}

function toFactRows(order) {
    return order.orderItems.map(item => ({
        orderId: order._id,
        vendorId: order.vendorId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.quantity * item.price,
        orderStatus: order.orderStatus,
        orderDate: order.createdAt.split('T')[0],
        loadTimestamp: new Date(),
    }));
}

export async function syncOrders() {
    const since = await getLastSync();
    console.log(`[syncOrders] ETL job started, since=${since}`);
    let page = 1;
    let total = 0;
    let maxDate = since;
    let insertCount = 0;
    let updateCount = 0;
    while (true) {
        const data = await fetchOrders(since, page);
        if (!data.orders || !data.orders.length) {
            console.log(`[syncOrders] No more orders to process (page ${page}).`);
            break;
        }
        for (const order of data.orders) {
            const rows = toFactRows(order);
            if (!rows.length) {
                console.log('[syncOrders] No rows mapped for order:', order._id);
            }
            for (const row of rows) {
                console.log('[syncOrders] Upserting row:', row);
                try {
                    const [result, created] = await OrdersFact.upsert(row, { where: { orderId: row.orderId, productId: row.productId } });
                    if (created) {
                        insertCount++;
                        console.log('[syncOrders] Row inserted:', row);
                    } else {
                        updateCount++;
                        console.log('[syncOrders] Row updated:', row);
                    }
                } catch (err) {
                    console.error('[syncOrders] Upsert error:', err.message, row);
                }
            }
            if (order.updatedAt > maxDate) maxDate = order.updatedAt;
            total += rows.length;
        }
        if (!data.nextPage) break;
        page++;
    }
    await setLastSync(maxDate);
    console.log(`[syncOrders] Finished. Upserted ${total} rows (inserted: ${insertCount}, updated: ${updateCount}), lastSync=${maxDate}`);
}

export function scheduleSyncJob() {
    cron.schedule('*/5 * * * *', syncOrders);
    console.log('[syncOrders] Scheduled every 5 min');
} 