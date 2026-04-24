import { useState } from 'react';
import { Terminal, Shield, Zap, BookOpen, Key, Bell, Globe, Search, ArrowRight, CheckCircle2, ChevronRight, Copy, Check, Repeat } from 'lucide-react';

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
    { id: 'assinaturas', title: 'Assinaturas', icon: <Repeat size={18} /> },
    { id: 'webhooks', title: 'Webhooks', icon: <Bell size={18} /> },
  ];

  const codeExample = `
curl -X POST https://api.a2pay.com.br/api/v1/pix \\
  -H "Authorization: Bearer a2p_live_SEU_TOKEN" \\
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

  const subCodeExample = `
curl -X POST https://api.a2pay.com.br/api/v1/subscriptions \\
  -H "Authorization: Bearer a2p_live_SEU_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "plano_nome": "Plano Premium",
    "cliente_nome": "João Silva",
    "cliente_email": "joao@exemplo.com",
    "cliente_cpf": "000.000.000-00",
    "valor": 99.90,
    "intervalo_dias": 30
  }'`;

  const subResponseExample = `{
  "id": 12,
  "merchant_id": 4,
  "customer_id": "cust_123abc",
  "status": "ativa",
  "valor": 99.90,
  "intervalo_dias": 30,
  "pix_qr_code": "data:image/png;base64,...",
  "pix_copy_paste": "00020101021226870014br.gov.bcb.pix...",
  "created_at": "2026-04-24T18:00:00Z"
}`;

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)', background: '#ffffff', color: '#111827' }}>
      {/* SIDEBAR */}
      <aside style={{ width: '280px', borderRight: '1px solid #e5e7eb', background: '#f9fafb', padding: '2rem 1.5rem', position: 'sticky', top: '64px', height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>NAVEGAÇÃO</div>
          {sections.map(s => (
            <a key={s.id} href={`#${s.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.6rem 0.8rem', color: '#111827', textDecoration: 'none', borderRadius: '8px', marginBottom: '0.3rem', fontSize: '0.9rem', transition: 'all 0.2s', fontWeight: 500 }}>
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
          <h1 style={{ fontSize: '2.5rem', color: '#111827', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>API Reference A2Pay (v1)</h1>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#4b5563', marginBottom: '2rem' }}>
            Bem-vindo à documentação oficial da A2Pay. Nossa API foi desenhada para ser simples, rápida e extremamente robusta, permitindo que você aceite PIX no seu checkout em menos de 5 minutos.
          </p>

          <div style={{ background: '#fdfcfb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <Globe size={24} color="#f59e0b" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ color: '#d97706', fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem' }}>Endpoint de Produção</div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#111827' }}>https://api.a2pay.com.br/api/v1</div>
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
               <code>Authorization: Bearer a2p_live_...</code>
             </pre>
             <button onClick={() => handleCopy('Authorization: Bearer a2p_live_...', 'auth-copy')} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: copied === 'auth-copy' ? '#8942FC' : '#8d939b', cursor: 'pointer' }}>
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
              <span style={{ background: '#8942FC', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem' }}>POST</span>
              <code>/api/v1/pix</code>
            </div>

            <div style={{ background: '#13151a', borderRadius: '12px', padding: '1.2rem', border: '1px solid #22242c', position: 'relative' }}>
               <pre style={{ margin: 0, color: '#f8f8f2', fontSize: '0.85rem', lineHeight: '1.5', overflowX: 'auto' }}>
                 <code>{codeExample.trim()}</code>
               </pre>
               <button onClick={() => handleCopy(codeExample.trim(), 'curl-copy')} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: copied === 'curl-copy' ? '#8942FC' : '#8d939b', cursor: 'pointer' }}>
                 {copied === 'curl-copy' ? <Check size={18} /> : <Copy size={18} />}
               </button>
            </div>
          </div>

          <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>Exemplo de Resposta de Sucesso:</p>
          <div style={{ background: '#13151a', borderRadius: '12px', padding: '1.2rem', border: '1px solid #22242c', marginBottom: '2rem' }}>
             <pre style={{ margin: 0, color: '#d8b4fe', fontSize: '0.85rem', overflowX: 'auto' }}>
               <code>{responseExample}</code>
             </pre>
          </div>
        </section>

        {/* ASSINATURAS */}
        <section id="assinaturas" style={{ marginBottom: '4rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#111827', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <Repeat size={24} color="#8942FC" /> Criar Assinatura PIX
          </h2>
          <p style={{ lineHeight: '1.6', marginBottom: '1.5rem', color: '#4b5563' }}>
            Cria uma cobrança recorrente automatizada. A A2Pay se encarregará de gerar e cobrar o cliente a cada ciclo definido (mensal, anual, etc). O primeiro pagamento retorna o payload do PIX instantaneamente.
          </p>

          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#111827', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: '#8942FC', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem' }}>POST</span>
              <code>/api/v1/subscriptions</code>
            </div>

            <div style={{ background: '#13151a', borderRadius: '12px', padding: '1.2rem', border: '1px solid #22242c', position: 'relative' }}>
               <pre style={{ margin: 0, color: '#f8f8f2', fontSize: '0.85rem', lineHeight: '1.5', overflowX: 'auto' }}>
                 <code>{subCodeExample.trim()}</code>
               </pre>
               <button onClick={() => handleCopy(subCodeExample.trim(), 'sub-curl-copy')} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: copied === 'sub-curl-copy' ? '#8942FC' : '#8d939b', cursor: 'pointer' }}>
                 {copied === 'sub-curl-copy' ? <Check size={18} /> : <Copy size={18} />}
               </button>
            </div>
          </div>

          <h3 style={{ fontSize: '1.1rem', color: '#111827', fontWeight: 700, marginBottom: '1rem' }}>Body Parameters</h3>
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <li style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '8px' }}>
              <strong style={{ color: '#0f172a' }}>plano_nome</strong> <span style={{ color: '#94a3b8', fontSize: '0.8rem', marginLeft: '0.5rem' }}>string</span>
              <p style={{ margin: '0.3rem 0 0', fontSize: '0.9rem', color: '#64748b' }}>O nome ou identificador do produto/plano.</p>
            </li>
            <li style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '8px' }}>
              <strong style={{ color: '#0f172a' }}>valor</strong> <span style={{ color: '#94a3b8', fontSize: '0.8rem', marginLeft: '0.5rem' }}>float</span>
              <p style={{ margin: '0.3rem 0 0', fontSize: '0.9rem', color: '#64748b' }}>Valor da cobrança recorrente em reais (R$).</p>
            </li>
            <li style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '8px' }}>
              <strong style={{ color: '#0f172a' }}>intervalo_dias</strong> <span style={{ color: '#94a3b8', fontSize: '0.8rem', marginLeft: '0.5rem' }}>int</span>
              <p style={{ margin: '0.3rem 0 0', fontSize: '0.9rem', color: '#64748b' }}>O ciclo de renovação. Ex: <code>30</code> para Mensal ou <code>365</code> para Anual.</p>
            </li>
          </ul>

          <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>Exemplo de Resposta de Sucesso:</p>
          <div style={{ background: '#13151a', borderRadius: '12px', padding: '1.2rem', border: '1px solid #22242c', marginBottom: '2rem', position: 'relative' }}>
             <pre style={{ margin: 0, color: '#d8b4fe', fontSize: '0.85rem', overflowX: 'auto' }}>
               <code>{subResponseExample}</code>
             </pre>
          </div>
        </section>

        {/* WEBHOOKS */}
        <section id="webhooks" style={{ marginBottom: '4rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#111827', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <Bell size={24} color="#8942FC" /> Webhooks
          </h2>
          <p style={{ lineHeight: '1.6', marginBottom: '1.5rem', color: '#4b5563' }}>
            Receba notificações em tempo real sempre que um pagamento for confirmado. Configure sua URL de Webhook no painel administrativo.
          </p>
          <div style={{ background: 'rgba(137,66,252,0.05)', borderLeft: '4px solid #8942FC', padding: '1.5rem', borderRadius: '4px', border: '1px solid #e5e7eb', borderLeftWidth: '4px' }}>
            <div style={{ fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>Segurança de Webhook</div>
            <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>Sempre verifique a assinatura (HMAC) e o seu Webhook Secret para garantir que a notificação é legítima da A2Pay.</p>
          </div>
        </section>

        <footer style={{ marginTop: '6rem', padding: '2rem 0', borderTop: '1px solid #e5e7eb', textAlign: 'center', color: '#4b5563', fontSize: '0.9rem' }}>
          &copy; 2026 A2Pay Gateway de Pagamentos Ltda. Todos os direitos reservados.
        </footer>
      </main>

      {/* RIGHT SIDE TOC */}
      <aside style={{ width: '240px', padding: '2rem 1.5rem', position: 'sticky', top: '64px', height: 'calc(100vh - 64px)', fontSize: '0.85rem' }}>
        <div style={{ color: '#111827', fontWeight: 700, marginBottom: '1rem' }}>NESTA PÁGINA</div>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <li><a href="#intro" style={{ color: '#6b7280', textDecoration: 'none', transition: 'color .2s' }}>O que é a API?</a></li>
          <li><a href="#auth" style={{ color: '#6b7280', textDecoration: 'none', transition: 'color .2s' }}>Chaves de API</a></li>
          <li><a href="#pix" style={{ color: '#6b7280', textDecoration: 'none', transition: 'color .2s' }}>Criando Cobranças</a></li>
          <li><a href="#assinaturas" style={{ color: '#8942FC', fontWeight: 600, textDecoration: 'none', transition: 'color .2s' }}>Criar Assinatura</a></li>
          <li><a href="#webhooks" style={{ color: '#6b7280', textDecoration: 'none', transition: 'color .2s' }}>Configurando Webhooks</a></li>
        </ul>
      </aside>
    </div>
  );
}
