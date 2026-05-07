import React, { useState } from 'react';
import type { DashboardData, EmpresaInfo } from '../types';
import { SectionHeader, MetricCard, Card, fmt } from '../AdminComponents';
import { User, Lock, AlertTriangle, Activity, DollarSign, ShieldAlert } from 'lucide-react';

import { API_BASE_URL } from '../../api';

export function AdminUsers({ data, showToast, askConfirm }: { data: DashboardData, showToast: any, askConfirm: any }) {
  const [selectedUser, setSelectedUser] = useState<EmpresaInfo | any | null>(null);
  const [users, setUsers] = useState<any[]>([]);

  React.useEffect(() => {
    const rootApi = API_BASE_URL;
    const tk = localStorage.getItem('token');
    fetch(`${rootApi}/api/admin/users`, { headers: { Authorization: `Bearer ${tk}` } })
      .then(res => res.json())
      .then(d => setUsers(d || []))
      .catch(console.error);
  }, []);

  if (selectedUser) {
    return (
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', cursor: 'pointer', color: '#a78bfa', background: 'rgba(167,139,250,0.1)', padding: '0.4rem 0.8rem', borderRadius: 8, fontWeight: 700, fontSize: '0.8rem' }} onClick={() => setSelectedUser(null)}>
          <span style={{ fontSize: '1rem' }}>←</span> Voltar para Usuários
        </div>
        <SectionHeader icon={<User size={22} />} title={`Visão Detalhada: ${selectedUser.nome}`} sub={`Gerencie o saldo, veja logs e aplique ações administrativas rígidas.`} />
        
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <MetricCard icon={<Activity size={15} />} label="Volume Processado" value={fmt(selectedUser.volume_girado)} color="#8942FC" />
              <MetricCard icon={<DollarSign size={15} />} label="Saldo na Conta" value={fmt(selectedUser.volume_girado * 0.15)} color="#22c55e" />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Card>
               <h3 style={{ color: '#111827', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                 <ShieldAlert size={16} color="#ef4444" /> Ações Punitivas / Preventivas
               </h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                 <button style={{ background: 'transparent', border: '1px solid #e5e7eb', color: '#f59e0b', borderRadius: 8, padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                   <AlertTriangle size={16} /> Marcar Conta como Suspeita
                 </button>
                 <div style={{ height: 1, background: '#f1f5f9', margin: '0.5rem 0' }} />
                 <button style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: 8, padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
                   <Lock size={16} /> Aplicar Bloqueio (Congelar Saldo)
                 </button>
               </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
       <SectionHeader icon={<Users size={22} />} title="Gestão de Usuários" sub="Controle, monitore e faça a gestão integral dos usuários integrados no A2Pay." />
       <Card style={{ padding: 0, overflow: 'hidden' }}>
         <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <h3 style={{ color: '#111827', fontWeight: 700, fontSize: '0.95rem' }}>Critério da Lista (Diretório)</h3>
         </div>
         <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
           <thead>
             <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
               {['ID', 'Nome', 'Volume Giro', 'Status', 'Ações'].map(h => (
                 <th key={h} style={{ padding: '0.8rem 1.5rem', textAlign: 'left', color: '#94a3b8', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>{h}</th>
               ))}
             </tr>
           </thead>
           <tbody>
              {users.length === 0 && (
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td colSpan={5} style={{ padding: '1rem 1.5rem', textAlign: 'center', color: '#6b7280' }}>Buscando lojistas na base global...</td>
                </tr>
              )}
               {users.map((e, i) => (
                <tr key={e.id || i} style={{ borderBottom: '1px solid #f8fafc' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '1rem 1.5rem', color: '#6b7280' }}>ID-{e.id || (842 + i)}</td>
                  <td style={{ padding: '1rem 1.5rem', color: '#111827', fontWeight: 700 }}>{e.nome || e.name}</td>
                  <td style={{ padding: '1rem 1.5rem', color: '#111827', fontWeight: 600 }}>{fmt(e.volume_girado || e.volume || 0)}</td>
                  <td style={{ padding: '1rem 1.5rem' }}><span style={{ color: '#22c55e', fontSize: '0.75rem', fontWeight: 600 }}>{e.status || 'ATIVO'}</span></td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                     <button onClick={() => setSelectedUser(e)} style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', padding: '0.45rem 1rem', borderRadius: 6, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>Detalhes</button>
                  </td>
                </tr>
              ))}
            </tbody>
         </table>
       </Card>
    </div>
  );
}

// Dummy icon for lazy import
function Users({size}:any){return <User size={size}/>}
