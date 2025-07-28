import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const productSchema = new Schema(
  {
    vendorId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      maxlength: 4000,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantityInStock: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: false,
      enum: ['electronics', 'fashion', 'home', 'books', 'sports', 'accessories', 'gaming', 'art', 'other'],
      default: 'other',
    },
    images: {
      type: [String],
      validate: arr => arr.length > 0,
    },
    tags: {
      type: [String],
      index: true,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
);

productSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    ret.productId = ret._id;
    delete ret._id;
  },
});

productSchema.statics.recalculateRating = async function (productId) {
  const result = await this.model('Review').aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: '$productId',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);
  const { averageRating = 0, reviewCount = 0 } = result[0] || {};
  await this.findByIdAndUpdate(productId, { averageRating, reviewCount });
};

export default model('Product', productSchema);
