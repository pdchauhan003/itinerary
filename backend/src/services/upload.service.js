import fs from 'fs';
import { Upload } from "../models/uploads.js";
import { cloudinary } from "../utils/cloudinary.js";
export const uploadMultipleFilesService = async ({files,userId,itineraryId}) => {
    const uploadedFiles = [];
    for (const file of files) {
        const result = await cloudinary.uploader.upload(
            file.path,
            {
                resource_type: 'auto',
                folder: 'itinerary_uploads'
            }
        );
        const uploadDocument = await Upload.create({
            user: userId,
            itinerary: itineraryId || null,
            fileName: file.originalname,
            fileUrl: result.secure_url,
            fileType: file.mimetype.includes('pdf') ? 'pdf' : 'image',
            mimeType: file.mimetype,
            size: file.size,
            status: 'uploaded'
        });
        fs.unlinkSync(file.path);
        uploadedFiles.push(uploadDocument);
    }
    return uploadedFiles;
};