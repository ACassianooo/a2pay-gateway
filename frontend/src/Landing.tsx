import { Link } from 'react-router-dom';
import { HelpCircle, ChevronDown, Shield } from 'lucide-react';

export default function Landing() {
  return (
    <div className="pg-landing-wrapper">
      {/* NAVBAR CLONE */}
      <nav className="pg-navbar">
        <div className="pg-nav-left">
          <Link to="/" className="pg-brand">
            <Shield size={24} color="#8942FC" fill="#8942FC" />
            <span className="pg-brand-text">A2Pay</span>
          </Link>
          <div className="pg-main-links">
            <a href="#taxas">Taxas</a>
            <Link to="/docs" style={{textDecoration: 'none', color: '#333', fontWeight: 600, fontSize: '1rem'}}>Documentação</Link>
          </div>
        </div>
        
        <div className="pg-nav-right">
          <button className="pg-icon-btn"><HelpCircle size={20} /></button>
          <Link to="/login" className="pg-btn-outline">Entrar</Link>
          <Link to="/register" className="pg-btn-solid">Seja Parceiro</Link>
        </div>
      </nav>

      {/* HERO SECTION - NEW LIGHT DESIGN */}
      <main className="pg-hero" style={{ background: '#fff', color: '#111' }}>
        <div className="pg-hero-content">
          
          <div className="pg-hero-text-col">
            <span className="pg-badge" style={{ background: 'rgba(137,66,252,0.1)', color: '#8942FC' }}>Lançamento!</span>
            <h1 style={{ color: '#111' }}>Pagamentos digitais para todo tipo de negócio</h1>
            <p style={{ color: '#6b7280' }}>
              A2Pay é a tecnologia de ponta para quem vende online.
              De soluções prontas a APIs robustas, oferecemos tudo o que você
              precisa para escalar seu negócio com lucros imbatíveis.
            </p>
            <div className="pg-hero-actions">
              <Link to="/register" className="pg-btn-solid" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>Começar Agora</Link>
            </div>
          </div>

          <div className="pg-hero-image-col">
            {/* Detalhe Roxo Decorativo (Background Art) */}
            <div style={{
              position: 'absolute',
              top: '10%',
              left: '10%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #8942FC 0%, #6366f1 100%)',
              borderRadius: '3rem',
              transform: 'rotate(-4deg)',
              zIndex: 0,
              opacity: 0.2,
              filter: 'blur(30px)'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-5%',
              right: '-5%',
              width: '90%',
              height: '90%',
              background: 'linear-gradient(135deg, #8942FC 0%, #a78bfa 100%)',
              borderRadius: '3rem',
              transform: 'rotate(2deg)',
              zIndex: 0,
              opacity: 0.15
            }} />
            <img 
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
              alt="Lojista embalando produtos e usando o computador"
              className="pg-hero-img"
              style={{ position: 'relative', zIndex: 1 }}
            />
          </div>

        </div>
      </main>

      {/* TAXAS SECTION - NOVO DESIGN */}
      <section id="taxas" style={{padding: '6rem 4rem', background: '#FDFCFB', textAlign: 'center'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto'}}>
          <div style={{color: '#8942FC', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: '1rem', textTransform: 'uppercase'}}>Taxas Transparentes</div>
          <h2 style={{fontSize: '2.8rem', fontWeight: 800, color: '#111', marginBottom: '1rem', letterSpacing: '-0.02em'}}>Taxas que cabem no seu bolso</h2>
          <p style={{color: '#666', fontSize: '1.1rem', marginBottom: '4rem', maxWidth: '700px', margin: '0 auto 4rem'}}>Sem letras miúdas, sem surpresinha no fim do mês. Você sabe exatamente quanto paga em cada venda.</p>
          
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem'}}>
            
            {/* PIX */}
            <div style={{background: '#fff', padding: '2.5rem 2rem', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', textAlign: 'left', border: '1px solid #f0f0f0'}}>
              <div style={{background: '#8942FC', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem'}}>
                <Shield size={20} color="#fff" />
              </div>
              <div style={{color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600}}>Pix</div>
              <div style={{fontSize: '2.2rem', fontWeight: 800, color: '#111', marginBottom: '0.3rem'}}>R$ 0,99</div>
              <p style={{color: '#8d939b', fontSize: '0.8rem'}}>por transação (Fixo)</p>
            </div>

            {/* BOLETO */}
            <div style={{background: '#fff', padding: '2.5rem 2rem', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', textAlign: 'left', border: '1px solid #f0f0f0'}}>
              <div style={{background: '#8942FC', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem'}}>
                <HelpCircle size={20} color="#fff" />
              </div>
              <div style={{color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600}}>Boleto</div>
              <div style={{fontSize: '2.2rem', fontWeight: 800, color: '#111', marginBottom: '0.3rem'}}>R$ 1,99</div>
              <p style={{color: '#8d939b', fontSize: '0.8rem'}}>por boleto pago</p>
            </div>

            {/* CRÉDITO */}
            <div style={{background: '#fff', padding: '2.5rem 2rem', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', textAlign: 'left', border: '1px solid #f0f0f0', position: 'relative'}}>
              <div style={{background: '#8942FC', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem'}}>
                <Shield size={20} color="#fff" />
              </div>
              <div style={{color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600}}>Cartão de crédito</div>
              <div style={{fontSize: '2.2rem', fontWeight: 800, color: '#111', marginBottom: '0.3rem'}}>3,00%</div>
              <p style={{color: '#8d939b', fontSize: '0.8rem'}}>+ R$ 0,50 por venda</p>
            </div>

            {/* DÉBITO */}
            <div style={{background: '#fff', padding: '2.5rem 2rem', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', textAlign: 'left', border: '1px solid #f0f0f0'}}>
              <div style={{background: '#8942FC', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem'}}>
                <Shield size={20} color="#fff" />
              </div>
              <div style={{color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600}}>Cartão de débito</div>
              <div style={{fontSize: '2.2rem', fontWeight: 800, color: '#111', marginBottom: '0.3rem'}}>1,49%</div>
              <p style={{color: '#8d939b', fontSize: '0.8rem'}}>por transação</p>
            </div>

          </div>

          <div style={{marginTop: '4rem', color: '#666', fontSize: '1rem', fontWeight: 500}}>
            Sem mensalidade. Sem taxa de adesão. <span style={{color: '#111', fontWeight: 700}}>Você só paga quando vende.</span>
          </div>
        </div>
      </section>

      <footer style={{padding: '4rem', background: '#fff', textAlign: 'center', borderTop: '1px solid #eee'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem'}}>
          <Shield size={20} color="#8942FC" fill="#8942FC" />
          <span style={{fontWeight: 800, color: '#111'}}>A2Pay</span>
        </div>
        <p style={{color: '#8d939b', fontSize: '0.9rem'}}>&copy; 2026 A2Pay Gateway de Pagamentos Ltda. CNPJ: 00.000.000/0001-00</p>
      </footer>
    </div>
  );
}
