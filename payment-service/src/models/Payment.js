import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    paymentIntentId: {
      type: String,
      required: true,
      unique: true,
    },
    paymentMethodId: {
      type: String,
      required: true,
    },
    amount: {
      // Amount in the smallest currency unit (e.g., cents)
      type: Number,
      required: true,
      min: 1,
    },
    currency: {
      type: String,
      required: true,
      length: 3,
      uppercase: true,
    },
    status: {
      type: String,
      enum: ['processing', 'succeeded', 'failed', 'canceled'],
      default: 'processing',
    },
    receiptUrl: String,
  },
  { timestamps: true },
);


paymentSchema.method('toJSON', function () {
  const { _id, __v, ...obj } = this.toObject();
  obj.id = _id.toString();
  return obj;
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
