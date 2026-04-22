import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Shield, LogOut } from 'lucide-react';
import Dashboard from './Dashboard';
import Checkout from './Checkout';
import DemoStore from './DemoStore';
import Login from './Login';
import Register from './Register';
import Landing from './Landing';
import Docs from './Docs';

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}



function NavLinks() {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  if (!token) {
    return (
      <div className="navbar-links" style={{display: 'flex', alignItems: 'center', gap: '1.5rem'}}>
        <Link to="/docs" style={{color: 'var(--text)', textDecoration: 'none', fontWeight: 600}}>Docs</Link>
        <Link to="/login" style={{color: 'var(--text)', textDecoration: 'none', fontWeight: 600}}>Entrar</Link>
        <Link to="/register" className="btn-primary" style={{padding: '0.6rem 1.2rem', fontSize: '0.9rem'}}>Criar Conta</Link>
      </div>
    );
  }

  return (
    <div className="navbar-links" style={{display: 'flex', alignItems: 'center', gap: '1.5rem'}}>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/docs" style={{color: 'var(--text-main)', textDecoration: 'none'}}>Docs</Link>
      <button onClick={handleLogout} style={{background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
        <LogOut size={18} /> Sair
      </button>
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isCheckout = location.pathname.startsWith('/checkout');

  return (
    <div className={isDashboard ? "dashboard-layout" : "app-container"}>
      {!isDashboard && !isCheckout && (
        <nav className="navbar">
          <Link to="/" className="navbar-brand">
            <Shield color="#8942FC" fill="#8942FC" size={28} />
            <span>A2Pay</span>
          </Link>
          <NavLinks />
        </nav>
      )}
      
      <main className={isDashboard ? "dashboard-main-content" : "main-content"}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/demo-store" element={<DemoStore />} />
          <Route path="/checkout/:id" element={<Checkout />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
