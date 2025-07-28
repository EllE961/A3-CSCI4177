import { validationResult } from 'express-validator';
import Review from '../models/review.js';
import Product from '../models/product.js';
import axios from 'axios';

export const createReview = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }
        const { id: productId } = req.params;
        const { rating, comment } = req.body;
        const { userId } = req.user;

        const existingReview = await Review.findOne({ productId, userId });
        if (existingReview) {
            return res.status(409).json({ error: 'You have already reviewed this product' });
        }

        let hasPurchased = false;
        try {
            const orderRes = await axios.get(
                `http://order-service:4600/api/orders/user/${userId}`,
                { headers: { Authorization: req.headers.authorization } }
            );
            const orders = orderRes.data.orders || [];
            hasPurchased = orders.some(order =>
                order.orderStatus === 'delivered' &&
                order.orderItems.some(item => item.productId === productId)
            );
        } catch (err) {
            return res.status(502).json({ error: 'Failed to verify purchase history with order service' });
        }
        if (!hasPurchased) {
            return res.status(403).json({ error: 'You can only review products you have purchased and received' });
        }

        const review = await Review.create({
            productId,
            userId,
            rating,
            comment: comment || '',
        });

        await Product.recalculateRating(productId);

        const updatedProduct = await Product.findById(productId);

        res.status(201).json({
            message: "Review submitted.",
            review: {
                reviewId: review._id,
                userId: review.userId,
                rating: review.rating,
                comment: review.comment,
                createdAt: review.createdAt
            },
            newAverageRating: updatedProduct.averageRating,
            newReviewCount: updatedProduct.reviewCount
        });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const listReviews = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Invalid query parameters' });
        }
        const { id: productId } = req.params;
        const {
            page = 1,
            limit = 10,
            sort = 'createdAt:desc',
        } = req.query;

        let sortOption = { createdAt: -1 };
        if (sort === 'createdAt:asc') sortOption = { createdAt: 1 };
        if (sort === 'createdAt:desc') sortOption = { createdAt: -1 };
        if (sort === 'rating:asc') sortOption = { rating: 1 };
        if (sort === 'rating:desc') sortOption = { rating: -1 };

        const reviews = await Review.find({ productId })
            .sort(sortOption)
            .skip((page - 1) * limit)
            .limit(Number(limit));
        const total = await Review.countDocuments({ productId });

        const transformedReviews = reviews.map(review => ({
            reviewId: review._id,
            userId: review.userId,
            username: `user_${review.userId}`, // Placeholder - should come from user service
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt
        }));

        res.json({
            page: Number(page),
            limit: Number(limit),
            total,
            reviews: transformedReviews
        });
    } catch (error) {
        console.error('Error listing reviews:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateReview = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Invalid rating value' });
        }
        const { id: productId, reviewId } = req.params;
        const { userId } = req.user;
        const updateData = req.body;

        const review = await Review.findOneAndUpdate(
            { _id: reviewId, productId, userId },
            updateData,
            { new: true }
        );
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        await Product.recalculateRating(productId);

        const updatedProduct = await Product.findById(productId);

        res.json({
            message: "Review updated.",
            review: {
                reviewId: review._id,
                rating: review.rating,
                comment: review.comment,
                updatedAt: review.updatedAt
            },
            newAverageRating: updatedProduct.averageRating
        });
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Invalid review ID' });
        }
        const { id: productId, reviewId } = req.params;
        const { userId } = req.user;

        const review = await Review.findOneAndDelete({ _id: reviewId, productId, userId });
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        await Product.recalculateRating(productId);

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
