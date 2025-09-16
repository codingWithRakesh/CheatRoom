import { google } from "googleapis";
import path from "path";
import { fileURLToPath } from 'url';
import { Readable } from "stream";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const KEY_FILE_PATH = path.join(__dirname, "../../credentials.json");

// New auth setup
const auth = new google.auth.GoogleAuth({
  keyFile: KEY_FILE_PATH,
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});


const drive = google.drive({ version: "v3", auth });

const uploadOnGoogleDrive = async (buffer, fileName, mimeType) => {
  try {
    if (!buffer) return null;

    // Create the stream in one line
    const bufferStream = Readable.from(buffer);

    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: mimeType,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
      },
      media: {
        mimeType: mimeType,
        body: bufferStream,
      },
      supportsAllDrives: true,
      fields: "id, name, webViewLink",
    });

    console.log("✅ Successfully uploaded to Google Drive");
    return response.data;
  } catch (error) {
    console.error("❌ Error uploading to Google Drive:", error.message);
    return null;
  }
};

const getFileIdFromUrl = (url) => {
  if (!url) return null;
  const match = url.match(/[-\w]{25,}/);
  return match ? match[0] : null;
};

const deleteFromGoogleDrive = async (fileUrl) => {
  try {
    const fileId = getFileIdFromUrl(fileUrl);
    if (!fileId) return null;

    const result = await drive.files.delete({ fileId });
    console.log("✅ Successfully deleted from Google Drive");
    return result.data;
  } catch (error) {
    console.error("❌ Error deleting from Google Drive:", error.message);
    return null;
  }
};

export { uploadOnGoogleDrive, deleteFromGoogleDrive, getFileIdFromUrl };
