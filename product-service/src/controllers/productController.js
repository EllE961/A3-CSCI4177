import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Product from '../models/product.js';
import { uploadImage, deleteImage } from '../services/cloudinary.js';
import { v4 as uuidv4 } from 'uuid';

export const createProduct = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Invalid request data' });
        }
        const {
            vendorId,
            name,
            description,
            price,
            quantityInStock,
            category,
            tags,
            isPublished = false,
            images = [], // array of paths/urls
        } = req.body;
        // Vendor validation
        if (req.user.role !== 'admin' && req.user.userId !== vendorId) {
            return res.status(403).json({ error: 'You can only create products for your own vendor account' });
        }
        let imageUrls = [];
        if (Array.isArray(images) && images.length > 0) {
            const uploadPromises = images.map(async (img) => {
                const imageId = uuidv4();
                await uploadImage(img, imageId, 'products');
                return getCloudinaryUrl(imageId);
            });
            imageUrls = await Promise.all(uploadPromises);
        }
        console.log('Creating product with data:', {
            vendorId,
            name,
            description,
            price,
            quantityInStock,
            category,
            images: imageUrls,
            tags: tags || [],
            isPublished,
        });
        
        const product = await Product.create({
            vendorId,
            name,
            description,
            price,
            quantityInStock,
            category,
            images: imageUrls,
            tags: tags || [],
            isPublished,
        });
        console.log('Created product:', product.toObject());
        res.status(201).json({
            message: "Product created successfully.",
            productId: product._id
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Invalid request data' });
        }
        const { id } = req.params;
        const updateData = req.body;
        updateData.updatedAt = new Date();
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        // Vendor validation
        if (req.user.role !== 'admin' && req.user.userId !== product.vendorId) {
            return res.status(403).json({ error: 'You can only update your own products' });
        }
        if (Array.isArray(updateData.deleteImages)) {
            for (const url of updateData.deleteImages) {
                const matches = url.match(/\/products\/([^./]+)(?:\.[a-zA-Z]+)?$/);
                if (matches && matches[1]) {
                    await deleteImage(`products/${matches[1]}`);
                }
                product.images = product.images.filter(imgUrl => imgUrl !== url);
            }
        }
        if (Array.isArray(updateData.addImages)) {
            const uploadPromises = updateData.addImages.map(async (img) => {
                const imageId = uuidv4();
                await uploadImage(img, imageId, 'products');
                return getCloudinaryUrl(imageId);
            });
            const newImageUrls = await Promise.all(uploadPromises);
            product.images = [...product.images, ...newImageUrls];
        }
        if (!product.images || product.images.length === 0) {
            return res.status(400).json({ error: 'At least one image is required.' });
        }
        const ignoreFields = ['images', 'addImages', 'deleteImages'];
        for (const key in updateData) {
            if (!ignoreFields.includes(key)) {
                product[key] = updateData[key];
            }
        }
        await product.save();
        res.json({ message: "Product updated successfully." });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteProduct = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid request data' });
      }
  
      const { id } = req.params;
      const product = await Product.findById(id);
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
  
      if (req.user.role !== 'admin' && req.user.userId !== product.vendorId) {
        return res
          .status(403)
          .json({ error: 'You can only delete your own products' });
      }
  
      if (Array.isArray(product.images) && product.images.length) {
        const deletePromises = product.images.map(async (url) => {
          const matches = url.match(/\/products\/([^./]+)(?:\.[a-zA-Z]+)?$/);
          if (matches && matches[1]) {
            await deleteImage(`products/${matches[1]}`);
          }
        });
        await Promise.all(deletePromises);
      }
  
      await product.deleteOne();
  
      return res.json({ message: 'Product deleted successfully.' });
    } catch (error) {
      console.error('Error deleting product:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  export const listProducts = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid query parameters' });
      }
  
      const {
        page       = 1,
        limit      = 20,
        minPrice,
        maxPrice,
        tags,
        sort       = 'createdAt:desc',
        name,                     
        search,                   
        category,
        vendorId
      } = req.query;
  
      const q = {};
      if (minPrice !== undefined) q.price = { ...q.price, $gte: minPrice };
      if (maxPrice !== undefined) q.price = { ...q.price, $lte: maxPrice };
      if (tags)       q.tags      = { $in: tags.split(',').map(t => t.trim()) };
      if (category)   q.category  = category;
      if (vendorId)   q.vendorId  = vendorId;
  
      const searchTerm = name || search;
      if (searchTerm) q.name = { $regex: searchTerm, $options: 'i' };
  
      
      const normalSort = (() => {
        if (sort.includes(':')) return sort;           
        if (sort.startsWith('-')) return `${sort.slice(1)}:desc`; 
        return `${sort}:asc`;                          
      })();
  
      const [field, dir] = normalSort.split(':');
      const allowed = ['price', 'name', 'createdAt', 'averageRating'];
      const sortOption = allowed.includes(field)
        ? { [field]: dir === 'asc' ? 1 : -1 }
        : { createdAt: -1 };
  
      const [products, total] = await Promise.all([
        Product.find(q)
          .sort(sortOption)
          .skip((page - 1) * limit)
          .limit(limit),
        Product.countDocuments(q)
      ]);
  
      const transformed = products.map(p => ({
        productId     : p._id,
        name          : p.name,
        price         : p.price,
        category      : p.category || 'other',
        thumbnail     : p.images?.[0] ?? null,
        averageRating : p.averageRating,
        reviewCount   : p.reviewCount,
        _links: {
          self   : `/api/product/${p._id}`,
          reviews: `/api/product/${p._id}/reviews`,
          vendor : `/api/product/vendor/${p.vendorId}`
        }
      }));
  
      res.json({
        page:   Number(page),
        limit:  Number(limit),
        total,
        pages:  Math.ceil(total / limit),
        products: transformed
      });
    } catch (err) {
      console.error('Error listing products:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

export const listProductsByVendor = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Invalid query parameters' });
        }
        const { vendorId } = req.params;
        const {
            page = 1,
            limit = 30,
            minPrice,
            maxPrice,
            tags,
            sort = 'createdAt:desc',
        } = req.query;
        const query = { vendorId };
        if (minPrice) query.price = { ...query.price, $gte: parseFloat(minPrice) };
        if (maxPrice) query.price = { ...query.price, $lte: parseFloat(maxPrice) };
        if (tags) query.tags = { $in: tags.split(',').map(tag => tag.trim()) };
        let sortOption = { createdAt: -1 };
        if (sort === 'price:asc') sortOption = { price: 1 };
        if (sort === 'price:desc') sortOption = { price: -1 };
        if (sort === 'name:asc') sortOption = { name: 1 };
        if (sort === 'name:desc') sortOption = { name: -1 };
        if (sort === 'createdAt:asc') sortOption = { createdAt: 1 };
        if (sort === 'createdAt:desc') sortOption = { createdAt: -1 };
        const products = await Product.find(query)
            .sort(sortOption)
            .skip((page - 1) * limit)
            .limit(Number(limit));
        const total = await Product.countDocuments(query);
        
        console.log('Raw product from DB (vendor):', products[0]?.toObject());
        
        const transformedProducts = products.map(product => {
            const images = product.images || [];
            return {
                productId: product._id,
                name: product.name,
                description: product.description,
                price: product.price,
                quantityInStock: product.quantityInStock,
                category: product.category || 'other',
                thumbnail: images.length > 0 ? images[0] : null,
                averageRating: product.averageRating,
                reviewCount: product.reviewCount,
                images,
                tags: product.tags,
                isPublished: product.isPublished,
                vendorId: product.vendorId,
                _links: {
                    self: `api/product/${product._id}`,
                    reviews: `api/product/${product._id}/reviews`,
                    vendor: `api/product/vendor/${product.vendorId}`
                }
            };
        });
        res.json({
            vendorId,
            page: Number(page),
            limit: Number(limit),
            total,
            products: transformedProducts
        });
    } catch (error) {
        console.error('Error listing products by vendor:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getProductById = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        const images = product.images || [];
        const productResponse = {
            productId: product._id,
            vendorId: product.vendorId,
            name: product.name,
            description: product.description,
            price: product.price,
            quantityInStock: product.quantityInStock,
            category: product.category || 'other',
            images,
            tags: product.tags,
            averageRating: product.averageRating,
            reviewCount: product.reviewCount,
            isPublished: product.isPublished,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            _links: {
                self: `api/product/${product._id}`,
                reviews: `api/product/${product._id}/reviews`,
                vendor: `api/product/vendor/${product.vendorId}`
            }
        };
        res.json(productResponse);
    } catch (error) {
        console.error('Error getting product by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const decrementStock = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Invalid request data' });
        }
        const { id } = req.params;
        const { quantity } = req.body;
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        if (product.quantityInStock < quantity) {
            return res.status(400).json({ error: 'Insufficient stock' });
        }
        product.quantityInStock -= quantity;
        await product.save();
        res.json({ message: 'Stock decremented', productId: id, newQuantity: product.quantityInStock });
    } catch (error) {
        console.error('Error decrementing stock:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getCloudinaryUrl = (imageId) => `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/products/${imageId}`;
