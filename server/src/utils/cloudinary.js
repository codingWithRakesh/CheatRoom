import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

const uploadOnCloudinary = async (base64File, type = "auto") => {
    try {
        if (!base64File) return null
        const result = await cloudinary.uploader.upload(base64File, {
            resource_type: type,
        });
        console.log("successfully uploaded");
        return result;
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        return null;
    }
};

const getPublicId = (url) => {
    if (!url) return null;
    const parts = url.split("/")
    const publicIdEx = parts[parts.length - 1]
    const publicId = publicIdEx.split(".")[0]
    return publicId
}

const deleteFromCloudinary = async (publicId, type = "image") => {
    try {
        if (!publicId) return null
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: type,
        });
        console.log("successfully deleted");
        return result;
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        return null
    }
};

export { uploadOnCloudinary, deleteFromCloudinary, getPublicId };