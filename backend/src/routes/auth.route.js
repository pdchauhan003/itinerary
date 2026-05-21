import express from 'express';
import { login, register, refresh, logout, getUserProfile } from "../controllers/auth.controller.js";
import { protect } from '../middlewares/auth.middleware.js';

const userRouter = express.Router();

userRouter.post('/login', login);
userRouter.post('/register', register);
userRouter.post('/refresh', refresh);
userRouter.post('/logout', logout);
userRouter.get('/me', protect, getUserProfile);

export { userRouter };
