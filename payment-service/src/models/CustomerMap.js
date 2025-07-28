import mongoose from 'mongoose';

const customerMapSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    stripeCustomerId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true },
);

const CustomerMap = mongoose.model('CustomerMap', customerMapSchema);
export default CustomerMap;
