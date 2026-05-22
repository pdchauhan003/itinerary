import mg from "mongoose";

const uploadSchema = new mg.Schema(
  {
    user: {type: mg.Schema.Types.ObjectId,ref: "User",required: true,},
    itinerary: {type: mg.Schema.Types.ObjectId,ref: "Itinerary"},
    fileName: {type: String,required: true,},
    fileUrl: {type: String,required: true,}, // Cloudinary },
    fileType: {type: String,enum: ["pdf", "image"],required: true,},
    mimeType: String,
    size: {type: Number},
    originalText: {type: String},
    extractedData: {type: Object,default: {}},
    status: {type: String,enum: ["uploaded", "processing", "processed", "failed"],default: "uploaded"},
  },
  {
    timestamps: true,
  }
);

const Upload = mg.model("Upload", uploadSchema);

export {Upload};