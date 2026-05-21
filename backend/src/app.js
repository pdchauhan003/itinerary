import express from 'express';
import cors from 'cors';
import {uploadRouter} from './routes/upload.route.js'
import { userRouter } from './routes/auth.route.js';

const app=express();
app.use('/api/upload',uploadRouter);
app.use('/api/auth/',userRouter)

export {app};