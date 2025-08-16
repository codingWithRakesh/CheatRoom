import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

const uploadOnCloudinary = async (base64Image) => {
    try {
        if(!base64Image) return null
        const result = await cloudinary.uploader.upload(base64Image, {
            resource_type : 'auto', // Change folder as needed
          });      

        return result;
    } catch (error) {

        return null;
    }
};

const getPublicId = (url) => {
    const parts = url.split("/")
    const publicIdEx = parts[parts.length -1]
    const publicId = publicIdEx.split(".")[0]
    return publicId
}

const deleteFromCloudinary = async (publicId) => {
    try {
        if(!publicId) return null
        const result = await cloudinary.uploader.destroy(publicId);
        console.log("successfully upload")
        return result;
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        return null
    }
};

export { uploadOnCloudinary, deleteFromCloudinary, getPublicId };