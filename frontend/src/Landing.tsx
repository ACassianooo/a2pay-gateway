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
            <a href="#">Produtos</a>
            <a href="#">Ofertas</a>
            <a href="#">Negócios que atendemos</a>
            <a href="#">Sobre</a>
            <a href="#" className="flex-center">Desenvolvedores <ChevronDown size={14} style={{marginLeft: '4px'}}/></a>
          </div>
        </div>
        
        <div className="pg-nav-right">
          <button className="pg-icon-btn"><HelpCircle size={20} /></button>
          <Link to="/login" className="pg-btn-outline">Entrar</Link>
          <Link to="/register" className="pg-btn-solid">Seja Parceiro</Link>
        </div>
      </nav>

      {/* HERO SECTION CLONE */}
      <main className="pg-hero">
        <div className="pg-hero-content">
          
          <div className="pg-hero-text-col">
            <span className="pg-badge">Lançamento!</span>
            <h1>Pagamentos digitais para todo tipo de negócio</h1>
            <p>
              A2Pay é a tecnologia de ponta para quem vende online.
              De soluções prontas a APIs robustas, oferecemos tudo o que você
              precisa para escalar seu negócio com lucros imbatíveis.
            </p>
            <div className="pg-hero-actions">
              <Link to="/register" className="pg-btn-white">Cadastre-se</Link>
            </div>
          </div>

          <div className="pg-hero-image-col">
            <img 
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
              alt="Lojista embalando produtos e usando o computador"
              className="pg-hero-img"
            />
          </div>

        </div>
      </main>

    </div>
  );
}
