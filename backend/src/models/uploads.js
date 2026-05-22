import mg from "mongoose";

const uploadSchema = new mg.Schema(
  {
    user: { type: mg.Schema.Types.ObjectId, ref: "User", required: true },
    itinerary: { type: mg.Schema.Types.ObjectId, ref: "Itinerary" },
    fileName: [{ type: String, required: true }],
    fileUrl: [{ type: String, required: true }],
    fileType: [{ type: String, enum: ["pdf", "image"] }],
    mimeType: [String],
    size: [Number],
    status: {
      type: String,
      enum: ["uploaded", "processing", "processed", "failed"],
      default: "uploaded",
    },
  },
  {
    timestamps: true,
  }
);

const Upload = mg.model("Upload", uploadSchema);

export { Upload };