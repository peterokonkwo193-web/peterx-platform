import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import { CurrencyProvider } from './context/CurrencyContext';
import './App.css';

// Lazy load pages for performance
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TradingTerminal = lazy(() => import('./pages/TradingTerminal'));
const Markets = lazy(() => import('./pages/Markets'));
const Wallet = lazy(() => import('./pages/Wallet'));
const Settings = lazy(() => import('./pages/Settings'));
const Login = lazy(() => import('./pages/Login'));
const Staking = lazy(() => import('./pages/Staking'));
const Admin = lazy(() => import('./pages/Admin'));

const LoadingScreen = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
    <div className="w-12 h-12 border-4 border-pink-200 border-t-transparent rounded-full animate-spin"></div>
    <p className="font-label-caps text-zinc-500 text-[10px] tracking-widest animate-pulse">CONNECTING TO PROTOCOL...</p>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <CurrencyProvider>
        <Router>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login isSignUp={false} />} />
              <Route path="/signup" element={<Login isSignUp={true} />} />
              
              {/* Protected Dashboard Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/trade" element={<ProtectedRoute><TradingTerminal /></ProtectedRoute>} />
              <Route path="/markets" element={<ProtectedRoute><Markets /></ProtectedRoute>} />
              <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/staking" element={<ProtectedRoute><Staking /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            </Routes>
          </Suspense>
        </Router>
      </CurrencyProvider>
    </ErrorBoundary>
  );
}

export default App;
