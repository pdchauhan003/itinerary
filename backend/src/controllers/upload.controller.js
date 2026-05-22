import { Upload } from "../models/uploads.js";
import { uploadMultipleFilesService } from "../services/upload.service.js";

export const uploadDocument=async(req,res)=>{
    try{
        if (!req.files || req.files.length === 0) 
        {
            return res.status(400).json({success: false,message: 'File not found'});
        };
        const userId = req.user._id;
        const { itineraryId,journeyTitle  } = req.body;
        const uploadedFile = await uploadMultipleFilesService({files: req.files,userId,itineraryId});
        return res.status(201).json({success: true,message: 'File uploaded successfully',data: uploadedFile});
    }
    catch(error){
        console.log(error);
        return res.status(500).json({success: false,message: 'Server Error'});
    }
}

export const getUserUploadedFiles=async(req,res)=>{
    try{
        const userId=req.user._id;
        const uploads=await Upload.find({user:userId}).sort({createdAt:-1});
        return res.status(200).json({success:true,message:'file finds success'})
    }
    catch(error){
        console.log('error top get uploaded file by user')
        return res.status(500),json({success:false,message:'error top get uploaded file by user'})
    }
}