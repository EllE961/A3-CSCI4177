import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const reviewSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,          
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 2000,
    },
  },
  { timestamps: true, versionKey: false }
);

reviewSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    ret.reviewId = ret._id;
    delete ret._id;
  },
});

reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

export default model('Review', reviewSchema);
