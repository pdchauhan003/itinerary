import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { uploadRouter } from './routes/upload.route.js';
import { userRouter } from './routes/auth.route.js';
import { itineraryRouter } from './routes/itinerary.route.js';

const app = express();

const allowedOrigins = [
    'http://localhost:5173',
    'https://itinerary-drab.vercel.app'
];
if (process.env.CLIENT_URL) {
    allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/upload', uploadRouter);
app.use('/api/auth', userRouter);
app.use('/api/itinerary', itineraryRouter);

export { app };