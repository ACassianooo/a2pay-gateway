import React, { useState } from 'react';
import { FileText, Plus, Search, MoreHorizontal, Copy, Trash2, ArrowLeft, CheckCircle2, Clock, XCircle, Info, Send } from 'lucide-react';

interface Cobranca {
  id: string;
  cliente: string;
  valor: number;
  vencimento: string;
  status: 'paga' | 'pendente' | 'vencida';
  descricao: string;
}

function CreateCobrancaModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [valor, setValor] = useState('');
  const [email, setEmail] = useState('');
  const [vencimento, setVencimento] = useState('');
  const [descricao, setDescricao] = useState('');
  const [saving, setSaving] = useState(false);

  const formatCurrency = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const amount = Number(digits) / 100;
    return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      setValor('');
      return;
    }
    setValor(formatCurrency(raw));
  };

  const handleSave = async () => {
    const numValue = Number(valor.replace(/\D/g, '')) / 100;
    if (numValue <= 0 || !email || !vencimento) {
      alert('Preencha os campos obrigatórios.');
      return;
    }
    
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8080/api/merchants/charges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amount: numValue, customer_email: email, due_date: vencimento + "T00:00:00Z", description: descricao })
      });
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const error = await res.json();
        alert('Erro: ' + (error.error || 'Falha ao criar'));
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
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
            <ArrowLeft size={20} />
          </button>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: 0 }}>Nova Cobrança</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
            <XCircle size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
          {/* Valor */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
              Valor da cobrança <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input value={valor} onChange={handlePriceChange} placeholder="R$ 0,00" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.9rem', color: '#111827' }} />
          </div>

          {/* Cliente */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
              E-mail do Cliente <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="cliente@email.com" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.9rem', color: '#111827' }} />
          </div>

          {/* Vencimento */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
              Data de Vencimento <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input type="date" value={vencimento} onChange={e => setVencimento(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.9rem', color: '#111827' }} />
          </div>

          {/* Descrição */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
              Descrição
            </label>
            <textarea value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Referente ao serviço prestado..." style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.9rem', color: '#111827', minHeight: '80px', resize: 'vertical' }} />
          </div>
        </div>

        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', background: '#fff' }}>
          <button onClick={onClose} disabled={saving} style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#475569', padding: '0.6rem 1.5rem', borderRadius: 8, fontWeight: 700, fontSize: '0.9rem', cursor: saving ? 'not-allowed' : 'pointer' }}>Cancelar</button>
          <button onClick={handleSave} disabled={saving} style={{ background: '#8942FC', color: '#fff', border: 'none', padding: '0.6rem 1.5rem', borderRadius: 8, fontWeight: 700, fontSize: '0.9rem', cursor: saving ? 'not-allowed' : 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onMouseEnter={e => !saving && (e.currentTarget.style.background = '#7c3aed')} onMouseLeave={e => !saving && (e.currentTarget.style.background = '#8942FC')}>
            <Send size={16} /> {saving ? 'Enviando...' : 'Gerar e Enviar Cobrança'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CobrancasTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);

  const loadData = () => {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:8080/api/merchants/charges`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setCobrancas(data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paga':
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.6rem', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}><CheckCircle2 size={11} /> Paga</span>;
      case 'pendente':
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.6rem', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}><Clock size={11} /> Pendente</span>;
      case 'vencida':
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.6rem', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}><XCircle size={11} /> Vencida</span>;
      default:
        return null;
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
      {isModalOpen && <CreateCobrancaModal onSuccess={loadData} onClose={() => setIsModalOpen(false)} />}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', margin: 0 }}>Cobranças</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.3rem' }}>Envie cobranças via Pix e Boleto direto para o cliente.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} style={{ background: '#8942FC', color: '#fff', border: 'none', borderRadius: 10, padding: '0.6rem 1.2rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', transition: 'background 0.2s', boxShadow: '0 4px 12px rgba(137, 66, 252, 0.2)' }} onMouseEnter={e => e.currentTarget.style.background = '#7c3aed'} onMouseLeave={e => e.currentTarget.style.background = '#8942FC'}>
          <Plus size={16} /> Nova Cobrança
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>A Receber</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>R$ 450,00</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Pagas (30 dias)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#22c55e' }}>R$ 1.250,00</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Inadimplência</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>R$ 800,00</div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              placeholder="Buscar por cliente, id..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '0.6rem 1rem 0.6rem 2.5rem', fontSize: '0.88rem', color: '#111827' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>ID / Descrição</th>
                <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Cliente</th>
                <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Vencimento</th>
                <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', textAlign: 'right' }}>Valor</th>
                <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {cobrancas.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.9rem' }}>{c.id}</div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{c.description}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: '#334155', fontSize: '0.9rem', fontWeight: 500 }}>{c.customer_email}</td>
                  <td style={{ padding: '1rem 1.5rem', color: '#334155', fontSize: '0.9rem' }}>{new Date(c.due_date).toLocaleDateString('pt-BR')}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>{getStatusBadge(c.status)}</td>
                  <td style={{ padding: '1rem 1.5rem', color: '#111827', fontWeight: 800, fontSize: '0.95rem', textAlign: 'right' }}>
                    R$ {c.amount.toFixed(2).replace('.', ',')}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.3rem', borderRadius: 6, transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.color = '#8942FC'; e.currentTarget.style.background = '#f1f5f9'; }} onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'none'; }}>
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {cobrancas.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              <FileText size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
              <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#334155' }}>Nenhuma cobrança gerada</div>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Você ainda não gerou nenhuma cobrança manual.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
