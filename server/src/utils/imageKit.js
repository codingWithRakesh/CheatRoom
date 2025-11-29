import imagekit from "../configs/imageKit/config.js";

const uploadToImageKit = async (fileBuffer, fileName, folder = '/') => {
    try {
        const base64File = fileBuffer.toString('base64');

        return new Promise((resolve, reject) => {
            imagekit.upload(
                {
                    file: `data:application/octet-stream;base64,${base64File}`,
                    fileName: fileName,
                    folder: folder,
                },
                (error, result) => {
                    if (error) {
                        console.error('ImageKit Upload Error:', error);
                        return reject(error);
                    }
                    console.log('Successfully uploaded to ImageKit');
                    resolve(result);
                }
            );
        });
    } catch (error) {
        console.error('Error in uploadToImageKit:', error);
        return null;
    }
};

const deleteFromImageKit = async (fileId) => {
    try {
        if (!fileId) return null;

        return new Promise((resolve, reject) => {
            imagekit.deleteFile(fileId, (error, result) => {
                if (error) {
                    console.error('ImageKit Delete Error:', error);
                    return reject(error);
                }
                console.log('Successfully deleted from ImageKit');
                resolve(result);
            });
        });
    } catch (error) {
        console.error('Error in deleteFromImageKit:', error);
        return null;
    }
};

export { uploadToImageKit, deleteFromImageKit };
