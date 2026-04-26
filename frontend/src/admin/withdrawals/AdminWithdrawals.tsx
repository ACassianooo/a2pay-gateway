import React, { useState, useEffect } from 'react';
import type { DashboardData } from '../types';
import { SectionHeader, Card, fmt, StatusBadge } from '../AdminComponents';
import { Download, AlertTriangle, Check, X } from 'lucide-react';

const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:8080' : '';

export function AdminWithdrawals({ data }: { data: DashboardData }) {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWithdrawals = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/withdrawals`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const d = await res.json();
      setWithdrawals(Array.isArray(d) ? d : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleDecision = async (id: number, status: string) => {
    if (!window.confirm(`Deseja marcar este saque como ${status === 'pago' ? 'PAGO' : 'REJEITADO'}?`)) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/withdrawals/approve`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        fetchWithdrawals();
      }
    } catch (err) {
      alert("Erro ao atualizar saque");
    }
  };

  const pendingCount = withdrawals.filter(w => w.status === 'pending' || w.status === 'pendente').length;

  return (
    <div>
      <SectionHeader icon={<Download size={22} />} title="Saques (Controle Total)" sub="Fila de saques diários e antifraude direcionado de cash-out." />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
           <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid #22242c', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <h3 style={{ color: '#fff', fontWeight: 700 }}>Fila de Saques</h3>
             <span style={{ border: `1px solid ${pendingCount > 0 ? 'rgba(245,158,11,0.5)' : '#22c55e'}`, color: pendingCount > 0 ? '#f59e0b' : '#22c55e', fontSize: '0.7rem', padding: '0.3rem 0.6rem', borderRadius: 99, fontWeight: 800 }}>
                {pendingCount > 0 ? `FILA: ${pendingCount} PENDENTE(S)` : 'FILA LIMPA'}
             </span>
           </div>
           <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                 <tr style={{ background: '#0b0c10', borderBottom: '1px solid #22242c' }}>
                   {['Quem solicitou', 'Valor Líquido', 'Status', 'Decisão de Saque'].map(h => (
                     <th key={h} style={{ padding: '0.8rem 1.5rem', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>{h}</th>
                   ))}
                 </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Carregando...</td></tr>
                ) : withdrawals.length === 0 ? (
                  <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Nenhuma solicitação encontrada.</td></tr>
                ) : withdrawals.map(w => (
                  <tr key={w.id} style={{ borderBottom: '1px solid #1a1c24' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ color: '#fff', fontWeight: 700 }}>{w.merchant_name}</div>
                      <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>PIX: {w.pix_key}</div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: '#fff', fontWeight: 800 }}>{fmt(w.amount)}</td>
                    <td style={{ padding: '1rem 1.5rem' }}><StatusBadge status={w.status} /></td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      {(w.status === 'pending' || w.status === 'pendente') ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleDecision(w.id, 'pago')} style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)', padding: '0.45rem 0.9rem', borderRadius: 6, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Check size={14} /> Aprovar
                          </button>
                          <button onClick={() => handleDecision(w.id, 'rejeitado')} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '0.45rem 0.9rem', borderRadius: 6, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <X size={14} /> Rejeitar
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>Processado em {new Date(w.updated_at).toLocaleDateString()}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
           </table>
        </Card>

        <Card>
           <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
             <AlertTriangle size={16} color="#ef4444" /> Antifraude em Saque
           </h3>
           <ul style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '1rem', paddingLeft: '1rem' }}>
             <li><strong>Limite por dia:</strong> R$ 10.000,00</li>
             <li><strong>Conta suspeita:</strong> Bloqueada automaticamente se CNPJ não for o exato cadastrado (KYC/AML).</li>
           </ul>
        </Card>
      </div>
    </div>
  );
}
