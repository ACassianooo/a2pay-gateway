import React, { useState, useEffect } from 'react';
import { Search, Plus, CreditCard, ChevronDown, Repeat, ExternalLink, QrCode } from 'lucide-react';
import { API_BASE_URL } from './api';

const Card = ({ children, style = {} }: any) => (
  <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', overflow: 'hidden', ...style }}>
    {children}
  </div>
);

export default function AssinaturasTab() {
  const [activeSubTab, setActiveSubTab] = useState<'assinaturas' | 'checkouts'>('assinaturas');
  const [assinaturas, setAssinaturas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal de Criação
  const [showModal, setShowModal] = useState(false);
  const [planoNome, setPlanoNome] = useState('');
  const [clienteNome, setClienteNome] = useState('');
  const [clienteEmail, setClienteEmail] = useState('');
  const [clienteCpf, setClienteCpf] = useState('');
  const [valor, setValor] = useState('');
  const [intervaloDias, setIntervaloDias] = useState(30);

  // Modal de QRCode PIX
  const [showPixModal, setShowPixModal] = useState<any>(null);

  useEffect(() => {
    fetchAssinaturas();
  }, []);

  const fetchAssinaturas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/subscriptions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setAssinaturas(data);
      }
    } catch (error) {
      console.error('Erro ao buscar assinaturas', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        plano_nome: planoNome,
        cliente_nome: clienteNome,
        cliente_email: clienteEmail,
        cliente_cpf: clienteCpf,
        valor: parseFloat(valor.replace(',', '.')),
        intervalo_dias: intervaloDias,
      };

      const res = await fetch(`${API_BASE_URL}/api/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setShowModal(false);
        fetchAssinaturas();
        const data = await res.json();
        // Mostrar o modal de PIX automaticamente para a primeira cobrança
        if (data.pix_qr_code) {
          setShowPixModal(data);
        }
      } else {
        alert("Erro ao criar assinatura");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ paddingBottom: '4rem' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', marginBottom: '1.5rem' }}>Assinaturas</h1>
      
      {/* Sub Tabs */}
      <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => setActiveSubTab('assinaturas')}
          style={{ 
            background: 'none', border: 'none', padding: '0.5rem 0', 
            borderBottom: activeSubTab === 'assinaturas' ? '2px solid #22c55e' : '2px solid transparent',
            color: activeSubTab === 'assinaturas' ? '#111827' : '#64748b',
            fontWeight: activeSubTab === 'assinaturas' ? 600 : 500,
            cursor: 'pointer', fontSize: '0.95rem'
          }}>
          Assinaturas
        </button>
        <button 
          onClick={() => setActiveSubTab('checkouts')}
          style={{ 
            background: 'none', border: 'none', padding: '0.5rem 0', 
            borderBottom: activeSubTab === 'checkouts' ? '2px solid #22c55e' : '2px solid transparent',
            color: activeSubTab === 'checkouts' ? '#111827' : '#64748b',
            fontWeight: activeSubTab === 'checkouts' ? 600 : 500,
            cursor: 'pointer', fontSize: '0.95rem'
          }}>
          Checkouts
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Nome, e-mail ou ID da assinatura" 
              style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none' }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <select style={{ appearance: 'none', padding: '0.6rem 2.5rem 0.6rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', background: '#fff', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>
              <option>Todos os status</option>
              <option>Ativas</option>
              <option>Atrasadas</option>
              <option>Canceladas</option>
            </select>
            <ChevronDown size={16} color="#64748b" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          style={{ background: '#84cc16', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.65rem 1.2rem', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 2px 10px rgba(132, 204, 22, 0.2)' }}>
          <Plus size={18} /> Criar checkout de assinatura
        </button>
      </div>

      {/* Tabela */}
      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Cliente</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Valor</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Método</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Criação</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>ID Assinatura</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Carregando assinaturas...</td>
                </tr>
              ) : assinaturas.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.95rem' }}>
                    Nenhum dado encontrado
                  </td>
                </tr>
              ) : (
                assinaturas.map((sub, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #f1f5f9', transition: 'background .2s' }} className="hover:bg-slate-50">
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>{sub.cliente_nome}</div>
                      <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{sub.cliente_email}</div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#0f172a' }}>
                      R$ {sub.valor.toFixed(2).replace('.', ',')}
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400, marginLeft: '4px' }}>/ {sub.intervalo_dias}d</span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0ea5e9', fontWeight: 600, fontSize: '0.85rem', background: '#e0f2fe', padding: '0.2rem 0.6rem', borderRadius: '4px', width: 'fit-content' }}>
                        <Repeat size={14} /> PIX
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ 
                        background: sub.status === 'ativa' ? '#dcfce7' : (sub.status === 'atrasada' ? '#fee2e2' : '#f1f5f9'), 
                        color: sub.status === 'ativa' ? '#166534' : (sub.status === 'atrasada' ? '#991b1b' : '#475569'), 
                        padding: '0.3rem 0.75rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600 
                      }}>
                        {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                      {new Date(sub.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                      #{sub.id.toString().padStart(5, '0')}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <button 
                        onClick={() => setShowPixModal(sub)}
                        style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.4rem 0.8rem', fontSize: '0.8rem', fontWeight: 600, color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <QrCode size={14} /> Pagar PIX
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de Criação */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'grid', placeItems: 'center', padding: '1rem' }}>
          <Card style={{ width: '100%', maxWidth: '500px', padding: '2rem', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>Nova Assinatura PIX</h2>
            
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>Nome do Plano</label>
                <input required value={planoNome} onChange={e => setPlanoNome(e.target.value)} type="text" placeholder="Ex: Assinatura VIP" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>Valor (R$)</label>
                  <input required value={valor} onChange={e => setValor(e.target.value)} type="text" placeholder="99,90" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>Intervalo (Dias)</label>
                  <input required value={intervaloDias} onChange={e => setIntervaloDias(parseInt(e.target.value))} type="number" min="1" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} />
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', margin: '1.5rem 0' }} />
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>Nome do Cliente</label>
                <input required value={clienteNome} onChange={e => setClienteNome(e.target.value)} type="text" placeholder="João Silva" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>E-mail do Cliente</label>
                <input required value={clienteEmail} onChange={e => setClienteEmail(e.target.value)} type="email" placeholder="joao@exemplo.com" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>CPF do Cliente</label>
                <input required value={clienteCpf} onChange={e => setClienteCpf(e.target.value)} type="text" placeholder="000.000.000-00" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} />
              </div>

              <button type="submit" style={{ width: '100%', background: '#84cc16', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.85rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>
                Criar Assinatura
              </button>
            </form>
          </Card>
        </div>
      )}

      {/* Modal PIX Copia e Cola */}
      {showPixModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'grid', placeItems: 'center', padding: '1rem' }}>
          <Card style={{ width: '100%', maxWidth: '400px', padding: '2rem', position: 'relative', textAlign: 'center' }}>
            <button onClick={() => setShowPixModal(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Fatura Pendente</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Envie este código PIX para o cliente realizar o pagamento do ciclo atual.</p>
            
            {showPixModal.pix_qr_code ? (
              <img src={`data:image/png;base64,${showPixModal.pix_qr_code}`} alt="QR Code PIX" style={{ width: '200px', height: '200px', margin: '0 auto 1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
            ) : (
              <div style={{ width: '200px', height: '200px', margin: '0 auto 1.5rem', background: '#f1f5f9', borderRadius: '12px', display: 'grid', placeItems: 'center', color: '#94a3b8' }}>QR Code Indisponível</div>
            )}

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1rem', wordBreak: 'break-all', fontSize: '0.8rem', color: '#334155' }}>
              {showPixModal.pix_copy_paste || 'Código copia e cola indisponível'}
            </div>
            
            <button 
              onClick={() => {
                navigator.clipboard.writeText(showPixModal.pix_copy_paste || '');
                alert('PIX Copia e Cola copiado!');
              }}
              style={{ width: '100%', background: '#8942FC', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.85rem', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}>
              Copiar PIX Copia e Cola
            </button>
          </Card>
        </div>
      )}
    </div>
  );
}
