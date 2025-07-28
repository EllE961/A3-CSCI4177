import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const ItemSchema = new Schema({
  itemId: {
    type: String,
    default: () => new Types.ObjectId().toString(),
    unique: true
  },
  productId: String,
  productName: String,
  price: Number,
  quantity: Number,
  addedAt: { type: Date, default: Date.now }
});

const CartSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  items: [ItemSchema]
}, { timestamps: true });

export default model('Cart', CartSchema);