import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { uploadRouter } from './routes/upload.route.js';
import { userRouter } from './routes/auth.route.js';
import { itineraryRouter } from './routes/itinerary.route.js';

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/upload', uploadRouter);
app.use('/api/auth', userRouter);
app.use('/api/itinerary', itineraryRouter);

export { app };