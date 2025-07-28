import mongoose from 'mongoose';

const vendorSettingSchema = new mongoose.Schema(
    {
      theme: { type: String, default: 'light' },
    },
    { _id: false }               
  );

const vendorSchema = new mongoose.Schema(
    {
    vendorId: {type: String, required: true, unique: true},
    storeName: {type: String, required: true},
    location: {type: String, required: true},
    phoneNumber: {type: String, required: true},
    logoUrl: {type: String, required: true},
    storeBannerUrl: {type: String, required: true},
    rating: {type: Number, required: true, default: 0},
    isApproved: { type: Boolean, default: false },
    socialLink: {type: Array},
    settings: { type: vendorSettingSchema, default: () => ({}) },
    },

    {timestamps: true, versionKey: false },
);

export default mongoose.model('Vendor', vendorSchema);