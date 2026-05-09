import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import { CurrencyProvider } from './context/CurrencyContext';
import { SupportProvider } from './context/SupportContext';
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
const Debug = lazy(() => import('./pages/Debug'));
const Investments = lazy(() => import('./pages/Investments'));
const Deposit = lazy(() => import('./pages/Deposit'));

const LoadingScreen = () => (
  <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center space-y-6">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-primary/10 rounded-full"></div>
      <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(252,213,53,0.2)]"></div>
    </div>
    <p className="text-[10px] font-black text-primary uppercase tracking-[0.6em] animate-pulse">Initializing Institutional Protocol</p>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <CurrencyProvider>
        <SupportProvider>
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
                <Route path="/investments" element={<ProtectedRoute><Investments /></ProtectedRoute>} />
                <Route path="/deposit" element={<ProtectedRoute><Deposit /></ProtectedRoute>} />
                <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
                <Route path="/debug" element={<Debug />} />
              </Routes>
            </Suspense>
          </Router>
        </SupportProvider>
      </CurrencyProvider>
    </ErrorBoundary>
  );
}

export default App;
