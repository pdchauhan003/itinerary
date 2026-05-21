import mg, { model } from 'mongoose';
import bcrypt from 'bcrypt';

const itinerarySchema=new mg.Schema({
    user:{type:mg.Schema.Types.ObjectId,ref:'User',required:true},
    title:{type:String},
    uploadedFiles:[{
        fileName:String,
        fileUrl:String,
        fileType:{type:String,enum:['pdf','image']},
        uploadedAt:{type:String,default:Date.now}
    }],
    tripInfo:{
        from: String,
        to: String,
        startDate: Date,
        endDate: Date,
        travelers: {
        type: Number,
        default: 1,
        },
    },

    extractedData: {
        rawText: String,
        structuredData: {
        type: Object,
        default: {},
        },
    },

    aiGeneratedItinerary: {
        type: Object,
        default: null,
    },

    status: {
      type: String,
      enum: ["uploaded", "processing", "completed", "failed"],
      default: "uploaded",
    },

    shareId: {
      type: String,
      unique: true,
      sparse: true,
    },

    isShared: {
      type: Boolean,
      default: false,
    },

    metadata: {
      aiModel: String, // "gemini-1.5", "gpt-4o"
      processingTime: Number, // in ms
    },
},
  {
    timestamps: true,
  }
);

const Itinerary=mg.model('Itinerary',itinerarySchema);

export {Itinerary};