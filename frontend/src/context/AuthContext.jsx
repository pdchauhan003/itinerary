/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const res = await api.get('/auth/me');
            if (res.data && res.data.user) {
                setUser(res.data.user);
            } else {
                setUser(null);
            }
        }
        catch (error) {
            setUser(null);
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await api.post('/auth/login', { email, password });
            if (res.data && res.data.user) {
                setUser(res.data.user);
            }
            return res.data;
        }
        catch (error) {
            console.error('Login error', error);
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const res = await api.post('/auth/register', userData);
            return res.data;
        }
        catch (error) {
            console.error('Registration error', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error', error);
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ login, register, logout, user, loading, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const UseAuth = () => useContext(AuthContext);