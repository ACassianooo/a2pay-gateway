import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { API_BASE_URL } from './api';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      if (!res.ok) {
         throw new Error("Erro ao criar conta. Email já existe?");
      }

      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', 'lojista');
      navigate('/dashboard');
    } catch(err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="checkout-container" style={{maxWidth: '400px', marginTop: '4rem'}}>
      <div style={{textAlign: 'center', marginBottom: '2rem'}}>
        <UserPlus size={48} color="#66fcf1" style={{margin: '0 auto 1rem'}} />
        <h2>Torne-se um BaaS</h2>
        <p style={{color: 'var(--text-muted)'}}>Integre sua loja ao A2Pay hoje</p>
      </div>

      {error && <div style={{background: 'rgba(255,0,0,0.1)', color: '#ff6b6b', padding: '1rem', borderRadius: '8px', marginBottom: '1rem'}}>{error}</div>}

      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label>Nome Fantasia (Sua Loja)</label>
          <input type="text" required className="form-control" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <label>E-mail Comercial</label>
          <input type="email" required className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Senha de Acesso</label>
          <input type="password" required className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button type="submit" className="btn-primary" disabled={loading} style={{marginBottom: '1rem'}}>
          {loading ? 'Cadastrando...' : 'Criar Conta Grátis'}
        </button>
        <div style={{textAlign: 'center', fontSize: '0.9rem'}}>
          <span style={{color: 'var(--text-muted)'}}>Já é parceiro? </span>
          <Link to="/login" style={{color: 'var(--accent)', textDecoration: 'none'}}>Fazer login</Link>
        </div>
      </form>
    </div>
  );
}
