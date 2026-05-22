import express from 'express';
// import { uploadSingleImage,uploadMultipleImages } from "../controllers/upload.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { uploadDocument,getUserUploadedFiles } from '../controllers/upload.controller.js';
import { protect } from '../middlewares/auth.middleware.js';


const uploadRouter=express.Router();

uploadRouter.post('/',protect,upload.array('files', 5),uploadDocument);
uploadRouter.post('/multiple',protect,upload.array('files', 5),uploadDocument);  // Multiple files upload
uploadRouter.get('/',protect,getUserUploadedFiles)

export {uploadRouter};