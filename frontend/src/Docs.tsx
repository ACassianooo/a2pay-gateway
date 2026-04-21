import { useState } from 'react';
import { Terminal, Shield, Zap, BookOpen, Key, Bell, Globe, Search, ArrowRight, CheckCircle2, ChevronRight, Copy, Check } from 'lucide-react';

export default function Docs() {
  const [copied, setCopied] = useState('');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  const sections = [
    { id: 'intro', title: 'Introdução', icon: <BookOpen size={18} /> },
    { id: 'auth', title: 'Autenticação', icon: <Key size={18} /> },
    { id: 'pix', title: 'Integração PIX', icon: <Zap size={18} /> },
    { id: 'webhooks', title: 'Webhooks', icon: <Bell size={18} /> },
  ];

  const codeExample = `
curl -X POST https://api.a2pay.com.br/api/v1/pix \\
  -H "x-api-key: SEU_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "valor": 150.00,
    "descricao": "Venda de Teclado Mecânico",
    "customer_name": "Antônio Cassiano",
    "customer_email": "cassiano@exemplo.com",
    "customer_cpf": "123.456.789-00"
  }'`;

  const responseExample = `{
  "id": "intent_842911",
  "charge_id": "asaas_9381bx",
  "status": "aguardando_pix",
  "valor": 150.00,
  "pix_qr_code": "data:image/png;base64,...",
  "pix_copa_cola": "00020101021226870014br.gov.bcb.pix...",
  "pix_expiracao": "2026-04-20T18:00:00Z"
}`;

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)', background: '#0b0c10', color: '#c5c6c7' }}>
      {/* SIDEBAR */}
      <aside style={{ width: '280px', borderRight: '1px solid #1a1c24', background: '#0b0c10', padding: '2rem 1.5rem', position: 'sticky', top: '64px', height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ color: '#8d939b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>NAVEGAÇÃO</div>
          {sections.map(s => (
            <a key={s.id} href={`#${s.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.6rem 0.8rem', color: '#c5c6c7', textDecoration: 'none', borderRadius: '8px', marginBottom: '0.3rem', fontSize: '0.9rem', transition: 'all 0.2s' }}>
              {s.icon} {s.title}
            </a>
          ))}
        </div>

        <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(137,66,252,0.05)', borderRadius: '12px', border: '1px solid rgba(137,66,252,0.1)' }}>
          <div style={{ fontSize: '0.8rem', color: '#8942FC', fontWeight: 700, marginBottom: '0.5rem' }}>DICA PRO</div>
          <div style={{ fontSize: '0.75rem', color: '#8d939b', lineHeight: '1.4' }}>Use nosso ambiente de SandBox para testar suas integrações sem custos.</div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: '3rem 5rem', maxWidth: '900px' }}>
        
        {/* INTRO */}
        <section id="intro" style={{ marginBottom: '4rem' }}>
          <div style={{ color: '#8942FC', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Introdução</div>
          <h1 style={{ fontSize: '2.5rem', color: '#fff', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>API Reference A2Pay (v1)</h1>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#8d939b', marginBottom: '2rem' }}>
            Bem-vindo à documentação oficial da A2Pay. Nossa API foi desenhada para ser simples, rápida e extremamente robusta, permitindo que você aceite PIX no seu checkout em menos de 5 minutos.
          </p>

          <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px', padding: '1.5rem', display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <Globe size={24} color="#f59e0b" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem' }}>Endpoint de Produção</div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#ccc' }}>https://api.a2pay.com.br/api/v1</div>
            </div>
          </div>
        </section>

        {/* AUTH */}
        <section id="auth" style={{ marginBottom: '4rem', paddingTop: '2rem', borderTop: '1px solid #1a1c24' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#fff', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <Key size={24} color="#8942FC" /> Autenticação
          </h2>
          <p style={{ lineHeight: '1.6', marginBottom: '1.5rem' }}>
            Todas as chamadas para a API do A2Pay devem incluir sua <strong>API Key</strong> no header HTTP. Você pode gerar e gerenciar suas chaves diretamente no seu <a href="/dashboard" style={{ color: '#8942FC', textDecoration: 'none' }}>Dashboard de Lojista</a>.
          </p>

          <div style={{ background: '#13151a', borderRadius: '12px', padding: '1.2rem', border: '1px solid #22242c', position: 'relative' }}>
             <pre style={{ margin: 0, color: '#c5c6c7', fontSize: '0.9rem', overflowX: 'auto' }}>
               <code>x-api-key: a2pay_live_7g9x...</code>
             </pre>
             <button onClick={() => handleCopy('x-api-key: a2pay_live_7g9x...', 'auth-copy')} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: copied === 'auth-copy' ? '#22c55e' : '#8d939b', cursor: 'pointer' }}>
               {copied === 'auth-copy' ? <Check size={18} /> : <Copy size={18} />}
             </button>
          </div>
        </section>

        {/* PIX */}
        <section id="pix" style={{ marginBottom: '4rem', paddingTop: '2rem', borderTop: '1px solid #1a1c24' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#fff', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <Zap size={24} color="#8942FC" /> Gerar Cobrança PIX
          </h2>
          <p style={{ lineHeight: '1.6', marginBottom: '1.5rem' }}>
            Para gerar um QR Code de pagamento, envie uma requisição POST para o endpoint de PIX.
          </p>

          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: '#22c55e', color: '#000', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem' }}>POST</span>
              <code>/api/v1/pix</code>
            </div>

            <div style={{ background: '#13151a', borderRadius: '12px', padding: '1.2rem', border: '1px solid #22242c', position: 'relative' }}>
               <pre style={{ margin: 0, color: '#f8f8f2', fontSize: '0.85rem', lineHeight: '1.5', overflowX: 'auto' }}>
                 <code>{codeExample.trim()}</code>
               </pre>
               <button onClick={() => handleCopy(codeExample.trim(), 'curl-copy')} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: copied === 'curl-copy' ? '#22c55e' : '#8d939b', cursor: 'pointer' }}>
                 {copied === 'curl-copy' ? <Check size={18} /> : <Copy size={18} />}
               </button>
            </div>
          </div>

          <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>Exemplo de Resposta de Sucesso:</p>
          <div style={{ background: '#13151a', borderRadius: '12px', padding: '1.2rem', border: '1px solid #22242c', marginBottom: '2rem' }}>
             <pre style={{ margin: 0, color: '#66fcf1', fontSize: '0.85rem', overflowX: 'auto' }}>
               <code>{responseExample}</code>
             </pre>
          </div>
        </section>

        {/* WEBHOOKS */}
        <section id="webhooks" style={{ marginBottom: '4rem', paddingTop: '2rem', borderTop: '1px solid #1a1c24' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#fff', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <Bell size={24} color="#8942FC" /> Webhooks
          </h2>
          <p style={{ lineHeight: '1.6', marginBottom: '1.5rem' }}>
            Receba notificações em tempo real sempre que um pagamento for confirmado. Configure sua URL de Webhook no painel administrativo.
          </p>
          <div style={{ background: 'rgba(137,66,252,0.1)', borderLeft: '4px solid #8942FC', padding: '1.5rem', borderRadius: '4px' }}>
            <div style={{ fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>Segurança de Webhook</div>
            <p style={{ fontSize: '0.9rem', color: '#8d939b' }}>Sempre verifique a assinatura (HMAC) e o seu Webhook Secret para garantir que a notificação é legítima da A2Pay.</p>
          </div>
        </section>

        <footer style={{ marginTop: '6rem', padding: '2rem 0', borderTop: '1px solid #1a1c24', textAlign: 'center', color: '#4b5563', fontSize: '0.9rem' }}>
          &copy; 2026 A2Pay Gateway de Pagamentos Ltda. Todos os direitos reservados.
        </footer>
      </main>

      {/* RIGHT SIDE TOC */}
      <aside style={{ width: '240px', padding: '2rem 1.5rem', position: 'sticky', top: '64px', height: 'calc(100vh - 64px)', fontSize: '0.85rem' }}>
        <div style={{ color: '#fff', fontWeight: 700, marginBottom: '1rem' }}>NESTA PÁGINA</div>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <li><a href="#intro" style={{ color: '#8d939b', textDecoration: 'none' }}>O que é a API?</a></li>
          <li><a href="#auth" style={{ color: '#8d939b', textDecoration: 'none' }}>Chaves de API</a></li>
          <li><a href="#pix" style={{ color: '#8d939b', textDecoration: 'none' }}>Criando Cobranças</a></li>
          <li><a href="#webhooks" style={{ color: '#8d939b', textDecoration: 'none' }}>Configurando Webhooks</a></li>
        </ul>
      </aside>
    </div>
  );
}
