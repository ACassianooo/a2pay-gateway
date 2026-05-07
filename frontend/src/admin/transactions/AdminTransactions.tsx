import type { DashboardData } from '../types';
import { SectionHeader, Card, fmt, StatusBadge } from '../AdminComponents';
import { List, Zap } from 'lucide-react';

export function AdminTransactions({ data, showToast, askConfirm }: { data: DashboardData, showToast: any, askConfirm: any }) {
  return (
    <div>
      <SectionHeader icon={<List size={22} />} title="Controle de Transações (CORE)" sub="Monitore, filtre e aja sobre o registro global de transações." />
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
           <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <h3 style={{ color: '#111827', fontWeight: 700, fontSize: '0.95rem' }}>Explorador Global</h3>
           </div>
           <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                 <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                   {['Lojista', 'Valor', 'Status', 'Ações'].map(h => <th key={h} style={{ padding: '0.8rem 1.5rem', textAlign: 'left', color: '#94a3b8', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>{h}</th>)}
                 </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem 1.5rem', color: '#111827', fontWeight: 600 }}>Space Store</td>
                  <td style={{ padding: '1rem 1.5rem', color: '#111827', fontWeight: 700 }}>{fmt(199.9)}</td>
                  <td style={{ padding: '1rem 1.5rem' }}><StatusBadge status="pago" /></td>
                  <td style={{ padding: '1rem 1.5rem' }}><button style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', padding: '0.45rem 1rem', borderRadius: 6, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>Detalhes</button></td>
                </tr>
              </tbody>
           </table>
        </Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           <Card>
             <h3 style={{ color: '#111827', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', gap: '0.5rem', fontSize: '0.95rem' }}><Zap size={16} color="#8942FC" /> Ações Rápidas (API)</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
               <button style={{ background: 'transparent', border: '1px solid #e5e7eb', color: '#ef4444', borderRadius: 8, padding: '0.75rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}> Cancelar Pagamento</button>
               <button style={{ background: 'transparent', border: '1px solid #e5e7eb', color: '#22c55e', borderRadius: 8, padding: '0.75rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}> Forçar Reprocessamento</button>
               <button style={{ background: 'transparent', border: '1px solid #e5e7eb', color: '#f59e0b', borderRadius: 8, padding: '0.75rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}> Estornar (Refund Lojista)</button>
             </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
