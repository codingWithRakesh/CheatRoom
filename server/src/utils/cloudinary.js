import cloudinary from "../configs/cloudinary/config.js";

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