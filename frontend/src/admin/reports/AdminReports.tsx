import type { DashboardData } from '../types';
import { SectionHeader, Card } from '../AdminComponents';
import { PieChart, Download } from 'lucide-react';

export function AdminReports({ data, showToast, askConfirm }: { data: DashboardData, showToast: any, askConfirm: any }) {
  return (
    <div>
      <SectionHeader icon={<PieChart size={22} />} title="Relatórios Analíticos" sub="Geração unificada de dados de negócio." />
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          <div>
            <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', marginBottom: '1.5rem' }}>Critérios Disponíveis</h3>
            <ul style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', paddingLeft: '1.2rem' }}>
              <li>Volume financeiro por usuário</li>
              <li>Receita retida por cliente</li>
              <li>Taxa histórica de fraude</li>
              <li>Percentual de Chargeback (Cartões)</li>
            </ul>
          </div>
          <div style={{ borderLeft: '1px solid #22242c', paddingLeft: '2rem' }}>
             <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', marginBottom: '1.5rem' }}>Exportação</h3>
             <ul style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', paddingLeft: '1.2rem', marginBottom: '1.5rem' }}>
               <li>Para CSV</li>
               <li>Para padrão Excel (.xlsx)</li>
             </ul>
             <button style={{ background: '#8942FC', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, cursor: 'pointer' }}>
               <Download size={16} /> Exportar Relatório Master
             </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
