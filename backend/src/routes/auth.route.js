import express from 'express';
import { login,register,refresh,logout,getUserProfile } from "../controllers/auth.controller";
import {protected} from '../middlewares/auth.middleware.js'

const userRouter=express.Router();

userRouter.post('/login',login);
userRouter.post('/register',register);
userRouter.post('/refresh',refresh);
userRouter.get('/logout',logout);
userRouter.get('/me',protected,getUserProfile);

export {userRouter};
