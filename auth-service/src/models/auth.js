// src/models/auth.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const { Schema, model } = mongoose;
const SALT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 32,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^\S+@\S+\.\S+$/
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false        
    },
    role: {
      type: String,
      enum: ['consumer', 'vendor', 'admin'],
      default: 'consumer',
      required: true
    }
  },
  { timestamps: true }      
);


userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();   

  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});


userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};


userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

export default model('User', userSchema);
