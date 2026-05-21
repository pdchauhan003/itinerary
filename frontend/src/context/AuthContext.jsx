import { createContext,useContext,useState} from "react";
import api from "../api/axios";

const AuthContext=createContext();

export const AuthProvider=({children})=>{
    const [user,setUser]=useState(null);
    const [loading,setLoading]=useState(true);

    const checkAuth=async()=>{
        try{
            const res=await api.get('/auth/me');
            setUser(res.data);
        }
        catch(error){
            alert('alert checkauth',error)
            setUser(null);
        }
        finally{
            setLoading(false)
        }
    }
    checkAuth();

    const login=async(email,password)=>{
        try{
            const res=await api.post('/auth/login',{email,password});
            setUser(res.data);
            return res.data;
        }
        catch(error){
            alert('login error to fetching',error)
        }
    }

    const register=async(userData)=>{
        try{
            const res=await api.post('/auth/register',{userData});
            setUser(res.data);
            return res.data;
        }
        catch(error){
            alert('register error to fetching',error)
        }
    }

    const logout = async () => {
        await api.post('/auth/logout');
        setUser(null);
    };

    return(
        <AuthContext.Provider value={{login,register,logout,user,loading,checkAuth}}>
            {children}
        </AuthContext.Provider>
    )
}

export const UseAuth=()=>useContext(AuthContext);