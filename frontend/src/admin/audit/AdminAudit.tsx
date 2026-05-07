import React from 'react';
import type { DashboardData } from '../types';
import { SectionHeader, Card } from '../AdminComponents';
import { History, Copy } from 'lucide-react';

export function AdminAudit({ data, showToast, askConfirm }: { data: DashboardData, showToast: any, askConfirm: any }) {
  return (
    <div>
      <SectionHeader icon={<History size={22} />} title="Auditoria (OBRIGATÓRIO)" sub="Registro estrito de Logs de Admin para compliance e evitar fraudes internas." />
      <Card>
        <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', marginBottom: '1.5rem' }}>Logs de admin</h3>
        <ul style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', paddingLeft: '1.2rem', marginBottom: '2rem' }}>
          <li>Quem alterou saldo</li>
          <li>Quem bloqueou usuário</li>
          <li>Quem aprovou saque</li>
        </ul>

        <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>Exemplo de log:</h3>
        <div style={{ background: '#0b0c10', border: '1px solid #22242c', borderRadius: 12, padding: '1.5rem', position: 'relative' }}>
          <pre style={{ margin: 0, color: '#a78bfa', fontSize: '0.85rem', fontFamily: 'monospace', lineHeight: 1.6 }}>
{`ADMIN_ID: 123
AÇÃO: BLOQUEOU_USUARIO
USER_ID: 999
DATA: 2026-04-15`}
          </pre>
          <Copy size={16} color="#6b7280" style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', cursor: 'pointer' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', color: '#f59e0b', fontSize: '0.8rem', fontWeight: 600 }}>
          <span>👉 Sem isso, você perde controle total.</span>
        </div>
      </Card>
    </div>
  );
}
