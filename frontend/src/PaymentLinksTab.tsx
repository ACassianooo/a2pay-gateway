import React, { useState } from 'react';
import { Link as LinkIcon, Plus, Copy, MoreHorizontal, CheckCircle2, FileText, QrCode } from 'lucide-react';

interface PaymentLink {
  id: string;
  name: string;
  amount: number | null; // null if amount is open
  created_at: string;
  status: 'active' | 'inactive';
  url: string;
}

export default function PaymentLinksTab() {
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', margin: 0 }}>Links de Pagamento</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.3rem' }}>Crie links para receber pagamentos de forma rápida e fácil.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} style={{ background: '#8942FC', color: '#fff', border: 'none', borderRadius: 10, padding: '0.6rem 1.2rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s', boxShadow: '0 4px 12px rgba(137, 66, 252, 0.2)' }} onMouseEnter={e => e.currentTarget.style.background = '#7c3aed'} onMouseLeave={e => e.currentTarget.style.background = '#8942FC'}>
          <Plus size={16} /> Novo Link
        </button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Nome do Link</th>
                <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Valor</th>
                <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Criado em</th>
                <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {links.map(l => (
                <tr key={l.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.9rem' }}>{l.name}</div>
                    <div style={{ color: '#8942FC', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem', cursor: 'pointer' }} onClick={() => handleCopy(l.url, l.id)}>
                      {copiedId === l.id ? <CheckCircle2 size={12} color="#22c55e" /> : <Copy size={12} />}
                      {copiedId === l.id ? <span style={{ color: '#22c55e' }}>Copiado!</span> : 'Copiar URL'}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: '#111827', fontSize: '0.9rem', fontWeight: 600 }}>
                    {l.amount ? `R$ ${l.amount.toFixed(2).replace('.', ',')}` : 'Valor aberto'}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.6rem', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, background: l.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(100,116,139,0.1)', color: l.status === 'active' ? '#22c55e' : '#64748b', border: `1px solid ${l.status === 'active' ? 'rgba(34,197,94,0.3)' : 'rgba(100,116,139,0.3)'}` }}>
                      {l.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.85rem' }}>{new Date(l.created_at).toLocaleDateString('pt-BR')}</td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.3rem', borderRadius: 6, transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.color = '#8942FC'; e.currentTarget.style.background = '#f1f5f9'; }} onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'none'; }}>
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {links.length === 0 && (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#64748b' }}>
              <div style={{ width: 64, height: 64, background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#94a3b8' }}>
                <LinkIcon size={32} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#111827', marginBottom: '0.5rem' }}>Nenhum link criado</div>
              <p style={{ fontSize: '0.9rem', maxWidth: 400, margin: '0 auto' }}>Crie seu primeiro link de pagamento para vender pela internet sem precisar de um site completo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
