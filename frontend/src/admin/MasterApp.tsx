import React, { useState } from 'react';
import type { DashboardData } from './types';
import { 
  LayoutDashboard, Users, List, Banknote, ShieldAlert, History, Download, Zap, Lock 
} from 'lucide-react';

// Import Tabs
import { AdminOverview } from './dashboard/AdminOverview';
import { AdminUsers } from './users/AdminUsers';
import { AdminTransactions } from './transactions/AdminTransactions';
import { AdminWithdrawals } from './withdrawals/AdminWithdrawals';
import { AdminFinance } from './finance/AdminFinance';
import { AdminFraud } from './fraud/AdminFraud';
import { AdminReports } from './reports/AdminReports';
import { AdminIntegrations } from './integrations/AdminIntegrations';
import { AdminAudit } from './audit/AdminAudit';
import { AdminAccessControl } from './settings/AdminAccessControl';

export function MasterApp({ data }: { data: DashboardData }) {
  const [activeTab, setActiveTab] = useState<string>('overview');

  const tabs = [
    { id: 'overview', icon: <LayoutDashboard size={14} />, label: 'Visão Global' },
    { id: 'users',    icon: <Users size={14} />,           label: 'Comunidade (Lojistas)' },
    { id: 'transactions', icon: <List size={14} />,        label: 'Transações CORE' },
    { id: 'finance',  icon: <Banknote size={14} />,        label: 'Financeiro Banco' },
    { id: 'withdrawals', icon: <Download size={14} />,     label: 'Saques Cashouts' },
    { id: 'fraud',    icon: <ShieldAlert size={14} />,     label: 'Anti-Fraude Risco' },
    { id: 'audit',    icon: <History size={14} />,         label: 'Auditoria de Logs' },
    { id: 'integrations', icon: <Zap size={14} />,         label: 'Integrações Externas' },
    { id: 'reports',  icon: <LayoutDashboard size={14} />, label: 'Relatórios Master' }, // LayoutDashboard reusado (piechart ideal)
    { id: 'access',   icon: <Lock size={14} />,            label: 'Governança e Roles' },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Scrollable menu tabs */}
      <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '2rem', background: '#13151a', borderRadius: 12, padding: '0.4rem', border: '1px solid #22242c', overflowX: 'auto', flexWrap: 'nowrap' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 0.9rem', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem', transition: 'all .2s', whiteSpace: 'nowrap', flexShrink: 0,
              background: activeTab === tab.id ? '#8942FC' : 'transparent',
              color: activeTab === tab.id ? '#fff' : '#94a3b8',
              boxShadow: activeTab === tab.id ? '0 2px 12px rgba(137,66,252,0.35)' : 'none',
            }}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <AdminOverview data={data} />}
      {activeTab === 'users'    && <AdminUsers data={data} />}
      {activeTab === 'transactions' && <AdminTransactions data={data} />}
      {activeTab === 'finance'  && <AdminFinance data={data} />}
      {activeTab === 'withdrawals' && <AdminWithdrawals data={data} />}
      {activeTab === 'fraud'    && <AdminFraud data={data} />}
      {activeTab === 'audit'    && <AdminAudit data={data} />}
      {activeTab === 'integrations' && <AdminIntegrations data={data} />}
      {activeTab === 'reports'  && <AdminReports data={data} />}
      {activeTab === 'access'   && <AdminAccessControl data={data} />}
    </div>
  );
}
