import Cart from '../models/Cart.js';
import axios from 'axios';
import { validationResult } from 'express-validator';


function resolveUserId(req) {
  return req?.user?.userId || req?.user?.id || null;
}

function requireUserId(req, res) {
  const userId = resolveUserId(req);
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized: missing or expired token' });
    return null;
  }
  return userId;
}

export const getCart = async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  // Parse pagination params
  let page = parseInt(req.query.page, 10) || 1;
  let limit = parseInt(req.query.limit, 10) || 50;
  if (page < 1) page = 1;
  if (limit < 1) limit = 50;

  try {
    const cart = await Cart.findOne({ userId });
    const items = cart ? cart.items : [];
    const totalItems = items.length;
    const start = (page - 1) * limit;
    const paginatedItems = items.slice(start, start + limit).map(item => ({
      itemId: item.itemId,
      productId: item.productId,
      productName: item.productName,
      price: item.price,
      quantity: item.quantity,
      addedAt: item.addedAt,
      _links: {
        product: `api/product/${item.productId}`,
        update: `api/cart/items/${item.itemId}`,
        remove: `api/cart/items/${item.itemId}`
      }
    }));
    res.status(200).json({
      page,
      limit,
      totalItems,
      items: paginatedItems
    });
  } catch (err) {
    console.error('getCart error:', err);
    res.status(500).json({ error: 'Server error while fetching cart' });
  }
};

export const addToCart = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = requireUserId(req, res);
  if (!userId) return;

  const { productId, quantity = 1 } = req.body;
  if (!productId) {
    return res.status(400).json({ error: 'Invalid body: productId is required.' });
  }
  if (quantity < 1) {
    return res.status(400).json({ error: 'Quantity must be at least 1.' });
  }

  try {
    // Fetch product details from product service
    const productRes = await axios.get(`http://product-service:4300/api/product/${productId}`);
    const product = productRes.data;
    if (!product || !product.name || !product.price) {
      return res.status(404).json({ error: 'Product not found or missing required fields.' });
    }
    let cart = await Cart.findOne({ userId });
    if (!cart) cart = new Cart({ userId, items: [] });

    let item = cart.items.find((i) => i.productId === productId);
    if (item) {
      item.quantity += quantity;
    } else {
      item = { productId, productName: product.name, price: product.price, quantity };
      cart.items.push(item);
      item = cart.items[cart.items.length - 1];
    }

    await cart.save();
    res.status(201).json({
      message: 'Product added to cart.',
      item: {
        itemId: item.itemId,
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity
      }
    });
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    console.error('addToCart error:', err);
    res.status(500).json({ error: 'Server error while adding item' });
  }
};

export const updateCart = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = requireUserId(req, res);
  if (!userId) return;

  const { itemId } = req.params;
  const { quantity } = req.body;

  if (typeof quantity !== 'number' || isNaN(quantity)) {
    return res.status(400).json({ error: 'Invalid body: quantity is required and must be a number.' });
  }
  if (quantity < 1) {
    return res.status(400).json({ error: 'Quantity must be at least 1.' });
  }

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found: ' + userId });



    const item = cart.items.find((i) => i.itemId === itemId);
    if (!item) return res.status(404).json({ error: 'Item not found: ' + itemId });

    item.quantity = quantity;
    await cart.save();
    res.json({
      message: 'Cart item updated.',
      item: {
        itemId: item.itemId,
        quantity: item.quantity
      }
    });
  } catch (err) {
    console.error('updateCart error:', err);
    res.status(500).json({ error: 'Server error while updating cart' });
  }
};

export const removeFromCart = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = requireUserId(req, res);
  if (!userId) return;

  const { itemId } = req.params;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: 'Item not found' });

    const initialLength = cart.items.length;
    cart.items = cart.items.filter((i) => i.itemId !== itemId);
    if (cart.items.length === initialLength) {
      return res.status(404).json({ error: 'Item not found' });
    }
    await cart.save();
    res.json({ message: 'Product removed from cart.' });
  } catch (err) {
    console.error('removeFromCart error:', err);
    res.status(500).json({ error: 'Server error while removing item' });
  }
};

export const clearCart = async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: [] } },
      { new: true }
    );
    res.status(200).json({ message: 'Cart cleared successfully.' });
  } catch (err) {
    console.error('clearCart error:', err);
    res.status(500).json({ error: 'Server error while clearing cart' });
  }
};

export const clearExpiredCarts = async (req, res) => {
  const days = parseInt(req.query.days, 10) || 7;
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  try {
    const result = await Cart.deleteMany({ updatedAt: { $lt: cutoff } });
    res.json({ message: 'Expired carts cleared', deletedCount: result.deletedCount });
  } catch (err) {
    console.error('clearExpiredCarts error:', err);
    res.status(500).json({ error: 'Server error while clearing expired carts' });
  }
};

export const getCartTotals = async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(200).json({
      totalItems: 0,
      subtotal: 0,
      estimatedTax: 0,
      total: 0,
      currency: 'CAD'
    });

    const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const totalItems = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    const TAX_RATE = parseFloat(process.env.TAX_RATE) || 0.15;
    const estimatedTax = +(subtotal * TAX_RATE).toFixed(2);
    const total = +(subtotal + estimatedTax).toFixed(2);
    res.status(200).json({
      totalItems,
      subtotal: +subtotal.toFixed(2),
      estimatedTax,
      total,
      currency: 'CAD'
    });
  } catch (err) {
    console.error('getCartTotals error:', err);
    res.status(500).json({ error: 'Server error while calculating totals' });
  }
};
