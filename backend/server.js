import 'dotenv/config';
import express from 'express';
import { app } from './src/app.js'; 
import { connectDB } from './src/utils/db.js';

const port=process.env.PORT;

const startServer = async () => {
    await connectDB();
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
};
startServer();
