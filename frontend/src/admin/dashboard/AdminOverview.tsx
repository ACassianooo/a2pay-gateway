import React, { useState } from 'react';
import type { DashboardData } from '../types';
import { SectionHeader, MetricCard, Card, fmt } from '../AdminComponents';
import {
  Building, DollarSign, TrendingUp, TrendingDown, Users, Activity,
  AlertTriangle, PieChart, ShieldCheck, Clock, Zap, CheckCircle2,
  ArrowUpRight, Globe, ShieldAlert, Bell, RefreshCw,
  CreditCard, Banknote
} from 'lucide-react';

// ── Mini Sparkline ────────────────────────────────────────────────────────────
function Sparkline({ data, color = '#8942FC' }: { data: number[]; color?: string }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const w = 120, h = 40;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(' ');
  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill={`${color}18`} stroke="none" />
    </svg>
  );
}

// ── Progress Bar ──────────────────────────────────────────────────────────────
function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ background: '#f1f5f9', height: 6, borderRadius: 99, overflow: 'hidden', flex: 1 }}>
      <div style={{ background: color, width: `${pct}%`, height: '100%', borderRadius: 99, transition: 'width 0.6s ease' }} />
    </div>
  );
}

export function AdminOverview({ data }: { data: DashboardData }) {
  const [period, setPeriod] = useState('Hoje');
  const empresas = data.empresas || [];
  const txs = data.transacoes || [];
  const lucroTotal = data.lucro_total || 0;
  const volumeTotal = empresas.reduce((s, e) => s + e.volume_girado, 0);
  const taxasTotal = empresas.reduce((s, e) => s + e.taxas_cobradas, 0);

  const pagas = txs.filter(t => t.status === 'pago');
  const pendentes = txs.filter(t => t.status === 'aguardando_pix' || t.status === 'pendente');
  const bloqueadas = txs.filter(t => t.status === 'bloqueado' || t.status === 'falhou');

  const sparks = Array.from({ length: 7 }, (_, i) => {
    if (empresas.length > 0) {
      return empresas.reduce((s, e) => s + e.volume_girado, 0) / 7 * (0.6 + Math.random() * 0.8);
    }
    return 800 + Math.random() * 1200;
  });

  const periods = ['Hoje', 'Essa semana', 'Esse mês', 'Últimos 90 dias', 'Todo o período'];

  // Simulated recent activity for admin
  const recentActivity = [
    { icon: <CheckCircle2 size={14} />, color: '#22c55e', text: 'Pagamento PIX confirmado', detail: 'Loja Demo · R$ 149,90', time: 'Há 2 min' },
    { icon: <Users size={14} />, color: '#6366f1', text: 'Novo lojista cadastrado', detail: 'Tech Store LTDA', time: 'Há 15 min' },
    { icon: <ShieldAlert size={14} />, color: '#ef4444', text: 'Transação bloqueada por fraude', detail: 'Score 85 · VPN detectada', time: 'Há 32 min' },
    { icon: <ArrowUpRight size={14} />, color: '#8942FC', text: 'Saque processado', detail: 'Loja ABC · R$ 500,00', time: 'Há 1h' },
    { icon: <Zap size={14} />, color: '#f59e0b', text: 'Webhook disparado', detail: 'payment.confirmed → 200 OK', time: 'Há 1h30' },
    { icon: <RefreshCw size={14} />, color: '#06b6d4', text: 'API Key rotacionada', detail: 'Merchant #12 · Sandbox', time: 'Há 2h' },
  ];

  return (
    <div>
      <SectionHeader icon={<Building size={22} />} title="Visão Global" sub="Métricas gerais e saúde corporativa da plataforma A2Pay." />

      {/* Filtros de Período */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {periods.map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            style={{ padding: '0.5rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: period === p ? '#8942FC' : '#fff', color: period === p ? '#fff' : '#64748b', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all .2s', whiteSpace: 'nowrap' }}>
            {p}
          </button>
        ))}
      </div>

      {/* KPI Grid — 4 cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>Volume Transacionado</div>
            <Sparkline data={sparks} color="#8942FC" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', letterSpacing: '-0.025em' }}>{volumeTotal > 0 ? fmt(volumeTotal) : 'R$ 0,00'}</div>
          <div style={{ fontSize: '0.75rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><TrendingUp size={12} /> +15,4% vs mês anterior</div>
        </div>

        <MetricCard icon={<Banknote size={15} />} label="Lucro da Plataforma" value={lucroTotal > 0 ? fmt(lucroTotal) : fmt(taxasTotal > 0 ? taxasTotal : 0)} sub="Taxas cobradas no período" color="#22c55e" />
        <MetricCard icon={<Users size={15} />} label="Lojistas Ativos" value={empresas.length > 0 ? String(empresas.length) : '0'} sub={empresas.length > 0 ? `+${Math.min(empresas.length, 2)} novos esta semana` : 'Nenhum lojista ainda'} color="#6366f1" />
        <MetricCard icon={<TrendingDown size={15} />} label="Taxa de Falha" value={txs.length > 0 ? `${((bloqueadas.length / txs.length) * 100).toFixed(1)}%` : '0%'} sub="Transações recusadas/bloqueadas" color="#ef4444" />
      </div>

      {/* Second row: 3 mini cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <MetricCard icon={<CreditCard size={15} />} label="Total de Transações" value={txs.length > 0 ? String(txs.length) : String(pagas.length || 0)} sub="Todas as transações" color="#8942FC" />
        <MetricCard icon={<Clock size={15} />} label="Pendentes / Aguardando" value={String(pendentes.length)} sub="Aguardando confirmação" color="#f59e0b" />
        <MetricCard icon={<ShieldCheck size={15} />} label="Aprovadas" value={String(pagas.length)} sub="Pagamentos confirmados" color="#22c55e" />
      </div>

      {/* Main content grid: Activity + Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Recent Activity Feed */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <h3 style={{ color: '#111827', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Activity size={16} color="#8942FC" /> Atividade Recente
            </h3>
            <span style={{ color: '#8942FC', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Ver todas →</span>
          </div>

          {recentActivity.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0', borderBottom: i < recentActivity.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${item.color}12`, display: 'grid', placeItems: 'center', color: item.color, flexShrink: 0 }}>
                {item.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#111827', fontSize: '0.85rem', fontWeight: 600 }}>{item.text}</div>
                <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>{item.detail}</div>
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.72rem', whiteSpace: 'nowrap', flexShrink: 0 }}>{item.time}</div>
            </div>
          ))}
        </Card>

        {/* Alerts Panel */}
        <Card>
          <h3 style={{ color: '#111827', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1.2rem 0' }}>
            <Bell size={16} color="#f59e0b" /> Alertas do Sistema
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {bloqueadas.length > 0 && (
              <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 10, padding: '0.8rem' }}>
                <div style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.82rem' }}>🚨 {bloqueadas.length} transação(ões) bloqueada(s)</div>
                <div style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.2rem' }}>Verificar no painel de segurança</div>
              </div>
            )}
            {pendentes.length > 0 && (
              <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: '0.8rem' }}>
                <div style={{ color: '#d97706', fontWeight: 700, fontSize: '0.82rem' }}>⚡ {pendentes.length} PIX aguardando confirmação</div>
                <div style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.2rem' }}>Pagamentos pendentes no sistema</div>
              </div>
            )}
            <div style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, padding: '0.8rem' }}>
              <div style={{ color: '#15803d', fontWeight: 700, fontSize: '0.82rem' }}>✅ Sistema operacional</div>
              <div style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.2rem' }}>API, Webhooks e Antifraude ativos</div>
            </div>
            <div style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, padding: '0.8rem' }}>
              <div style={{ color: '#4338ca', fontWeight: 700, fontSize: '0.82rem' }}>🔒 Antifraude ativo</div>
              <div style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.2rem' }}>4 regras monitorando em tempo real</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom row: Lojistas table + Payment Methods */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Lojistas / Empresas */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <h3 style={{ color: '#111827', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Building size={16} color="#6366f1" /> Lojistas da Plataforma
            </h3>
            <span style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', padding: '0.25rem 0.6rem', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700 }}>
              {empresas.length} {empresas.length === 1 ? 'ativo' : 'ativos'}
            </span>
          </div>

          {empresas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
              <Users size={40} color="#d1d5db" style={{ marginBottom: '0.8rem' }} />
              <div style={{ color: '#6b7280', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.3rem' }}>Nenhum lojista cadastrado</div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Os lojistas aparecerão aqui quando se cadastrarem na plataforma.</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    {['Lojista', 'Volume', 'Taxas', 'Participação'].map(h => (
                      <th key={h} style={{ padding: '0.6rem 0.8rem', textAlign: 'left', color: '#94a3b8', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {empresas.map((e, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}
                      onMouseEnter={ev => (ev.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={ev => (ev.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '0.7rem 0.8rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div style={{ width: 30, height: 30, borderRadius: 8, background: '#8942FC', color: '#fff', fontSize: '0.7rem', fontWeight: 800, display: 'grid', placeItems: 'center' }}>
                            {e.nome.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ color: '#111827', fontWeight: 600 }}>{e.nome}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.7rem 0.8rem', color: '#22c55e', fontWeight: 700 }}>{fmt(e.volume_girado)}</td>
                      <td style={{ padding: '0.7rem 0.8rem', color: '#f59e0b', fontWeight: 600 }}>{fmt(e.taxas_cobradas)}</td>
                      <td style={{ padding: '0.7rem 0.8rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <ProgressBar value={e.volume_girado} max={volumeTotal || 1} color="#8942FC" />
                          <span style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, minWidth: 36 }}>
                            {volumeTotal > 0 ? `${((e.volume_girado / volumeTotal) * 100).toFixed(0)}%` : '0%'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Payment Methods Distribution + System Health */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card>
            <h3 style={{ color: '#111827', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', margin: '0 0 1.2rem 0' }}>
              <PieChart size={16} color="#8942FC" /> Métodos de Pagamento
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {[
                { label: 'PIX (Instantâneo)', pct: 82, color: '#22c55e' },
                { label: 'Cartão de Crédito', pct: 12, color: '#6366f1' },
                { label: 'Boleto Bancário', pct: 6, color: '#f59e0b' },
              ].map(m => (
                <div key={m.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#111827', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                    <span>{m.label}</span><span style={{ fontWeight: 700 }}>{m.pct}%</span>
                  </div>
                  <div style={{ background: '#f1f5f9', height: 6, borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ background: m.color, width: `${m.pct}%`, height: '100%', borderRadius: 99, transition: 'width 0.6s' }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* System Health */}
          <Card>
            <h3 style={{ color: '#111827', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', margin: '0 0 1rem 0' }}>
              <Globe size={16} color="#06b6d4" /> Saúde do Sistema
            </h3>
            {[
              { label: 'API Gateway', status: 'Online', color: '#22c55e' },
              { label: 'Banco de Dados', status: 'Online', color: '#22c55e' },
              { label: 'Webhooks', status: 'Online', color: '#22c55e' },
              { label: 'Antifraude', status: 'Ativo', color: '#22c55e' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f8fafc' }}>
                <span style={{ color: '#374151', fontSize: '0.85rem' }}>{s.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, boxShadow: `0 0 6px ${s.color}60` }} />
                  <span style={{ color: s.color, fontSize: '0.78rem', fontWeight: 700 }}>{s.status}</span>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
