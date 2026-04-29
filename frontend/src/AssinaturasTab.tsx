import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, ChevronDown, Repeat, QrCode, ArrowLeft, Check } from 'lucide-react';
import { API_BASE_URL } from './api';

const Card = ({ children, style = {} }: any) => (
  <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', overflow: 'hidden', ...style }}>
    {children}
  </div>
);

export default function AssinaturasTab({ onNavigateToClients }: { onNavigateToClients?: () => void }) {
  const [activeSubTab, setActiveSubTab] = useState<'assinaturas' | 'checkouts'>('assinaturas');
  const [assinaturas, setAssinaturas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('Todos os status');
  const filterRef = useRef<HTMLDivElement>(null);

  // Modal de Criação (Criar Checkout)
  const [showModal, setShowModal] = useState(false);
  const [isNewClient, setIsNewClient] = useState(true);
  
  const [planoNome, setPlanoNome] = useState('');
  const [clienteNome, setClienteNome] = useState('');
  const [clienteEmail, setClienteEmail] = useState('');
  const [clienteTelefone, setClienteTelefone] = useState('');
  const [clienteCpf, setClienteCpf] = useState('');
  const [valor, setValor] = useState('');
  const [urlFinalizacao, setUrlFinalizacao] = useState('');
  const [urlRetorno, setUrlRetorno] = useState('');

  // Modal de QRCode PIX
  const [showPixModal, setShowPixModal] = useState<any>(null);

  useEffect(() => {
    fetchAssinaturas();

    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const formatCurrency = (val: string) => {
    const cleanValue = val.replace(/\D/g, '');
    const cents = parseInt(cleanValue || '0');
    return (cents / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const maskPhone = (val: string) => {
    const v = val.replace(/\D/g, "").substring(0, 11);
    if (v.length <= 10) return v.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    return v.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  };

  const maskDoc = (val: string) => {
    const v = val.replace(/\D/g, "").substring(0, 14);
    if (v.length <= 11) return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      // Converte "1.250,50" -> "1250.50"
      const rawValue = valor.replace(/\./g, '').replace(',', '.');
      const payload = {
        plano_nome: planoNome || 'Plano Personalizado',
        cliente_nome: clienteNome,
        cliente_email: clienteEmail,
        cliente_cpf: clienteCpf,
        valor: parseFloat(rawValue),
        intervalo_dias: 30, // fixo mensal por enquanto
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
        
        // Se for um novo cliente, redireciona para a aba de clientes
        if (isNewClient && onNavigateToClients) {
          onNavigateToClients();
        }

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

  const filteredAssinaturas = assinaturas.filter(sub => {
    if (selectedStatus === 'Todos os status') return true;
    if (selectedStatus === 'Ativa') return sub.status === 'ativa';
    if (selectedStatus === 'Pendente') return sub.status === 'atrasada';
    if (selectedStatus === 'Cancelada') return sub.status === 'cancelada';
    return true;
  });

  return (
    <div style={{ paddingBottom: '4rem' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', marginBottom: '1.5rem' }}>Assinaturas</h1>
      
      {/* Sub Tabs */}
      <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => setActiveSubTab('assinaturas')}
          style={{ 
            background: 'none', border: 'none', padding: '0.5rem 0', 
            borderBottom: activeSubTab === 'assinaturas' ? '2px solid #8942FC' : '2px solid transparent',
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
            borderBottom: activeSubTab === 'checkouts' ? '2px solid #8942FC' : '2px solid transparent',
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
          
          {/* Custom Dropdown Filter */}
          <div ref={filterRef} style={{ position: 'relative', width: '200px' }}>
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.9rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>
              {selectedStatus}
              <ChevronDown size={16} color="#64748b" style={{ transform: isFilterOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            
            {isFilterOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', marginTop: '0.5rem', zIndex: 10 }}>
                {['Todos os status', 'Pendente', 'Ativa', 'Cancelada'].map(status => (
                  <button 
                    key={status}
                    onClick={() => { setSelectedStatus(status); setIsFilterOpen(false); }}
                    style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'none', border: 'none', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', fontSize: '0.9rem', color: '#0f172a' }}
                  >
                    {status}
                    {selectedStatus === status && <Check size={16} color="#8942FC" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          style={{ background: '#8942FC', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.65rem 1.2rem', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 2px 10px rgba(137, 66, 252, 0.2)' }}>
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
              ) : filteredAssinaturas.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.95rem' }}>
                    Nenhum dado encontrado
                  </td>
                </tr>
              ) : (
                filteredAssinaturas.map((sub, i) => (
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
                        background: sub.status === 'ativa' ? '#f3e8ff' : (sub.status === 'atrasada' ? '#fee2e2' : '#f1f5f9'), 
                        color: sub.status === 'ativa' ? '#7e22ce' : (sub.status === 'atrasada' ? '#991b1b' : '#475569'), 
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

      {/* Modal de Criação Checkout */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <Card style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                  <ArrowLeft size={20} />
                </button>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Criar Checkout</h2>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>

            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              <form id="checkout-form" onSubmit={handleCreate}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', color: '#64748b' }}>Cliente</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Cadastrar novo cliente</span>
                    {/* Toggle */}
                    <div 
                      onClick={() => setIsNewClient(!isNewClient)}
                      style={{ 
                        width: '36px', height: '20px', background: isNewClient ? '#8942FC' : '#cbd5e1', 
                        borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' 
                      }}>
                      <div style={{ 
                        width: '16px', height: '16px', background: '#fff', borderRadius: '50%', 
                        position: 'absolute', top: '2px', left: isNewClient ? '18px' : '2px', transition: 'left 0.3s' 
                      }} />
                    </div>
                  </div>
                </div>

                {!isNewClient ? (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <select style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', appearance: 'none', color: '#64748b' }}>
                      <option>Selecione uma opção</option>
                    </select>
                  </div>
                ) : (
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #f1f5f9' }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>Nome do Cliente *</label>
                      <input required value={clienteNome} onChange={e => setClienteNome(e.target.value)} type="text" placeholder="Nome completo..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>E-mail *</label>
                      <input required value={clienteEmail} onChange={e => setClienteEmail(e.target.value)} type="email" placeholder="email@exemplo.com" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>Telefone *</label>
                      <input required value={clienteTelefone} onChange={e => setClienteTelefone(maskPhone(e.target.value))} type="text" placeholder="(00) 00000-0000" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} />
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>CPF ou CNPJ *</label>
                      <input required value={clienteCpf} onChange={e => setClienteCpf(maskDoc(e.target.value))} type="text" placeholder="000.000.000-00 ou 00.000.000/0000-00" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} />
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>
                    Produtos * <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 'normal' }}>ⓘ</span>
                  </label>
                  <input value={planoNome} onChange={e => setPlanoNome(e.target.value)} type="text" placeholder="Selecione uma opção (ou digite o nome)" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.2rem' }}>Valor</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 600, color: '#0f172a' }}>R$</span>
                    <input required value={valor} onChange={e => setValor(formatCurrency(e.target.value))} type="text" placeholder="0,00" style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.2rem', borderRadius: '8px', border: 'none', background: 'transparent', fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', outline: 'none' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>Métodos de pagamento *</label>
                  <div style={{ position: 'relative' }}>
                    <select style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', appearance: 'none', color: '#334155' }}>
                      <option>1 selecionado(s) - PIX</option>
                    </select>
                    <ChevronDown size={16} color="#94a3b8" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.4rem' }}>
                    Cupons <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>ⓘ</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', appearance: 'none', color: '#64748b' }}>
                      <option>Selecione uma opção</option>
                    </select>
                    <ChevronDown size={16} color="#94a3b8" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.4rem' }}>
                    URL de finalização <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>ⓘ</span>
                  </label>
                  <input value={urlFinalizacao} onChange={e => setUrlFinalizacao(e.target.value)} type="text" placeholder="Digite a URL de finalização" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.4rem' }}>
                    URL de retorno <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>ⓘ</span>
                  </label>
                  <input value={urlRetorno} onChange={e => setUrlRetorno(e.target.value)} type="text" placeholder="Digite a URL de retorno" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} />
                </div>

              </form>
            </div>

            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', background: '#f8fafc' }}>
              <button 
                form="checkout-form"
                type="submit" 
                style={{ background: '#8942FC', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.65rem 1.5rem', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 10px rgba(137, 66, 252, 0.2)' }}>
                Cadastrar
              </button>
            </div>

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
