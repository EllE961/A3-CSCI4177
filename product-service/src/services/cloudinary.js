import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(filePath, publicId = undefined, folder = 'products') {
    return cloudinary.uploader.upload(filePath, {
        public_id: publicId,
        folder,
        resource_type: 'image',
    });
}

export async function deleteImage(publicId) {
    return cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
}

export default cloudinary; 