import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import { accessToken, refreshToken } from "../utils/token.js";

export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        await User.create({ name, email, password, role });
        return res.status(201).json({ success: true, message: 'user register success' });
    }
    catch (error) {
        console.log(error, 'error in register');
        return res.status(500).json({ success: false, message: 'failed in register' });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'invalid email or password' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'invalid email or password' });
        }

        const accesstoken = accessToken({ id: user._id, role: user.role });
        const refreshtoken = refreshToken({ id: user._id, role: user.role });

        // BUG FIX: save on instance (user), not on the Model class (User)
        user.refreshToken = refreshtoken;
        await user.save();

        res.cookie('accessToken', accesstoken, {
            httpOnly: true,
            secure: false,        // set true only in production HTTPS
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000
        });

        res.cookie('refreshToken', refreshtoken, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        return res.json({ success: true, message: 'login success' });
    }
    catch (error) {
        console.log('login failed', error);
        return res.status(500).json({ success: false, message: 'error in login' });
    }
}

export const refresh = async (req, res) => {
    const refresttoken = req.cookies.refreshToken;
    if (!refresttoken) {
        return res.status(401).json({ success: false, message: "refresh token is not available" });
    }
    try {
        const decoded = jwt.verify(refresttoken, process.env.REFRESH_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (!user || user.refreshToken !== refresttoken) {
            return res.status(401).json({ success: false, message: 'refresh token is invalid' });
        }
        const accesstoken = accessToken({ id: user._id, role: user.role });
        res.cookie('accessToken', accesstoken, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000
        });
        return res.json({ success: true, message: 'access token refreshed' });
    }
    catch (error) {
        console.log('error in refresh');
        return res.status(401).json({ success: false, message: 'refresh error' });
    }
}

export const getUserProfile = async (req, res) => {
    try {
        const user = {
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role
        }
        return res.json({ success: true, user });
    }
    catch (error) {
        console.log('error in get user profile', error);
        return res.status(500).json({ success: false, message: 'error in user profile fetch' });
    }
}

export const logout = async (req, res) => {
    try {
        const refreshtoken = req.cookies.refreshToken;
        if (refreshtoken) {
            await User.findOneAndUpdate({ refreshToken: refreshtoken }, { refreshToken: '' });
        }
        res.clearCookie('refreshToken');
        res.clearCookie('accessToken');
        return res.json({ success: true, message: 'logout success' });
    }
    catch (error) {
        console.log('error in logout', error);
        return res.status(500).json({ success: false, message: 'error in logout' });
    }
}