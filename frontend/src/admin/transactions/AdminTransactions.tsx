import React from 'react';
import type { DashboardData } from '../types';
import { SectionHeader, Card, fmt, StatusBadge } from '../AdminComponents';
import { List, Zap, XCircle, RotateCcw, Download, Lock } from 'lucide-react';

export function AdminTransactions({ data }: { data: DashboardData }) {
  return (
    <div>
      <SectionHeader icon={<List size={22} />} title="Controle de Transações (CORE)" sub="Monitore, filtre e aja sobre o registro global de transações." />
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
           <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid #22242c', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <h3 style={{ color: '#fff', fontWeight: 700 }}>Explorador Global</h3>
           </div>
           <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                 <tr style={{ background: '#0b0c10', borderBottom: '1px solid #22242c' }}>
                   {['Lojista', 'Valor', 'Status', 'Ações'].map(h => <th key={h} style={{ padding: '0.8rem 1.5rem', textAlign: 'left', color: '#6b7280' }}>{h}</th>)}
                 </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #1a1c24' }}>
                  <td style={{ padding: '1rem 1.5rem', color: '#fff' }}>Space Store</td>
                  <td style={{ padding: '1rem 1.5rem', color: '#fff' }}>{fmt(199.9)}</td>
                  <td style={{ padding: '1rem 1.5rem' }}><StatusBadge status="pago" /></td>
                  <td style={{ padding: '1rem 1.5rem' }}><button style={{ background: '#22242c', color: '#fff', border: 'none', padding: '0.4rem', borderRadius: 6 }}>Detalhes</button></td>
                </tr>
              </tbody>
           </table>
        </Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           <Card>
             <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', gap: '0.5rem' }}><Zap size={16} color="#8942FC" /> Ações Rápidas (API)</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
               <button style={{ background: 'transparent', border: '1px solid #22242c', color: '#ef4444', borderRadius: 6, padding: '0.75rem', cursor: 'pointer' }}> Cancelar Pagamento</button>
               <button style={{ background: 'transparent', border: '1px solid #22242c', color: '#22c55e', borderRadius: 6, padding: '0.75rem', cursor: 'pointer' }}> Forçar Reprocessamento</button>
               <button style={{ background: 'transparent', border: '1px solid #22242c', color: '#f59e0b', borderRadius: 6, padding: '0.75rem', cursor: 'pointer' }}> Estornar (Refund Lojista)</button>
             </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
