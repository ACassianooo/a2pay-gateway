import { Link } from 'react-router-dom';
import { HelpCircle, ChevronRight, Shield, Zap, TrendingUp, Code, Check, ArrowRight, ShieldCheck, Clock, Wallet, Layout, Globe, Star } from 'lucide-react';
import { useState } from 'react';

export default function Landing() {
  const [activeTab, setActiveTab] = useState('pix');

  return (
    <div className="pg-landing-wrapper" style={{ background: '#fff', overflowX: 'hidden' }}>
      
      {/* ── NAVBAR ────────────────────────────────────────────────────────── */}
      <nav style={{ 
        height: '80px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '0 5%', 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000, 
        background: 'rgba(255, 255, 255, 0.8)', 
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src="/logo.png" alt="A2Pay" style={{ height: '72px', objectFit: 'contain' }} />
          </Link>
          
          <div style={{ display: 'flex', gap: '2rem' }} className="nav-desktop-links">
            <a href="#taxas" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.95rem' }}>Taxas</a>
            <a href="#funcionalidades" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.95rem' }}>Funcionalidades</a>
            <Link to="/docs" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.95rem' }}>Desenvolvedores</Link>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/login" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: 700, fontSize: '0.95rem' }}>Entrar</Link>
          <Link to="/register" style={{ 
            textDecoration: 'none', 
            background: 'var(--primary)', 
            color: '#fff', 
            padding: '0.8rem 1.5rem', 
            borderRadius: 'var(--radius-md)', 
            fontWeight: 700, 
            fontSize: '0.95rem',
            boxShadow: '0 10px 20px -5px var(--primary-glow)',
            transition: 'transform 0.2s'
          }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            Seja Parceiro
          </Link>
        </div>
      </nav>

      {/* ── HERO SECTION ─────────────────────────────────────────────────── */}
      <section style={{ paddingTop: '160px', paddingBottom: '100px', textAlign: 'center', position: 'relative' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 5%' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(137,66,252,0.08)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: '100px', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '2.5rem', border: '1px solid rgba(137,66,252,0.1)' }}>
            <Zap size={14} /> Nova infraestrutura de pagamentos
          </div>
          
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: '1.5rem' }}>
            A tecnologia para quem <br /> <span style={{ color: 'var(--primary)' }}>vende e escala rápido.</span>
          </h1>
          
          <p style={{ fontSize: 'clamp(1.1rem, 2vw, 1.35rem)', color: 'var(--text-muted)', maxWidth: '750px', margin: '0 auto 3rem', lineHeight: 1.6, fontWeight: 500 }}>
            Da API robusta ao checkout de alta conversão. Tudo o que seu negócio precisa para gerir pagamentos com as melhores taxas do Brasil.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ 
              textDecoration: 'none', 
              background: 'var(--primary)', 
              color: '#fff', 
              padding: '1.2rem 3rem', 
              borderRadius: 'var(--radius-md)', 
              fontWeight: 800, 
              fontSize: '1.1rem',
              boxShadow: '0 20px 40px -10px var(--primary-glow)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              Começar Agora <ArrowRight size={20} />
            </Link>
            <Link to="/docs" style={{ 
              textDecoration: 'none', 
              background: '#fff', 
              color: 'var(--text-main)', 
              padding: '1.2rem 3rem', 
              borderRadius: 'var(--radius-md)', 
              fontWeight: 800, 
              fontSize: '1.1rem',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              Ver Documentação
            </Link>
          </div>

          {/* DASHBOARD PREVIEW */}
          <div style={{ marginTop: '5rem', position: 'relative' }}>
            <div style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)', 
              width: '80%', 
              height: '80%', 
              background: 'var(--primary)', 
              filter: 'blur(120px)', 
              opacity: 0.15, 
              zIndex: 0 
            }} />
            <div style={{ 
              background: '#fff', 
              borderRadius: '24px', 
              border: '8px solid rgba(0,0,0,0.03)', 
              boxShadow: '0 50px 100px -20px rgba(0,0,0,0.1)', 
              overflow: 'hidden',
              position: 'relative',
              zIndex: 1
            }}>
              <img 
                src="/dashboard-preview.png" 
                alt="Dashboard Preview" 
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── LOGOS SECTION ───────────────────────────────────────────────── */}
      <section style={{ padding: '4rem 0', background: 'var(--bg-main)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 5%', textAlign: 'center' }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2.5rem' }}>Tecnologia que move grandes operações</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', opacity: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
             {/* Placeholders for logos */}
             <div style={{ fontWeight: 900, fontSize: '1.5rem', color: '#111' }}>FINTECH</div>
             <div style={{ fontWeight: 900, fontSize: '1.5rem', color: '#111' }}>ECOMMERCE</div>
             <div style={{ fontWeight: 900, fontSize: '1.5rem', color: '#111' }}>SAAS</div>
             <div style={{ fontWeight: 900, fontSize: '1.5rem', color: '#111' }}>MARKETPLACE</div>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ───────────────────────────────────────────────── */}
      <section id="funcionalidades" style={{ padding: '120px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 5%' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.04em', marginBottom: '1rem' }}>Tudo o que você precisa <br /> para aceitar pagamentos.</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 500 }}>Recursos avançados para simplificar sua vida financeira.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
            <FeatureCard 
              icon={<ShieldCheck size={28} />} 
              title="Segurança Máxima" 
              desc="Infraestrutura certificada com os mais altos padrões de criptografia e proteção anti-fraude." 
            />
            <FeatureCard 
              icon={<Clock size={28} />} 
              title="Aprovações em Segundos" 
              desc="Nossa engine processa transações instantaneamente, maximizando suas taxas de conversão." 
            />
            <FeatureCard 
              icon={<Code size={28} />} 
              title="API Developer-First" 
              desc="Documentação clara e bibliotecas prontas para você integrar em qualquer linguagem em minutos." 
            />
            <FeatureCard 
              icon={<Wallet size={28} />} 
              title="Saques Ágeis" 
              desc="Tenha previsibilidade total do seu fluxo de caixa com saques automáticos para sua conta." 
            />
            <FeatureCard 
              icon={<Layout size={28} />} 
              title="Checkout Transparente" 
              desc="Mantenha o cliente no seu site durante todo o pagamento e aumente a confiança na sua marca." 
            />
            <FeatureCard 
              icon={<Globe size={28} />} 
              title="Suporte Especializado" 
              desc="Atendimento humanizado para ajudar você a crescer sua operação sem dores de cabeça." 
            />
          </div>
        </div>
      </section>

      {/* ── PRICING SECTION ─────────────────────────────────────────────── */}
      <section id="taxas" style={{ padding: '120px 0', background: 'var(--bg-main)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 5%' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
             <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Preços Transparentes</span>
            <h2 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.04em', marginTop: '1rem' }}>As menores taxas do mercado.</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 500 }}>Sem letras miúdas. Você só paga quando vende.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <PricingCard title="Pix" price="0,99%" subtitle="por transação" icon={<Zap size={24} />} recommended />
            <PricingCard title="Cartão de Crédito" price="3,00%" subtitle="+ R$ 0,50 fixo" icon={<Check size={24} />} />
            <PricingCard title="Boleto Bancário" price="R$ 1,99" subtitle="por boleto pago" icon={<ArrowRight size={24} />} />
            <PricingCard title="Cartão de Débito" price="1,49%" subtitle="por transação" icon={<Check size={24} />} />
          </div>

          <div style={{ marginTop: '4rem', textAlign: 'center', background: '#fff', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border)' }}>
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', fontWeight: 700 }}>
                   <Check size={18} color="var(--success)" /> Sem mensalidade
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', fontWeight: 700 }}>
                   <Check size={18} color="var(--success)" /> Sem taxa de adesão
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', fontWeight: 700 }}>
                   <Check size={18} color="var(--success)" /> Cancelamento gratuito
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────────────────── */}
      <section style={{ padding: '120px 0', textAlign: 'center', background: 'var(--primary)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(100px)' }} />
        <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', width: '300px', height: '300px', background: 'rgba(0,0,0,0.1)', borderRadius: '50%', filter: 'blur(100px)' }} />
        
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 5%', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '2rem', letterSpacing: '-0.04em' }}>Pronto para escalar seu faturamento?</h2>
          <p style={{ fontSize: '1.25rem', opacity: 0.9, marginBottom: '3rem', fontWeight: 500 }}>Junte-se a centenas de empresas que confiam na A2Pay para gerir seus pagamentos.</p>
          <Link to="/register" style={{ 
            textDecoration: 'none', 
            background: '#fff', 
            color: 'var(--primary)', 
            padding: '1.2rem 3.5rem', 
            borderRadius: 'var(--radius-md)', 
            fontWeight: 800, 
            fontSize: '1.2rem',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            Criar Minha Conta Grátis <ArrowRight size={22} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer style={{ padding: '80px 0', background: '#fff', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 5%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4rem', marginBottom: '4rem' }}>
            <div>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', marginBottom: '1.5rem' }}>
                <img src="/logo.png" alt="A2Pay" style={{ height: '28px', objectFit: 'contain' }} />
              </Link>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                A plataforma definitiva para <br /> negócios digitais modernos.
              </p>
            </div>
            <div>
              <h4 style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.5rem' }}>Produto</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <a href="#funcionalidades" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Funcionalidades</a>
                <a href="#taxas" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Taxas</a>
                <Link to="/register" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Criar Conta</Link>
              </div>
            </div>
            <div>
              <h4 style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.5rem' }}>Suporte</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Link to="/docs" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Documentação</Link>
                <a href="#" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Central de Ajuda</a>
                <a href="#" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontSize: '0.9rem' }}>API Reference</a>
              </div>
            </div>
            <div>
              <h4 style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.5rem' }}>Legal</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <a href="#" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Privacidade</a>
                <a href="#" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Termos de Uso</a>
                <a href="#" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Compliance</a>
              </div>
            </div>
          </div>
          
          <div style={{ paddingTop: '2.5rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>&copy; 2026 A2Pay Gateway de Pagamentos Ltda. CNPJ: 00.000.000/0001-00</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
               <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-main)', border: '1px solid var(--border)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}><Globe size={16} color="var(--text-muted)" /></div>
               <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-main)', border: '1px solid var(--border)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}><Shield size={16} color="var(--text-muted)" /></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── AUX COMPONENTS ─────────────────────────────────────────────────────────

function FeatureCard({ icon, title, desc }: { icon: React.ReactElement; title: string; desc: string }) {
  return (
    <div style={{ 
      padding: '2.5rem', 
      background: '#fff', 
      borderRadius: 'var(--radius-lg)', 
      border: '1px solid var(--border)', 
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer'
    }} onMouseEnter={e => {
      e.currentTarget.style.borderColor = 'var(--primary)';
      e.currentTarget.style.transform = 'translateY(-5px)';
      e.currentTarget.style.boxShadow = 'var(--shadow-premium)';
    }} onMouseLeave={e => {
      e.currentTarget.style.borderColor = 'var(--border)';
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}>
      <div style={{ background: 'rgba(137,66,252,0.08)', width: '56px', height: '56px', borderRadius: '16px', display: 'grid', placeItems: 'center', color: 'var(--primary)', marginBottom: '1.5rem' }}>
        {icon}
      </div>
      <h3 style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--text-main)', letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontWeight: 500 }}>{desc}</p>
    </div>
  );
}

function PricingCard({ title, price, subtitle, icon, recommended }: { title: string; price: string; subtitle: string; icon: React.ReactElement; recommended?: boolean }) {
  return (
    <div style={{ 
      padding: '3rem 2rem', 
      background: recommended ? 'var(--bg-card)' : '#fff', 
      borderRadius: 'var(--radius-lg)', 
      border: recommended ? '2px solid var(--primary)' : '1px solid var(--border)', 
      boxShadow: recommended ? '0 30px 60px -15px var(--primary-glow)' : 'none',
      position: 'relative',
      textAlign: 'center'
    }}>
      {recommended && (
        <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: '#fff', padding: '0.4rem 1rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
          Mais Popular
        </div>
      )}
      <div style={{ color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>{icon}</div>
      <h3 style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '1rem' }}>{title}</h3>
      <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.05em', marginBottom: '0.5rem' }}>{price}</div>
      <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>{subtitle}</p>
    </div>
  );
}
