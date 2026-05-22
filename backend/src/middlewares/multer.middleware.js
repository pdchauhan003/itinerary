import multer from 'multer';

const storage=multer.diskStorage({});
const fileFilter=(req,file,cb)=>{
    const allowMimeTypes=[
        'application/pdf',
        'image/png',
        'image/jpeg',
        'image/jpg'
    ];
    if (allowMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF and Images are allowed'));
    }
}

export const upload=multer({
    storage,
    limits:{
        fileSize:5*1024*1024
    },
    fileFilter
});