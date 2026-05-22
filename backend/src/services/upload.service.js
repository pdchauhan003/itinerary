import fs from 'fs';
import { Upload } from "../models/uploads.js";
import { cloudinary } from "../utils/cloudinary.js";

export const uploadMultipleFilesService = async ({ files, userId, itineraryId }) => {
    const fileNames = [];
    const fileUrls = [];
    const fileTypes = [];
    const mimeTypes = [];
    const sizes = [];

    for (const file of files) {
        const result = await cloudinary.uploader.upload(
            file.path,
            {
                resource_type: 'auto',
                folder: 'itinerary_uploads'
            }
        );
        fileNames.push(file.originalname);
        fileUrls.push(result.secure_url);
        fileTypes.push(file.mimetype.includes('pdf') ? 'pdf' : 'image');
        mimeTypes.push(file.mimetype);
        sizes.push(file.size);

        // Cleanup local temp file
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
    }

    const uploadDocument = await Upload.create({
        user: userId,
        itinerary: itineraryId || null,
        fileName: fileNames,
        fileUrl: fileUrls,
        fileType: fileTypes,
        mimeType: mimeTypes,
        size: sizes,
        status: 'uploaded'
    });

    return uploadDocument;
};