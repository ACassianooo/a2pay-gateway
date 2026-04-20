import React from 'react';
import type { DashboardData } from '../types';
import { SectionHeader, Card, fmt, StatusBadge } from '../AdminComponents';
import { Download, AlertTriangle } from 'lucide-react';

export function AdminWithdrawals({ data }: { data: DashboardData }) {
  return (
    <div>
      <SectionHeader icon={<Download size={22} />} title="Saques (Controle Total)" sub="Fila de saques diários e antifraude direcionado de cash-out." />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
           <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid #22242c', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <h3 style={{ color: '#fff', fontWeight: 700 }}>Fila de Saques</h3>
             <span style={{ border: '1px solid rgba(245,158,11,0.5)', color: '#f59e0b', fontSize: '0.7rem', padding: '0.3rem 0.6rem', borderRadius: 99, fontWeight: 800 }}>FILA: 1 PENDENTE</span>
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
                <tr style={{ borderBottom: '1px solid #1a1c24' }}>
                  <td style={{ padding: '1rem 1.5rem', color: '#fff', fontWeight: 700 }}>Lojista Demo</td>
                  <td style={{ padding: '1rem 1.5rem', color: '#fff', fontWeight: 800 }}>{fmt(1500.00)}</td>
                  <td style={{ padding: '1rem 1.5rem' }}><StatusBadge status="pendente" /></td>
                  <td style={{ padding: '1rem 1.5rem', display: 'flex', gap: '0.5rem' }}>
                    <button style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)', padding: '0.45rem 0.9rem', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}>Aprovar</button>
                    <button style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '0.45rem 0.9rem', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}>Rejeitar</button>
                  </td>
                </tr>
              </tbody>
           </table>
           <div style={{ padding: '1rem', borderTop: '1px solid #22242c' }}>
             <button style={{ background: 'transparent', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)', padding: '0.5rem 1rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' }}>Processar Manualmente</button>
           </div>
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
