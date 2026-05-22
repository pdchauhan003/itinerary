import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SharedItinerary from './pages/SharedItinerary';
import { AuthProvider, UseAuth } from './context/AuthContext';
import { Loader2 } from 'lucide-react';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = UseAuth();

  if (loading) return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <Loader2 className="animate-spin" size={48} color="var(--primary)" />
      </div>
  );

  if (!user) return <Navigate to="/login" />;

  return children;
};

const Contents = () => {
  const { user } = UseAuth();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        {/* Public shareable itinerary page — no auth required */}
        <Route path="/itinerary/share/:id" element={<SharedItinerary />} />
        <Route path="/" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
};

function App() {
  return (
    <AuthProvider>
      <Contents />
    </AuthProvider>
  );
}

export default App;
