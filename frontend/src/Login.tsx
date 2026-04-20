import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { API_BASE_URL } from './api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
         throw new Error("Credenciais inválidas");
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
    <div className="checkout-container" style={{maxWidth: '400px', marginTop: '4rem'}}>
      <div style={{textAlign: 'center', marginBottom: '2rem'}}>
        <Lock size={48} color="#66fcf1" style={{margin: '0 auto 1rem'}} />
        <h2>Acesso ao Painel</h2>
        <p style={{color: 'var(--text-muted)'}}>Entre para visualizar suas transações</p>
      </div>

      {error && <div style={{background: 'rgba(255,0,0,0.1)', color: '#ff6b6b', padding: '1rem', borderRadius: '8px', marginBottom: '1rem'}}>{error}</div>}

      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>E-mail</label>
          <input type="email" required className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Senha secreta</label>
          <input type="password" required className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button type="submit" className="btn-primary" disabled={loading} style={{marginBottom: '1rem'}}>
          {loading ? 'Entrando...' : 'Entrar Seguro'}
        </button>
        <div style={{textAlign: 'center', fontSize: '0.9rem'}}>
          <span style={{color: 'var(--text-muted)'}}>Novo por aqui? </span>
          <Link to="/register" style={{color: 'var(--accent)', textDecoration: 'none'}}>Criar conta de Parceiro</Link>
        </div>
      </form>
    </div>
  );
}
