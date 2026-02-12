import multer from 'multer';

const storage: multer.StorageEngine = multer.memoryStorage();
export const upload: multer.Multer = multer({ storage });