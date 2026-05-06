import React, { useState } from 'react';
import { Zap, Clock, Banknote, HelpCircle, CheckCircle2, TrendingUp, AlertTriangle, ArrowLeft, XCircle, DollarSign, Wallet } from 'lucide-react';

interface Solicitacao {
  id: string | number;
  created_at: string;
  amount_requested: number;
  fee_amount: number;
  net_amount: number;
  status: 'aprovada' | 'pendente' | 'negada' | string;
}

function SimulateAnticipationModal({ onClose, onSuccess, saldoDisponivel }: { onClose: () => void, onSuccess: () => void, saldoDisponivel: number }) {
  const [valorInput, setValorInput] = useState('');
  const [simulando, setSimulando] = useState(false);
  const taxaPercentual = 2.99;

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

  const valorRaw = Number(valorInput.replace(/\D/g, '')) / 100;
  const valorDesconto = (valorRaw * taxaPercentual) / 100;
  const valorLiquido = valorRaw - valorDesconto;

  const handleSolicitar = async () => {
    if (valorRaw <= 0) return;
    setSimulando(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8080/api/merchants/anticipations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amount: valorRaw })
      });
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const err = await res.json();
        alert('Erro: ' + (err.error || 'Falha ao antecipar'));
      }
    } catch(err) {
      alert('Erro de conexão');
    }
    setSimulando(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 500, boxShadow: '0 20px 40px rgba(0,0,0,0.1)', overflow: 'hidden', animation: 'scaleIn 0.2s ease-out', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
            <ArrowLeft size={20} />
          </button>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: 0 }}>Antecipar Saldo</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
            <XCircle size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 10, marginBottom: '1.5rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#dcfce7', color: '#166534', display: 'grid', placeItems: 'center' }}>
              <Banknote size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Saldo Disponível para Antecipação</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827' }}>R$ {saldoDisponivel.toFixed(2).replace('.', ',')}</div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
              Valor a antecipar
            </label>
            <div style={{ position: 'relative' }}>
              <input value={valorInput} onChange={handlePriceChange} placeholder="R$ 0,00" style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: 8, border: '2px solid #8942FC', background: '#fff', fontSize: '1.1rem', color: '#111827', fontWeight: 700 }} />
              <button 
                onClick={() => setValorInput(saldoDisponivel.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }))}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: '#8942FC15', color: '#8942FC', border: 'none', padding: '0.3rem 0.6rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                Máximo
              </button>
            </div>
            {valorRaw > saldoDisponivel && (
              <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <AlertTriangle size={14} /> Valor excede o saldo disponível
              </p>
            )}
          </div>

          {/* Simulação */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: '1.2rem', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', fontSize: '0.9rem' }}>
              <span style={{ color: '#64748b' }}>Valor solicitado</span>
              <span style={{ fontWeight: 600, color: '#111827' }}>R$ {valorRaw.toFixed(2).replace('.', ',')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem' }}>
              <span style={{ color: '#64748b' }}>Taxa de antecipação ({taxaPercentual}%)</span>
              <span style={{ fontWeight: 600, color: '#ef4444' }}>- R$ {valorDesconto.toFixed(2).replace('.', ',')}</span>
            </div>
            <div style={{ height: 1, background: '#f1f5f9', margin: '0.8rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}>
              <span style={{ color: '#111827', fontWeight: 800 }}>Você vai receber</span>
              <span style={{ fontWeight: 800, color: '#22c55e' }}>R$ {valorLiquido.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
        </div>

        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', background: '#fff' }}>
          <button onClick={onClose} disabled={simulando} style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#475569', padding: '0.6rem 1.5rem', borderRadius: 8, fontWeight: 700, fontSize: '0.9rem', cursor: simulando ? 'not-allowed' : 'pointer' }}>Cancelar</button>
          <button onClick={handleSolicitar} disabled={simulando || valorRaw <= 0 || valorRaw > saldoDisponivel} style={{ background: '#8942FC', color: '#fff', border: 'none', padding: '0.6rem 1.5rem', borderRadius: 8, fontWeight: 700, fontSize: '0.9rem', cursor: (simulando || valorRaw <= 0 || valorRaw > saldoDisponivel) ? 'not-allowed' : 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: (valorRaw <= 0 || valorRaw > saldoDisponivel) ? 0.5 : 1 }}>
            <Zap size={16} /> {simulando ? 'Processando...' : 'Confirmar Antecipação'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AntecipacoesTab({ isSandbox }: { isSandbox: boolean }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);

  // Em um cenário real com endpoint de Wallet, isso viria da API
  const [saldoBloqueado, setSaldoBloqueado] = useState(0); 
  const [saldoElegivel, setSaldoElegivel] = useState(0); 

  const loadData = () => {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:8080/api/merchants/anticipations`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setSolicitacoes(data);
      })
      .catch(console.error);
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aprovada':
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.6rem', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}><CheckCircle2 size={11} /> Aprovada</span>;
      case 'pendente':
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.6rem', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}><Clock size={11} /> Em análise</span>;
      case 'negada':
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.6rem', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}><XCircle size={11} /> Negada</span>;
      default:
        return null;
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
      {isModalOpen && <SimulateAnticipationModal onSuccess={loadData} onClose={() => setIsModalOpen(false)} saldoDisponivel={saldoElegivel} />}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', margin: 0 }}>Antecipações</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.3rem' }}>Receba seu saldo futuro (cartão de crédito) imediatamente.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Card Principal */}
        <div style={{ background: 'linear-gradient(135deg, #111827 0%, #1e293b 100%)', borderRadius: 16, padding: '2rem', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)' }}>
          <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '200px', height: '200px', background: 'rgba(137, 66, 252, 0.15)', borderRadius: '50%', filter: 'blur(40px)' }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: 8 }}>
              <Zap size={20} color="#a855f7" />
            </div>
            <span style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Saldo Elegível</span>
          </div>

          <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
            R$ {saldoElegivel.toFixed(2).replace('.', ',')}
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '2rem' }}>Valor de vendas a prazo disponível para adiantamento.</p>

          <button onClick={() => setIsModalOpen(true)} style={{ background: '#8942FC', color: '#fff', border: 'none', borderRadius: 10, padding: '0.8rem 1.5rem', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s', boxShadow: '0 4px 12px rgba(137, 66, 252, 0.3)' }} onMouseEnter={e => e.currentTarget.style.background = '#7c3aed'} onMouseLeave={e => e.currentTarget.style.background = '#8942FC'}>
            Simular e Antecipar
          </button>
        </div>

        {/* Card Resumo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              <Clock size={16} /> Saldo Bloqueado Total
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827' }}>R$ {saldoBloqueado.toFixed(2).replace('.', ',')}</div>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.5rem' }}>Inclui valores ainda não elegíveis (vendas recentes).</p>
          </div>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              <TrendingUp size={16} /> Taxa Fixa
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#8942FC' }}>2.99%</div>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.5rem' }}>Desconto aplicado sobre o valor antecipado.</p>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', margin: '0 0 1rem 0' }}>Últimas Solicitações</h2>
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Data</th>
                <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Valor Solicitado</th>
                <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Taxa Descontada</th>
                <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', textAlign: 'right' }}>Valor Líquido Recebido</th>
              </tr>
            </thead>
            <tbody>
              {solicitacoes.map((s: any) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1.2rem 1.5rem', color: '#334155', fontSize: '0.9rem', fontWeight: 500 }}>{new Date(s.created_at).toLocaleDateString('pt-BR')}</td>
                  <td style={{ padding: '1.2rem 1.5rem', color: '#111827', fontSize: '0.95rem', fontWeight: 600 }}>R$ {s.amount_requested.toFixed(2).replace('.', ',')}</td>
                  <td style={{ padding: '1.2rem 1.5rem', color: '#ef4444', fontSize: '0.9rem', fontWeight: 600 }}>- R$ {s.fee_amount.toFixed(2).replace('.', ',')}</td>
                  <td style={{ padding: '1.2rem 1.5rem' }}>{getStatusBadge(s.status)}</td>
                  <td style={{ padding: '1.2rem 1.5rem', color: '#22c55e', fontWeight: 800, fontSize: '1rem', textAlign: 'right' }}>
                    R$ {s.net_amount.toFixed(2).replace('.', ',')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {solicitacoes.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              <Zap size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
              <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#334155' }}>Nenhuma antecipação</div>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Você ainda não realizou nenhuma antecipação de saldo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
