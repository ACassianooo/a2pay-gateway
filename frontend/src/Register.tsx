import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Shield, CheckCircle2, ArrowRight, Store, Mail, Lock, FileText, Phone } from 'lucide-react';
import { API_BASE_URL } from './api';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [document, setDocument] = useState('');
  const [phone, setPhone] = useState('');
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

  // Helper for CPF/CNPJ Masking
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length <= 11) {
      // CPF: 000.000.000-00
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      // CNPJ: 00.000.000/0000-00
      value = value.replace(/^(\d{2})(\d)/, '$1.$2');
      value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
      value = value.replace(/(\d{4})(\d)/, '$1-$2');
    }
    setDocument(value.substring(0, 18));
  };

  // Helper for Phone Masking
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
    value = value.replace(/(\d)(\d{4})$/, '$1-$2');
    setPhone(value.substring(0, 15));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Clean data before sending
    const cleanDocument = document.replace(/\D/g, '');
    const cleanPhone = phone.replace(/\D/g, '');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          email, 
          password,
          document: cleanDocument,
          phone: cleanPhone
        })
      });

      if (!res.ok) {
         const text = await res.text();
         let errorMessage = "Erro ao criar conta. Tente novamente.";
         try {
            const data = JSON.parse(text);
            errorMessage = data.error || errorMessage;
         } catch(e) {
            errorMessage = text || errorMessage;
         }
         throw new Error(errorMessage);
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
    <div className="auth-split-wrapper">
      {/* SIDE CONTENT */}
      <div className="auth-side-content">
        <div style={{ maxWidth: '480px', position: 'relative', zIndex: 1 }}>
          <div className="auth-badge">
            <UserPlus size={16} /> Programa de Parceiros
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '2rem', letterSpacing: '-0.04em' }}>
            Comece a vender <br /> em minutos.
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, lineHeight: 1.6, marginBottom: '3rem' }}>
            Junte-se à infraestrutura de pagamentos mais robusta do mercado brasileiro e tenha controle total do seu negócio.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', width: '32px', height: '32px', borderRadius: '50%', display: 'grid', placeItems: 'center' }}>
                <CheckCircle2 size={18} />
              </div>
              <span style={{ fontWeight: 600 }}>Aprovação automática para novos lojistas</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', width: '32px', height: '32px', borderRadius: '50%', display: 'grid', placeItems: 'center' }}>
                <CheckCircle2 size={18} />
              </div>
              <span style={{ fontWeight: 600 }}>API documentada e fácil de integrar</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', width: '32px', height: '32px', borderRadius: '50%', display: 'grid', placeItems: 'center' }}>
                <CheckCircle2 size={18} />
              </div>
              <span style={{ fontWeight: 600 }}>As menores taxas garantidas</span>
            </div>
          </div>
        </div>
      </div>

      {/* FORM CONTAINER */}
      <div className="auth-form-container" style={{ overflowY: 'auto' }}>
        <div className="auth-form-card" style={{ padding: '2rem 0' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', marginBottom: '2rem' }}>
            <div style={{ background: 'var(--primary)', width: '32px', height: '32px', borderRadius: '8px', display: 'grid', placeItems: 'center' }}>
              <Shield size={18} color="#fff" fill="#fff" />
            </div>
            <span style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--text-main)', letterSpacing: '-0.04em' }}>A2Pay</span>
          </Link>

          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>Criar sua conta</h2>
          <p style={{ color: 'var(--text-muted)', fontWeight: 500, marginBottom: '2rem' }}>Preencha os dados abaixo para começar.</p>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="auth-input-group">
              <label>Nome Fantasia (Sua Loja)</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  required 
                  placeholder="Nome da sua empresa"
                  className="auth-input" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="auth-input-group">
                <label>CPF ou CNPJ</label>
                <input 
                  type="text" 
                  required 
                  placeholder="00.000.000/0000-00"
                  className="auth-input" 
                  value={document} 
                  onChange={handleDocumentChange} 
                />
              </div>
              <div className="auth-input-group">
                <label>Telefone</label>
                <input 
                  type="text" 
                  required 
                  placeholder="(00) 00000-0000"
                  className="auth-input" 
                  value={phone} 
                  onChange={handlePhoneChange} 
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label>E-mail Comercial</label>
              <input 
                type="email" 
                required 
                placeholder="comercial@suaempresa.com"
                className="auth-input" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
              />
            </div>

            <div className="auth-input-group">
              <label>Senha de Acesso</label>
              <input 
                type="password" 
                required 
                placeholder="Crie uma senha forte"
                className="auth-input" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '1rem', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
              {loading ? 'Processando...' : (
                <>Criar Minha Conta Grátis <ArrowRight size={20} /></>
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-muted)' }}>
              Já tem uma conta? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 800, textDecoration: 'none' }}>Fazer Login</Link>
            </div>
            
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2rem', lineHeight: 1.5 }}>
              Ao criar sua conta, você concorda com nossos <br /> 
              <a href="#" style={{ color: 'var(--text-main)', fontWeight: 700 }}>Termos de Uso</a> e <a href="#" style={{ color: 'var(--text-main)', fontWeight: 700 }}>Privacidade</a>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
