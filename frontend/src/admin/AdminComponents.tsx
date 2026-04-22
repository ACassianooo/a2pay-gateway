import React from 'react';

export const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export function SectionHeader({ icon, title, sub }: { icon: React.ReactNode, title: string, sub: string }) {
  return (
    <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
      <div style={{ background: '#8942FC', color: '#fff', padding: '0.8rem', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(137,66,252,0.2)' }}>
        {icon}
      </div>
      <div>
        <h2 style={{ color: '#111827', margin: 0, fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{title}</h2>
        <p style={{ color: '#64748b', margin: '0.3rem 0 0', fontSize: '0.9rem' }}>{sub}</p>
      </div>
    </div>
  );
}

export function MetricCard({ icon, label, value, sub, color }: { icon: React.ReactNode, label: string, value: string, sub?: string, color: string }) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '1.5rem', transition: 'all 0.2s', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.04)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
        <div style={{ background: `${color}15`, color: color, padding: '0.4rem', borderRadius: 8, display: 'flex' }}>
          {icon}
        </div>
        <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ color: '#111827', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em' }}>{value}</div>
      {sub && <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 500 }}>{sub}</div>}
    </div>
  );
}

export function Card({ children, style }: { children: React.ReactNode, style?: React.CSSProperties }) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', ...style }}>
      {children}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string, text: string, label: string }> = {
    'pago': { bg: 'rgba(34,197,94,0.1)', text: '#15803d', label: 'Aprovado' },
    'pendente': { bg: 'rgba(245,158,11,0.1)', text: '#b45309', label: 'Pendente' },
    'aguardando_pix': { bg: 'rgba(99,102,241,0.1)', text: '#4338ca', label: 'Aguardando PIX' },
    'bloqueado': { bg: 'rgba(239,68,68,0.1)', text: '#b91c1c', label: 'Recusado/Fraude' }
  };
  const sc = map[status] || map.pendente;
  return (
    <span style={{ background: sc.bg, color: sc.text, padding: '0.3rem 0.8rem', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
      {sc.label}
    </span>
  );
}
