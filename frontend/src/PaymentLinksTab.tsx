import React, { useState } from 'react';
import { Link as LinkIcon, Plus, Copy, MoreHorizontal, CheckCircle2, FileText, QrCode } from 'lucide-react';

interface PaymentLink {
  id: string | number;
  name: string;
  amount: number | null; // null if amount is open
  created_at: string;
  status: 'active' | 'inactive' | string;
  url: string;
}

function CreatePaymentLinkModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [nome, setNome] = useState('');
  const [valorInput, setValorInput] = useState('');
  const [tipoValor, setTipoValor] = useState<'fixo' | 'aberto'>('fixo');
  const [saving, setSaving] = useState(false);

  const formatCurrency = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const amount = Number(digits) / 100;
    return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      setValorInput('');
      return;
    }
    setValorInput(formatCurrency(raw));
  };

  const handleSave = async () => {
    if (!nome) {
      alert('Dê um nome para o seu link.');
      return;
    }
    const numValue = Number(valorInput.replace(/\D/g, '')) / 100;
    if (tipoValor === 'fixo' && numValue <= 0) {
      alert('Digite um valor maior que zero.');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        name: nome,
        amount: tipoValor === 'fixo' ? numValue : null
      };

      const res = await fetch(`http://localhost:8080/api/merchants/payment-links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const err = await res.json();
        alert('Erro: ' + (err.error || 'Falha ao criar link'));
      }
    } catch(err) {
      alert('Erro de conexão');
    }
    setSaving(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 500, boxShadow: '0 20px 40px rgba(0,0,0,0.1)', overflow: 'hidden', animation: 'scaleIn 0.2s ease-out', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: 0 }}>Criar Link de Pagamento</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
              Nome do Link <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Curso de Marketing" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.9rem', color: '#111827' }} />
          </div>

          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
              Tipo do Valor
            </label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                <input type="radio" name="tipo_valor" checked={tipoValor === 'fixo'} onChange={() => setTipoValor('fixo')} />
                Valor Fixo
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                <input type="radio" name="tipo_valor" checked={tipoValor === 'aberto'} onChange={() => setTipoValor('aberto')} />
                Valor Aberto (Cliente decide)
              </label>
            </div>
          </div>

          {tipoValor === 'fixo' && (
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                Valor (R$) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input value={valorInput} onChange={handlePriceChange} placeholder="R$ 0,00" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.9rem', color: '#111827' }} />
            </div>
          )}
        </div>

        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', background: '#fff' }}>
          <button onClick={onClose} disabled={saving} style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#475569', padding: '0.6rem 1.5rem', borderRadius: 8, fontWeight: 700, fontSize: '0.9rem', cursor: saving ? 'not-allowed' : 'pointer' }}>Cancelar</button>
          <button onClick={handleSave} disabled={saving} style={{ background: '#8942FC', color: '#fff', border: 'none', padding: '0.6rem 1.5rem', borderRadius: 8, fontWeight: 700, fontSize: '0.9rem', cursor: saving ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
            {saving ? 'Criando...' : 'Gerar Link'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentLinksTab() {
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | number | null>(null);

  const loadData = () => {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:8080/api/merchants/payment-links`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setLinks(data);
      })
      .catch(console.error);
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const handleCopy = (url: string, id: string | number) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
      {isModalOpen && <CreatePaymentLinkModal onSuccess={loadData} onClose={() => setIsModalOpen(false)} />}
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
