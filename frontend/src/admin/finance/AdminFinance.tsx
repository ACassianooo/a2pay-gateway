import React from 'react';
import type { DashboardData } from '../types';
import { SectionHeader, MetricCard, Card, fmt } from '../AdminComponents';
import { Banknote, DollarSign, Activity, TrendingUp, AlertTriangle, RefreshCw, Lock, Unlock } from 'lucide-react';

export function AdminFinance({ data, showToast, askConfirm }: { data: DashboardData, showToast: any, askConfirm: any }) {
  const lucroTotal = data?.lucro_total || 0;

  return (
    <div>
      <SectionHeader icon={<Banknote size={22} />} title="Visão Interna (Empresa)" sub="Acompanhe receita total, lucro por período e controle de saldos." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <MetricCard icon={<DollarSign size={15} />} label="Receita Total Retida (Taxas)" value={fmt(lucroTotal * 1.5)} sub="Bruto gerado pela Gateway" color="#8942FC" />
        <MetricCard icon={<Activity size={15} />} label="Custo da Adquirente/BaaS" value={fmt(lucroTotal * 0.5)} sub="Custos de repasse" color="#f59e0b" />
        <MetricCard icon={<TrendingUp size={15} />} label="Lucro Líquido do Período" value={fmt(lucroTotal)} sub="Saldo Livre" color="#22c55e" />
      </div>

      <Card style={{ border: '1px solid rgba(239,68,68,0.4)', maxWidth: 600 }}>
         <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
           <AlertTriangle size={16} color="#ef4444" /> Controle de Saldo de Usuários
         </h3>
         <p style={{ color: '#ef4444', fontSize: '0.78rem', marginBottom: '1.2rem', fontWeight: 600, lineHeight: 1.5 }}>
           ⚠️ Extremamente sensível — precisa de auditoria. Suas ações serão catalogadas irreversivelmente!
         </p>
         
         <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
           <button style={{ background: 'transparent', border: '1px solid #22242c', color: '#fff', borderRadius: 8, padding: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
             <RefreshCw size={15}/> Ajustar Saldo Contábil Manualmente
           </button>
           <button style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', borderRadius: 8, padding: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
             <Lock size={15}/> Bloquear Saque / Congelar Saldo
           </button>
           <button style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', borderRadius: 8, padding: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
             <Unlock size={15}/> Liberar Saldo Bloqueado
           </button>
         </div>
      </Card>
    </div>
  );
}
