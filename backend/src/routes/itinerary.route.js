import express from 'express';
import { generateItinerary, getItineraries, getItineraryById, deleteItinerary } from '../controllers/itinerary.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const itineraryRouter = express.Router();

itineraryRouter.post('/', protect, upload.array('files', 5), generateItinerary);
itineraryRouter.get('/', protect, getItineraries);
itineraryRouter.get('/:id', protect, getItineraryById);
itineraryRouter.delete('/:id', protect, deleteItinerary);

export { itineraryRouter };
