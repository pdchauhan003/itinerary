import mg from "mongoose";

const itinerarySchema = new mg.Schema(
  {
    user: {type: mg.Schema.Types.ObjectId,ref: "User",required: true,},
    title: {type: String,required: true,trim: true,},
    itineraryData: {type: String, required: true,},
    pdfUrl: String,
    uploads: [{type: mg.Schema.Types.ObjectId,ref: "Upload",},],
  },
  {
    timestamps: true,
  }
);

const Itinerary = mg.model("Itinerary", itinerarySchema);

export { Itinerary };