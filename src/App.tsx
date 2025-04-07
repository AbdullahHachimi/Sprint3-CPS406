import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateSet from './pages/CreateSet';
import EditSet from './pages/EditSet';
import ViewSet from './pages/ViewSet';
import PublicSets from './pages/PublicSets';

function App() {
  const { user, loading, initialize } = useAuthStore();

  React.useEffect(() => {
    initialize();
  }, [initialize]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-400"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/create" element={user ? <CreateSet /> : <Navigate to="/login" />} />
            <Route path="/sets/:id/edit" element={user ? <EditSet /> : <Navigate to="/login" />} />
            <Route path="/sets/:id" element={<ViewSet />} />
            <Route path="/public" element={<PublicSets />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App