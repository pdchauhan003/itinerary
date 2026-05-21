import express from 'express';
import { uploadSingleImage,uploadMultipleImages } from "../controllers/upload.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const uploadRouter=express.Router();

uploadRouter.post('/single',upload.single('image'),uploadSingleImage);
uploadRouter.post('/multiple',upload.array('images', 5),uploadMultipleImages);

export {uploadRouter};