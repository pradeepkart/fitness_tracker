import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './layouts/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import WorkoutsPage from './pages/WorkoutsPage';
import NutritionPage from './pages/NutritionPage';
import GoalsPage from './pages/GoalsPage';
import AIPage from './pages/AIPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
        <Route path="/workouts" element={<ProtectedRoute><Layout><WorkoutsPage /></Layout></ProtectedRoute>} />
        <Route path="/nutrition" element={<ProtectedRoute><Layout><NutritionPage /></Layout></ProtectedRoute>} />
        <Route path="/goals" element={<ProtectedRoute><Layout><GoalsPage /></Layout></ProtectedRoute>} />
        <Route path="/ai" element={<ProtectedRoute><Layout><AIPage /></Layout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <AppRoutes />
      </motion.div>
    </AuthProvider>
  );
}

export default App;
