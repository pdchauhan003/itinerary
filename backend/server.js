import express from 'express';
import { app } from './src/app'; 
import dotenv from 'dotenv';
import { connectDB } from './src/utils/db';

dotenv.config();
const port=process.env.PORT;

const startServer = async () => {
    await connectDB();
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
};
startServer();
