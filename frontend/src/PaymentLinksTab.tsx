import React, { useState } from 'react';
import { Link as LinkIcon, Plus, Copy, MoreHorizontal, CheckCircle2, FileText, QrCode } from 'lucide-react';
import { API_BASE_URL } from './api';

interface PaymentLink {
  id: string | number;
  name: string;
  amount: number | null; // null if amount is open
  created_at: string;
  status: 'active' | 'inactive' | string;
  url: string;
}

function CreatePaymentLinkModal({ onClose, onSuccess, initialData }: { onClose: () => void, onSuccess: () => void, initialData?: PaymentLink | null }) {
  const [nome, setNome] = useState(initialData ? initialData.name : '');
  const [valorInput, setValorInput] = useState(initialData && initialData.amount ? initialData.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '');
  const [tipoValor, setTipoValor] = useState<'fixo' | 'aberto'>(initialData && initialData.amount ? 'fixo' : 'aberto');
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

      let url = `${API_BASE_URL}/api/merchants/payment-links`;
      let method = 'POST';

      if (initialData) {
        url = `${API_BASE_URL}/api/merchants/payment-links/${initialData.id}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method: method,
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
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: 0 }}>{initialData ? 'Editar Link' : 'Criar Link de Pagamento'}</h2>
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
            {saving ? 'Salvando...' : (initialData ? 'Salvar Alterações' : 'Gerar Link')}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, loading, error }: { isOpen: boolean, title: string, message: string, onConfirm: () => void, onCancel: () => void, loading: boolean, error: string | null }) {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', animation: 'fadeIn 0.2s ease-out' }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 400, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', animation: 'scaleIn 0.2s ease-out', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem 1.5rem 0.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: '0 0 0.5rem 0' }}>{title}</h2>
          <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>{message}</p>
          {error && (
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#ef4444', fontSize: '0.85rem', fontWeight: 600 }}>
              {error}
            </div>
          )}
        </div>
        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button onClick={onCancel} disabled={loading} style={{ background: '#f1f5f9', border: 'none', color: '#475569', padding: '0.6rem 1.2rem', borderRadius: 10, fontWeight: 700, fontSize: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => { if(!loading) e.currentTarget.style.background = '#e2e8f0'; }} onMouseLeave={e => { if(!loading) e.currentTarget.style.background = '#f1f5f9'; }}>Cancelar</button>
          <button onClick={onConfirm} disabled={loading} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: 10, fontWeight: 700, fontSize: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)' }} onMouseEnter={e => { if(!loading) e.currentTarget.style.background = '#dc2626'; }} onMouseLeave={e => { if(!loading) e.currentTarget.style.background = '#ef4444'; }}>
            {loading ? 'Excluindo...' : 'Sim, excluir'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentLinksTab() {
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<PaymentLink | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | number | null>(null);
  const [copiedId, setCopiedId] = useState<string | number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<string | number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadData = () => {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/api/merchants/payment-links`, {
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
    setDropdownOpen(null);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const confirmDelete = (id: string | number) => {
    setLinkToDelete(id);
    setDeleteError(null);
    setDeleteModalOpen(true);
    setDropdownOpen(null);
  };

  const handleDelete = async () => {
    if (!linkToDelete) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/merchants/payment-links/${linkToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setDeleteModalOpen(false);
        setLinkToDelete(null);
        loadData();
      } else {
        setDeleteError("Falha ao excluir link. Tente novamente.");
      }
    } catch(err) {
      setDeleteError("Erro de conexão. Verifique sua internet.");
    }
    setDeleteLoading(false);
  };

  const openEdit = (link: PaymentLink) => {
    setEditingLink(link);
    setIsModalOpen(true);
    setDropdownOpen(null);
  };

  const handleOpenModal = () => {
    setEditingLink(null);
    setIsModalOpen(true);
  };

  return (
    <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
      {isModalOpen && <CreatePaymentLinkModal initialData={editingLink} onSuccess={loadData} onClose={() => setIsModalOpen(false)} />}
      
      <ConfirmModal 
        isOpen={deleteModalOpen} 
        title="Excluir Link" 
        message="Tem certeza que deseja excluir este link de pagamento? Esta ação não pode ser desfeita e os clientes não poderão mais pagar por ele." 
        loading={deleteLoading} 
        error={deleteError}
        onConfirm={handleDelete} 
        onCancel={() => setDeleteModalOpen(false)} 
      />

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
        <button onClick={handleOpenModal} style={{ background: '#8942FC', color: '#fff', border: 'none', borderRadius: 10, padding: '0.6rem 1.2rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s', boxShadow: '0 4px 12px rgba(137, 66, 252, 0.2)' }} onMouseEnter={e => e.currentTarget.style.background = '#7c3aed'} onMouseLeave={e => e.currentTarget.style.background = '#8942FC'}>
          <Plus size={16} /> Novo Link
        </button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', paddingBottom: dropdownOpen ? '100px' : '0', transition: 'padding-bottom 0.2s' }}>
        <div style={{ overflow: 'visible' }}>
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
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right', position: 'relative' }}>
                    <button 
                      onClick={() => setDropdownOpen(dropdownOpen === l.id ? null : l.id)}
                      style={{ background: dropdownOpen === l.id ? '#f1f5f9' : 'none', border: 'none', color: dropdownOpen === l.id ? '#8942FC' : '#94a3b8', cursor: 'pointer', padding: '0.3rem', borderRadius: 6, transition: 'all 0.2s' }} 
                      onMouseEnter={e => { e.currentTarget.style.color = '#8942FC'; e.currentTarget.style.background = '#f1f5f9'; }} 
                      onMouseLeave={e => { if (dropdownOpen !== l.id) { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'none'; } }}>
                      <MoreHorizontal size={18} />
                    </button>

                    {dropdownOpen === l.id && (
                      <div style={{ position: 'absolute', right: '1.5rem', top: '3rem', background: '#fff', borderRadius: 8, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', zIndex: 50, overflow: 'hidden', minWidth: '120px', textAlign: 'left' }}>
                        <button onClick={() => openEdit(l)} style={{ display: 'block', width: '100%', padding: '0.75rem 1rem', background: 'none', border: 'none', textAlign: 'left', fontSize: '0.85rem', color: '#475569', cursor: 'pointer', fontWeight: 500 }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                          Editar
                        </button>
                        <button onClick={() => confirmDelete(l.id)} style={{ display: 'block', width: '100%', padding: '0.75rem 1rem', background: 'none', border: 'none', textAlign: 'left', fontSize: '0.85rem', color: '#ef4444', cursor: 'pointer', fontWeight: 500 }} onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                          Excluir
                        </button>
                      </div>
                    )}
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
