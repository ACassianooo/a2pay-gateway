import type { DashboardData } from '../types';
import { SectionHeader, Card } from '../AdminComponents';
import { ShieldAlert, Activity, Globe, AlertTriangle } from 'lucide-react';

export function AdminFraud({ data, showToast, askConfirm }: { data: DashboardData, showToast: any, askConfirm: any }) {
  return (
    <div>
      <SectionHeader icon={<ShieldAlert size={22} />} title="Antifraude (Núcleo de Risco)" sub="Ferramentas globais de proteção e análise comportamental em tempo real." />
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
         <Card>
           <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
             <Activity size={16} color="#ef4444" /> Transações com Score Suspeito
           </h3>
           <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.05)', border: '1px dashed rgba(239,68,68,0.3)', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>Alerta de Transações com score alto</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ color: '#ef4444', fontWeight: 800, fontSize: '1.2rem' }}>RISCO MÁX</span>
              </div>
           </div>
           
           <h4 style={{ color: '#fff', marginTop: '1.8rem', marginBottom: '1rem', fontSize: '0.88rem' }}>Ferramentas & Ações Globais</h4>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', background: '#0b0c10', border: '1px solid #22242c', padding: '1rem 1.2rem', borderRadius: 8, alignItems: 'center' }}>
               <div><div style={{ color: '#fff', fontSize: '0.88rem', fontWeight: 700 }}>Lista Negra (The Blacklist)</div></div>
               <button style={{ background: '#22242c', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Aprovar / Bloquear transações</button>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', background: '#0b0c10', border: '1px solid #22242c', padding: '1rem 1.2rem', borderRadius: 8, alignItems: 'center' }}>
               <div><div style={{ color: '#fff', fontSize: '0.88rem', fontWeight: 700 }}>Bloquear usuário automaticamente</div></div>
               <input type="checkbox" defaultChecked style={{ scale: '1.3' }} />
             </div>
           </div>
         </Card>
         <Card>
           <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>Dados Analisados</h3>
           <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
             <li style={{ display: 'flex', gap: '1rem', alignItems: 'center', borderBottom: '1px solid #1a1c24', paddingBottom: '1rem' }}>
               <Globe size={20} color="#6366f1" /><div><div style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 700 }}>IP e Localização</div></div>
             </li>
             <li style={{ display: 'flex', gap: '1rem', alignItems: 'center', borderBottom: '1px solid #1a1c24', paddingBottom: '1rem' }}>
               <Activity size={20} color="#22c55e" /><div><div style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 700 }}>Device Fingerprint</div></div>
             </li>
             <li style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
               <AlertTriangle size={20} color="#f59e0b" /><div><div style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 700 }}>Padrão de comportamento</div></div>
             </li>
           </ul>
         </Card>
      </div>
    </div>
  );
}
