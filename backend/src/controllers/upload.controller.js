// import { cloudinary } from "../utils/cloudinary.js";

// export const uploadSingleImage=async(req,res)=>{
//     try{
//         if(!req.file){
//             return res.status(400).json({success:false,message:'file not found'});
//         }
//         const result=await cloudinary.uploader.upload(
//             req.file.path,
//             {
//                 folder: 'single_uploads'
//             }
//         );
//         res.status(200).json({success: true,message: 'Image uploaded successfully',imageUrl: result.secure_url});

//     }
//     catch(error){
//         console.log('error in upoad ingle image in cloudinary');
//         res.status(500).json({success: false,message: 'Server Error'});
//     }
// }

// export const uploadMultipleImages=async(req,res)=>{
//     try{
//         if(!req.files || req.files.length==0){
//             return res.status(400).json({success: false,message: 'Images not found'});
//         }
//         const imageUrls = [];
//         for (const file of req.files) {
//             const result = await cloudinary.uploader.upload(
//                 file.path,
//                 {
//                     folder: 'multiple_uploads'
//                 }
//             );
//             imageUrls.push(result.secure_url);
//         }
//         res.status(200).json({success: true,message: 'Images uploaded successfully',images: imageUrls});
//     }
//     catch(error){
//         console.log('error in upoad ingle image in cloudinary');
//         res.status(500).json({success: false,message: 'Server Error'});
//     }
// }


import { uploadMultipleFilesService } from "../services/upload.service.js";

export const uploadDocument=async(req,res)=>{
    try{
        if (!req.files || req.files.length === 0) 
        {
            return res.status(400).json({success: false,message: 'File not found'});
        };
        const userId = req.user._id;
        const { itineraryId,journeyTitle  } = req.body;
        const uploadedFile = await uploadMultipleFilesService({file: req.files,userId,itineraryId});
        return res.status(201).json({success: true,message: 'File uploaded successfully',data: uploadedFile});
    }
    catch(error){
        console.log(error);
        return res.status(500).json({success: false,message: 'Server Error'});
    }
}