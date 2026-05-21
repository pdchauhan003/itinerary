import { BrowserRouter,Router,Routes,Route,Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import { AuthProvider,UseAuth } from './context/AuthContext'
import { Loader2 } from 'lucide-react';
import './App.css'



const Privetroutes=({children})=>{
  const {user,loading}=UseAuth();

  if(loading)return(
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <Loader2 className="animate-spin" size={48} color="var(--primary)" />
      </div>
  );

  if(!user) return <Navigate to="/login" />;

  return children;
}
// eslint-disable-next-line no-unused-vars
const contents=()=>{
  const {user}=UseAuth();
  return(
    <BrowserRouter>
      <Router>
        {user}
        <Routes>
          
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />

          <Route path='/' element={
            <Privetroutes>
              <Dashboard/>
            </Privetroutes>
          }/>


        </Routes>
      </Router>
    </BrowserRouter>
  )
}

function App(){
  return(
    <AuthProvider>
      <contents/>
    </AuthProvider>
  )
}
export default App
