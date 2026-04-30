import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Shield, CheckCircle2, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from './api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Se já estiver logado, vai direto pro dashboard
  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
         throw new Error("E-mail ou senha incorretos.");
      }

      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      navigate('/dashboard');
    } catch(err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-split-wrapper">
      {/* SIDE CONTENT */}
      <div className="auth-side-content">
        <div style={{ maxWidth: '480px', position: 'relative', zIndex: 1 }}>
          <div className="auth-badge">
            <Shield size={16} /> Plataforma 100% Segura
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '2rem', letterSpacing: '-0.04em' }}>
            Acesse seu painel <br /> de controle.
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, lineHeight: 1.6, marginBottom: '3rem' }}>
            Gerencie suas vendas, acompanhe métricas em tempo real e escale sua operação financeira com a A2Pay.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', width: '32px', height: '32px', borderRadius: '50%', display: 'grid', placeItems: 'center' }}>
                <CheckCircle2 size={18} />
              </div>
              <span style={{ fontWeight: 600 }}>Checkout de alta conversão</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', width: '32px', height: '32px', borderRadius: '50%', display: 'grid', placeItems: 'center' }}>
                <CheckCircle2 size={18} />
              </div>
              <span style={{ fontWeight: 600 }}>Liquidação D+1 disponível</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', width: '32px', height: '32px', borderRadius: '50%', display: 'grid', placeItems: 'center' }}>
                <CheckCircle2 size={18} />
              </div>
              <span style={{ fontWeight: 600 }}>Suporte dedicado 24/7</span>
            </div>
          </div>
        </div>
      </div>

      {/* FORM CONTAINER */}
      <div className="auth-form-container">
        <div className="auth-form-card">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', marginBottom: '3rem' }}>
            <div style={{ background: 'var(--primary)', width: '32px', height: '32px', borderRadius: '8px', display: 'grid', placeItems: 'center' }}>
              <Shield size={18} color="#fff" fill="#fff" />
            </div>
            <span style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--text-main)', letterSpacing: '-0.04em' }}>A2Pay</span>
          </Link>

          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>Bem-vindo de volta</h2>
          <p style={{ color: 'var(--text-muted)', fontWeight: 500, marginBottom: '2.5rem' }}>Insira suas credenciais para acessar a conta.</p>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle2 size={18} style={{ transform: 'rotate(180deg)' }} /> {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="auth-input-group">
              <label>E-mail</label>
              <input 
                type="email" 
                required 
                placeholder="exemplo@empresa.com"
                className="auth-input" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
              />
            </div>
            
            <div className="auth-input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ marginBottom: 0 }}>Senha</label>
                <a href="#" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>Esqueceu a senha?</a>
              </div>
              <input 
                type="password" 
                required 
                placeholder="••••••••"
                className="auth-input" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '1rem', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
              {loading ? 'Validando...' : (
                <>Entrar no Painel <ArrowRight size={20} /></>
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-muted)' }}>
              Ainda não tem conta? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 800, textDecoration: 'none' }}>Comece agora gratuitamente</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
