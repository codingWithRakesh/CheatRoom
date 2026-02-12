import imagekit from "../configs/imageKit/config.js";

const uploadToImageKit = async (fileBuffer: Buffer, fileName: string, folder: string = "/"): Promise<any | null> => {
    try {
        const base64File: string = fileBuffer.toString('base64');

        return new Promise((resolve: (value: any) => void, reject: (reason?: any) => void) => {
            imagekit.upload(
                {
                    file: `data:application/octet-stream;base64,${base64File}`,
                    fileName: fileName,
                    folder: folder,
                },
                (error: Error | null, result: any) => {
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

const deleteFromImageKit = async (fileId: string): Promise<any | null> => {
    try {
        if (!fileId) return null;

        return new Promise((resolve: (value: any) => void, reject: (reason?: any) => void) => {
            imagekit.deleteFile(fileId, (error: Error | null, result: any) => {
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
