import express from 'express';
// import { uploadSingleImage,uploadMultipleImages } from "../controllers/upload.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { uploadDocument } from '../controllers/upload.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const uploadRouter=express.Router();

// uploadRouter.post('/single',upload.single('image'),uploadSingleImage);
// uploadRouter.post('/multiple',upload.array('images', 5),uploadMultipleImages);

uploadRouter.post('/',protect,upload.single('file'),uploadDocument);


// Multiple files upload
uploadRouter.post('/multiple',protect,upload.array('files', 5),uploadDocument);

export {uploadRouter};