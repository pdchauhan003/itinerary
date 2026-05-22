import fs from 'fs';
import path from 'path';
import os from 'os';
import pdf from 'pdf-parse';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Itinerary } from "../models/itinerary.js";
import { Upload } from "../models/uploads.js";
import { uploadMultipleFilesService } from "../services/upload.service.js";
import { createItineraryPDF } from "../utils/pdfGenerator.js";
import { cloudinary } from "../utils/cloudinary.js";

// Helper to convert file buffer to Gemini inline parts
const fileToGenerativePart = (buffer, mimeType) => {
    return {
        inlineData: {
            data: buffer.toString("base64"),
            mimeType
        },
    };
};

/**
 * Generate travel itinerary based on uploaded tickets and images.
 */
export const generateItinerary = async (req, res) => {
    try {
        const { journeyTitle } = req.body;
        const userId = req.user._id;

        if (!journeyTitle) {
            return res.status(400).json({ success: false, message: 'Journey title is required' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No travel document files provided' });
        }

        // 1. Read files into memory for Gemini processing BEFORE they are unlinked by the upload service
        const pdfTexts = [];
        const imageParts = [];

        for (const file of req.files) {
            const fileBuffer = fs.readFileSync(file.path);
            if (file.mimetype.includes('pdf')) {
                try {
                    const parsedPdf = await pdf(fileBuffer);
                    pdfTexts.push(`[File: ${file.originalname}]\n${parsedPdf.text}`);
                } catch (err) {
                    console.error(`Failed to parse PDF ${file.originalname}:`, err);
                }
            } else if (file.mimetype.includes('image')) {
                imageParts.push(fileToGenerativePart(fileBuffer, file.mimetype));
            }
        }

        // 2. Upload original documents to Cloudinary and create Upload database document
        const uploadDocument = await uploadMultipleFilesService({
            files: req.files,
            userId
        });

        // 3. Initialize Gemini and prepare prompt
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ success: false, message: 'Gemini API key is not configured' });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-2.0-flash" });

        let prompt = `You are a professional travel planner. Analyze the attached travel documents (tickets, hotel bookings, flight confirmations, boarding passes, etc.) and construct a detailed, chronologically organized daily travel itinerary for a journey.
Journey Title: "${journeyTitle}"
`;

        if (pdfTexts.length > 0) {
            prompt += `\nHere is the text extracted from the uploaded PDF documents:\n${pdfTexts.join("\n\n")}\n`;
        }

        if (imageParts.length > 0) {
            prompt += `\nThere are also ${imageParts.length} images of documents attached. Please extract information from these images as well.\n`;
        }

        prompt += `
Use the extracted details (dates, flights, hotel check-ins, transit, booking references) to reconstruct the main activities of the trip. Reconstruct a seamless, day-by-day plan. If there are gaps in dates or times, use your knowledge to fill them in with logical and interesting activities (sightseeing, local dining, transit).

You MUST respond with a JSON object matching this schema:
{
  "title": "Clean, catchy itinerary title",
  "destination": "Main city/countries visited",
  "overview": "Short summary of the journey, destination highlights, and overall vibe",
  "days": [
    {
      "dayNumber": 1,
      "date": "Optional formatted date (e.g. YYYY-MM-DD or Day 1)",
      "theme": "Theme or highlight of the day",
      "activities": [
        {
          "time": "Formatted time (e.g. 09:00 AM or Morning)",
          "title": "Title of the activity",
          "description": "Details about flight, check-in, sightseeing, or meal reservation. Include booking references if found in the documents.",
          "type": "Must be one of: 'flight', 'hotel', 'dining', 'sightseeing', 'transit'",
          "location": "Optional location name or address"
        }
      ]
    }
  ],
  "travelTips": [
    "Useful tips like weather advice, transport, currency, local rules based on the destination."
  ]
}
`;

        // Build Gemini content parts: text prompt + any image parts
        const parts = [
            { text: prompt },
            ...imageParts
        ];

        const result = await model.generateContent({
            contents: [{ role: 'user', parts }],
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        // 4. Parse the generated JSON response
        let responseText = result.response.text().trim();
        // Remove code block backticks if present
        if (responseText.startsWith("```json")) {
            responseText = responseText.substring(7);
        } else if (responseText.startsWith("```")) {
            responseText = responseText.substring(3);
        }
        if (responseText.endsWith("```")) {
            responseText = responseText.substring(0, responseText.length - 3);
        }

        const itineraryJson = JSON.parse(responseText.trim());

        // 5. Generate PDF and upload to Cloudinary
        const tempPdfPath = path.join(os.tmpdir(), `itinerary_${Date.now()}.pdf`);
        await createItineraryPDF(itineraryJson, tempPdfPath);

        const pdfUploadResult = await cloudinary.uploader.upload(tempPdfPath, {
            resource_type: 'auto',
            folder: 'itinerary_pdfs',
            format: 'pdf'
        });

        const pdfUrl = pdfUploadResult.secure_url;

        // Cleanup temporary PDF
        if (fs.existsSync(tempPdfPath)) {
            fs.unlinkSync(tempPdfPath);
        }

        // 6. Save itinerary in database
        const newItinerary = await Itinerary.create({
            user: userId,
            title: journeyTitle,
            itineraryData: JSON.stringify(itineraryJson),
            pdfUrl,
            uploads: [uploadDocument._id]
        });

        // Update the uploads object to link to the new itinerary
        uploadDocument.itinerary = newItinerary._id;
        await uploadDocument.save();

        return res.status(201).json({
            success: true,
            message: 'Itinerary generated successfully',
            data: newItinerary
        });

    } catch (error) {
        console.error("Error generating itinerary:", error);
        return res.status(500).json({
            success: false,
            message: 'Failed to generate itinerary. Please verify your document formats.'
        });
    }
};

/**
 * Get all itineraries for the logged-in user.
 */
export const getItineraries = async (req, res) => {
    try {
        const userId = req.user._id;
        const itineraries = await Itinerary.find({ user: userId })
            .populate('uploads')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: itineraries
        });
    } catch (error) {
        console.error("Error getting itineraries:", error);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * Get a specific itinerary by ID.
 */
export const getItineraryById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const itinerary = await Itinerary.findById(id).populate('uploads');
        if (!itinerary) {
            return res.status(404).json({ success: false, message: 'Itinerary not found' });
        }

        if (itinerary.user.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        return res.status(200).json({
            success: true,
            data: itinerary
        });
    } catch (error) {
        console.error("Error getting itinerary:", error);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * Delete an itinerary and its related upload document database entries.
 */
export const deleteItinerary = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const itinerary = await Itinerary.findById(id);
        if (!itinerary) {
            return res.status(404).json({ success: false, message: 'Itinerary not found' });
        }

        if (itinerary.user.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        // Delete database records
        await Upload.deleteMany({ itinerary: id });
        await Itinerary.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: 'Itinerary deleted successfully'
        });
    } catch (error) {
        console.error("Error deleting itinerary:", error);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * Get a specific itinerary publicly by ID (no auth required).
 */
export const getSharedItineraryById = async (req, res) => {
    try {
        const { id } = req.params;

        const itinerary = await Itinerary.findById(id).populate('uploads');
        if (!itinerary) {
            return res.status(404).json({ success: false, message: 'Itinerary not found' });
        }

        return res.status(200).json({
            success: true,
            data: itinerary
        });
    } catch (error) {
        console.error("Error getting shared itinerary:", error);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};

