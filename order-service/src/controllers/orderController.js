import { validationResult } from 'express-validator';
import Order from '../models/order.js';
import axios from 'axios';
import mongoose from 'mongoose';


function parsePagination({ page = 1, limit = 20 }) {
  return { page: +page, limit: +limit };
}

function parseDateFilter(dateFrom, dateTo) {
  const createdAt = {};
  if (dateFrom) createdAt.$gte = new Date(dateFrom);
  if (dateTo) createdAt.$lte = new Date(dateTo);
  return Object.keys(createdAt).length ? { createdAt } : {};
}


export async function createOrder(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ error: errors.array()[0].msg });

  const { paymentId, shippingAddress, orderId, consumerId } = req.body;

  if (req.user.role !== 'admin') {
    if (!consumerId || req.user.userId !== consumerId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }

  if (!paymentId) {
    return res.status(400).json({ error: 'Payment ID is required' });
  }

  let paymentData;
  try {
    const paymentRes = await axios.get(
      `http://payment-service:4500/api/payments/${paymentId}`,
      { headers: { Authorization: req.headers.authorization } }
    );
    paymentData = paymentRes.data.payment;
    if (!paymentData || paymentData.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not successful or not found' });
    }
  } catch (err) {
    return res.status(502).json({ error: 'Failed to verify payment with payment service' });
  }

  let cartItems = [];
  try {
    const cartRes = await axios.get(
      `http://cart-service:4400/api/cart`,
      { headers: { Authorization: req.headers.authorization } }
    );
    cartItems = cartRes.data.items || [];
    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
  } catch (err) {
    return res.status(502).json({ error: 'Failed to fetch cart from cart service' });
  }

  const validatedOrderItems = [];
  for (const item of cartItems) {
    try {
      const productRes = await axios.get(`http://product-service:4300/api/product/${item.productId}`);
      const product = productRes.data;
      if (item.price !== product.price) {
        return res.status(400).json({ error: `Price mismatch for product ${item.productId}` });
      }

      validatedOrderItems.push({ ...item, vendorId: product.vendorId });
    } catch (err) {
      return res.status(502).json({ error: `Failed to fetch product ${item.productId} from product service` });
    }
  }

  const itemsByVendor = {};
  for (const item of validatedOrderItems) {
    if (!itemsByVendor[item.vendorId]) itemsByVendor[item.vendorId] = [];
    itemsByVendor[item.vendorId].push(item);
  }

  const createdOrders = [];
  for (const [vendorId, items] of Object.entries(itemsByVendor)) {
    const subtotalAmount = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const childOrder = await Order.create({
      consumerId,
      vendorId,
      parentOrderId: orderId,
      paymentId,
      subtotalAmount,
      orderItems: items,
      shippingAddress,
      orderStatus: 'pending',
      paymentStatus: 'succeeded',
      tracking: [{ status: 'pending' }],
    });
    createdOrders.push(childOrder._id);
  }

  try {
    await axios.delete(`http://cart-service:4400/api/cart/clear`, {
      headers: { Authorization: req.headers.authorization }
  });
  } catch (err) {
    // Not critical, but log if cart clearing fails
    console.error('Failed to clear cart after order creation:', err.message);
  }

  return res.status(201).json({ message: 'Orders created', parentOrderId: orderId, childOrderIds: createdOrders });
}

export async function listOrders(req, res) {
  const { page, limit } = parsePagination(req.query);
  const { orderStatus, dateFrom, dateTo } = req.query;

  const query = {};
  if (req.user.role === 'vendor') query.vendorId = req.user.userId;
  if (orderStatus) query.orderStatus = orderStatus;
  Object.assign(query, parseDateFilter(dateFrom, dateTo));

  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const ordersWithLinks = orders.map(order => ({
    ...order,
    orderItems: order.orderItems.map(item => ({
      ...item,
      _links: {
        product: `api/product/${item.productId}`
      }
    })),
    _links: {
      self: `api/order/${order._id}`,
      payment: `api/payment/${order.paymentId}`,
      tracking: `api/order/${order._id}/tracking`
    }
  }));

  return res.json({ page, limit, total, orders: ordersWithLinks });
}

export async function listOrdersByUser(req, res) {
  const { userId } = req.params;
  if (req.user.role !== 'admin' && req.user.userId !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { page, limit } = parsePagination(req.query);

  const total = await Order.countDocuments({ consumerId: userId });
  const orders = await Order.find({ consumerId: userId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const ordersWithLinks = orders.map(order => ({
    ...order,
    orderItems: order.orderItems.map(item => ({
      ...item,
      _links: {
        product: `api/product/${item.productId}`
      }
    })),
    _links: {
      self: `api/order/${order._id}`,
      payment: `api/payment/${order.paymentId}`,
      tracking: `api/order/${order._id}/tracking`
    }
  }));

  return res.json({ page, limit, total, orders: ordersWithLinks });
}

export async function getOrdersByParentId(req, res) {
  const { parentOrderId } = req.params;
  if (!parentOrderId || !mongoose.Types.ObjectId.isValid(parentOrderId)) {
    return res.status(400).json({ error: 'Invalid parentOrderId' });
  }
  const childOrders = await Order.find({ parentOrderId }).lean();
  if (!childOrders.length) {
    return res.status(404).json({ error: 'No child orders found for this parentOrderId' });
  }
  return res.json({ parentOrderId, childOrders });
}

export async function getOrderById(req, res) {
  const { id } = req.params;
  let order = await Order.findById(id).lean();
  if (!order) {
    const childOrders = await Order.find({ parentOrderId: id }).lean();
    if (!childOrders.length) return res.status(404).json({ error: 'Order not found' });
    return res.json({ parentOrderId: id, childOrders });
  }

  if (req.user.role !== 'admin') {
    if (
      req.user.role === 'consumer' &&
      order.consumerId !== req.user.userId
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (
      req.user.role === 'vendor' &&
      order.vendorId !== req.user.userId
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }

  const orderWithLinks = {
    ...order,
    orderItems: order.orderItems.map(item => ({
      ...item,
      _links: {
        product: `api/product/${item.productId}`
      }
    })),
    _links: {
      self: `api/order/${order._id}`,
      payment: `api/payment/${order.paymentId}`,
      tracking: `api/order/${order._id}/tracking`
    }
  };

  return res.json(orderWithLinks);
}

export async function updateOrderStatus(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ error: errors.array()[0].msg });

  const { id } = req.params;
  const { orderStatus } = req.body;

  const allowedStatuses = [
    'processing',
    'shipped',
    'out_for_delivery',
    'delivered',
  ];
  if (!allowedStatuses.includes(orderStatus))
    return res.status(400).json({ error: 'Invalid status transition' });

  const order = await Order.findById(id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  if (req.user.role !== 'admin') {
    if (
      req.user.role === 'vendor' &&
      order.vendorId !== req.user.userId
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }

  await Order.appendTracking(id, { status: orderStatus });
  return res.json({ message: 'Status updated', newStatus: orderStatus });
}

export async function cancelOrder(req, res) {
  const { id } = req.params;
  const { reason } = req.body || {};

  const order = await Order.findById(id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  if (req.user.role !== 'admin') {
    if (req.user.role === 'consumer' && order.consumerId !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }

  if (['shipped', 'out_for_delivery', 'delivered'].includes(order.orderStatus)) {
    return res.status(400).json({ error: 'Order cannot be cancelled at this stage' });
  }

  await Order.appendTracking(id, { status: 'cancelled', note: reason });
  return res.status(200).json({ message: 'Order cancelled' });
}

export async function getOrderTracking(req, res) {
  const { id } = req.params;
  const order = await Order.findById(id, 'consumerId vendorId tracking').lean();
  if (!order) return res.status(404).json({ error: 'Order not found' });

  if (req.user.role !== 'admin') {
    if (
      req.user.role === 'consumer' &&
      order.consumerId !== req.user.userId
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (
      req.user.role === 'vendor' &&
      order.vendorId !== req.user.userId
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }

  return res.json({ orderId: id, tracking: order.tracking });
}
