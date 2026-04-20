import React from 'react';
import type { DashboardData } from '../types';
import { SectionHeader, MetricCard, Card, fmt } from '../AdminComponents';
import { Building, DollarSign, TrendingUp, Users, TrendingDown, Activity, AlertTriangle, PieChart } from 'lucide-react';

export function AdminOverview({ data }: { data: DashboardData }) {
  const empresas = data.empresas || [];
  const volumeTotal = empresas.reduce((s, e) => s + e.volume_girado, 0);

  return (
    <div>
      <SectionHeader icon={<Building size={22} />} title="Visão Global" sub="Métricas gerais e saúde corporativa da plataforma." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <MetricCard icon={<DollarSign size={15} />} label="Volume (Transacionado)" value={fmt(volumeTotal)} sub="Em milhões (Mês atual)" color="#8942FC" />
        <MetricCard icon={<TrendingUp size={15} />} label="Crescimento (m/m)" value="+15,4%" sub="Comparado ao mês anterior" color="#22c55e" />
        <MetricCard icon={<Users size={15} />} label="Lojistas Ativos" value={String(empresas.length)} sub="+2 novos esta semana" color="#6366f1" />
        <MetricCard icon={<TrendingDown size={15} />} label="Taxa de Falha" value="1.2%" sub="Abaixo da média de risco" color="#ef4444" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
         <Card>
           <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
             <Activity size={16} color="#f59e0b" /> Transações Suspeitas (Alerta do Sistema)
           </h3>
           <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div>
               <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><AlertTriangle size={15} /> Pico de Rejeições - AntiFraude</div>
               <div style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '0.4rem' }}>A conta "Minha Loja Demo" teve múltiplos bloqueios por Proxy VPN nos últimos 15 min.</div>
             </div>
             <button style={{ background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 8, padding: '0.6rem 1.2rem', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>Auditar</button>
           </div>
         </Card>
         <Card>
           <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
             <PieChart size={16} color="#8942FC" /> Métodos de Pagamento
           </h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
             <div>
               <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '0.85rem', marginBottom: '0.4rem' }}><span>PIX (Instantâneo)</span><span style={{ fontWeight: 700 }}>82%</span></div>
               <div style={{ background: '#22242c', height: 6, borderRadius: 99, overflow: 'hidden' }}><div style={{ background: '#22c55e', width: '82%', height: '100%', borderRadius: 99 }} /></div>
             </div>
             <div>
               <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '0.85rem', marginBottom: '0.4rem' }}><span>Cartão de Crédito</span><span style={{ fontWeight: 700 }}>15%</span></div>
               <div style={{ background: '#22242c', height: 6, borderRadius: 99, overflow: 'hidden' }}><div style={{ background: '#6366f1', width: '15%', height: '100%', borderRadius: 99 }} /></div>
             </div>
           </div>
         </Card>
      </div>
    </div>
  );
}
