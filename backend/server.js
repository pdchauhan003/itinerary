import express from 'express';
import { app } from './src/app'; 
import dotenv from 'dotenv';

dotenv.config();

const port=process.env.PORT;
app.listen(port,()=>{
    console.log(`surver run in port ${port}`)
});