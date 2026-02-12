import cloudinary from "../configs/cloudinary/config.js";

type CloudinaryResourceType = "auto" | "image" | "video" | "raw";

const uploadOnCloudinary = async (base64File: string, type: CloudinaryResourceType = "auto"): Promise<any | null> => {
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

const getPublicId = (url: string): string | null => {
    if (!url) return null;
    const parts = url.split("/")
    const publicIdEx = parts[parts.length - 1]
    const publicId = publicIdEx.split(".")[0]
    return publicId
}

const deleteFromCloudinary = async (publicId: string, type: CloudinaryResourceType = "image"): Promise<any | null> => {
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