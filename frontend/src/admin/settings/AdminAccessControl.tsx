import type { DashboardData } from '../types';
import { SectionHeader, Card } from '../AdminComponents';
import { Lock, ShieldAlert, FileText, Banknote } from 'lucide-react';

export function AdminAccessControl({ data, showToast, askConfirm }: { data: DashboardData, showToast: any, askConfirm: any }) {
  return (
    <div>
      <SectionHeader icon={<Lock size={22} />} title="Controle de Acesso (ADMIN)" sub="Arquitetura de Roles: Nem todo administrador pode tudo." />
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
          <div>
            <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', marginBottom: '1.2rem' }}>Níveis Disponíveis (Roles)</h3>
            <ul style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', paddingLeft: '1.2rem' }}>
              <li><strong>[MASTER]</strong> Super Admin</li>
              <li><strong>[FIN]</strong> Financeiro (Cx, Saques)</li>
              <li><strong>[SUP]</strong> Suporte N1 e N2</li>
              <li><strong>[RSK]</strong> Controle de Risco / AML</li>
            </ul>
          </div>
          <div style={{ borderLeft: '1px solid #22242c', paddingLeft: '2rem' }}>
            <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', marginBottom: '1.2rem' }}>Exemplo de Implementação Restrita</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#0b0c10', padding: '1rem', borderRadius: 8, border: '1px solid #22242c' }}>
                  <FileText color="#a78bfa" size={18} />
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>Role: SUPORTE</div>
                    <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>Visualiza o usuário, reseta senhas, não mexe em saldo.</div>
                  </div>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#0b0c10', padding: '1rem', borderRadius: 8, border: '1px solid #22242c' }}>
                  <Banknote color="#22c55e" size={18} />
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>Role: FINANCEIRO</div>
                    <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>Auditoria contábil, aprovação de saques manuais e estornos financeiros.</div>
                  </div>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#0b0c10', padding: '1rem', borderRadius: 8, border: '1px solid #22242c' }}>
                  <ShieldAlert color="#ef4444" size={18} />
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>Role: RISCO</div>
                    <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>Bane lojistas (The Blacklist), injeta locks de AML, bloqueia transações suspeitas.</div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
