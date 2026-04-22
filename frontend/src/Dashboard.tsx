import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, DollarSign, CreditCard, ShieldAlert,
  Key, TrendingUp, AlertTriangle, CheckCircle2, Clock,
  XCircle, Copy, Check, RefreshCw, Eye, EyeOff, Code,
  Download, Filter, ArrowUpRight, Zap, Activity,
  Building, ChevronRight, Search, Ban, Globe,
  User, Settings, Upload, Bell, Webhook, BookOpen, Terminal,
  Users, Lock, Unlock, FileText, PieChart, TrendingDown, ArrowUp,
  List, RotateCcw, Banknote, History,
  LogOut, HelpCircle, ChevronDown, Monitor, Shield
} from 'lucide-react';
import { MasterApp } from './admin/MasterApp';
import { API_BASE_URL } from './api';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Transaction {
  id: number;
  item_name: string;
  valor_total: number;
  valor_liquido: number;
  status: string;
  metodo_pagamento: string;
  created_at: string;
}
interface EmpresaInfo { nome: string; volume_girado: number; taxas_cobradas: number; }
interface DashboardData {
  role: string;
  saldo_lojista?: number;
  transacoes?: Transaction[];
  lucro_total?: number;
  empresas?: EmpresaInfo[];
  is_sandbox?: boolean;
  error?: string; // Adicionado campo de erro
}
interface APIKeyData { 
  api_key: string; 
  api_key_test: string; 
  capabilities: string; 
  endpoint: string; 
  created_at: string; 
}

type Tab = 'overview' | 'financeiro' | 'pagamentos' | 'antifraude' | 'desenvolvedor' | 'conta';

const API = API_BASE_URL;
const token = () => localStorage.getItem('token') || '';
const fmt = (v: number) => `R$ ${v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
const fmtDate = (d: string) => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string; icon: JSX.Element; label: string }> = {
    pago:           { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   icon: <CheckCircle2 size={11} />, label: 'Pago' },
    aguardando_pix: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: <Clock size={11} />,        label: 'Aguardando' },
    pendente:       { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)',icon: <Clock size={11} />,         label: 'Pendente' },
    bloqueado:      { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   icon: <XCircle size={11} />,      label: 'Bloqueado' },
    falhou:         { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   icon: <XCircle size={11} />,      label: 'Falhou' },
  };
  const s = map[status] || map.pendente;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.6rem', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, background: s.bg, color: s.color, border: `1px solid ${s.color}30` }}>
      {s.icon}{s.label}
    </span>
  );
}

// ── Mini Sparkline Chart ──────────────────────────────────────────────────────
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

// ── Metric Card ───────────────────────────────────────────────────────────────
function MetricCard({ icon, label, value, sub, color = '#8942FC', spark }: {
  icon: JSX.Element; label: string; value: string; sub?: string; color?: string; spark?: number[];
}) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', transition: 'all .2s', cursor: 'default', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
        <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>{label}</div>
        {spark && <Sparkline data={spark} color={color} />}
      </div>
      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', letterSpacing: '-0.025em' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>{sub}</div>}
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ icon, title, sub }: { icon: JSX.Element; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: '1.8rem' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#111827', fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.3rem' }}>
        <span style={{ color: '#8942FC' }}>{icon}</span>{title}
      </h2>
      {sub && <p style={{ color: '#6b7280', fontSize: '0.88rem' }}>{sub}</p>}
    </div>
  );
}

// ── Card container ────────────────────────────────────────────────────────────
function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', ...style }}>
      {children}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: OVERVIEW
// ══════════════════════════════════════════════════════════════════════════════
function OverviewTab({ data }: { data: DashboardData }) {
  const [period, setPeriod] = useState('Hoje');
  const txs = data.transacoes || [];
  const pagas = txs.filter(t => t.status === 'pago');
  const pendentes = txs.filter(t => t.status === 'aguardando_pix' || t.status === 'pendente');
  const saldo = data.saldo_lojista || 0;
  const volume = pagas.reduce((s, t) => s + t.valor_total, 0);
  const taxas = pagas.reduce((s, t) => s + (t.valor_total - t.valor_liquido), 0);
  const saldoPendente = pendentes.reduce((s, t) => s + t.valor_liquido, 0);

  // Sparkline: volume últimos 7 "dias" simulado por posição das transações
  const sparks = Array.from({ length: 7 }, (_, i) => {
    const slice = txs.filter((_, j) => j % 7 === i && txs[j]?.status === 'pago');
    return slice.reduce((s, t) => s + t.valor_total, 0) || Math.random() * 200;
  });

  const recent = txs.slice(0, 5);
  const periods = ['Hoje', 'Esse mês', 'Últimos 30 dias', 'Últimos 90 dias', 'Todo o período', 'Personalizado'];

  return (
    <div>
      {/* Filtros de Período */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {periods.map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            style={{ padding: '0.5rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: period === p ? '#8942FC' : '#fff', color: period === p ? '#fff' : '#64748b', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all .2s', whiteSpace: 'nowrap' }}>
            {p}
          </button>
        ))}
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <MetricCard icon={<DollarSign size={15} />} label="Total em vendas" value={fmt(volume)} sub="Em relação ao período anterior" color="#8942FC" spark={sparks} />
        <MetricCard icon={<List size={15} />} label="Total de transações" value={String(pagas.length)} sub="Transações processadas" color="#8942FC" />
        <MetricCard icon={<Activity size={15} />} label="Ticket Médio" value={fmt(pagas.length > 0 ? volume / pagas.length : 0)} sub="Valor médio por venda" color="#8942FC" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Transações recentes */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <h3 style={{ color: '#111827', fontWeight: 700, fontSize: '0.95rem' }}>Transações Recentes</h3>
            <span style={{ color: '#8942FC', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Ver todas →</span>
          </div>
          {recent.length === 0 && <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>Nenhuma transação.</p>}
          {recent.map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f9fafb', display: 'grid', placeItems: 'center', color: '#8942FC' }}>
                  {t.metodo_pagamento === 'pix' ? <Zap size={16} /> : <CreditCard size={16} />}
                </div>
                <div>
                  <div style={{ color: '#111827', fontSize: '0.88rem', fontWeight: 600 }}>{t.item_name || 'Pagamento'}</div>
                  <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>#{t.id} · {fmtDate(t.created_at)}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#22c55e', fontWeight: 700, fontSize: '0.9rem' }}>{fmt(t.valor_liquido)}</div>
                <StatusBadge status={t.status} />
              </div>
            </div>
          ))}
        </Card>

        {/* Alertas */}
        <Card>
          <h3 style={{ color: '#111827', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={16} color="#f59e0b" /> Alertas
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {pendentes.length > 0 && (
              <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: '0.8rem' }}>
                <div style={{ color: '#d97706', fontWeight: 700, fontSize: '0.82rem' }}>⚡ {pendentes.length} PIX aguardando</div>
                <div style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.2rem' }}>Confirme no painel financeiro</div>
              </div>
            )}
            <div style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, padding: '0.8rem' }}>
              <div style={{ color: '#15803d', fontWeight: 700, fontSize: '0.82rem' }}>✅ Antifraude ativo</div>
              <div style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.2rem' }}>4 regras monitorando</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: FINANCEIRO
// ══════════════════════════════════════════════════════════════════════════════
function FinanceiroTab({ data }: { data: DashboardData }) {
  const txs = data.transacoes || [];
  const pagas = txs.filter(t => t.status === 'pago');
  const saldo = data.saldo_lojista || 0;
  const saldoBloqueado = txs.filter(t => t.status === 'aguardando_pix').reduce((s, t) => s + t.valor_liquido, 0);
  const [filterStatus, setFilterStatus] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [saqueModal, setSaqueModal] = useState(false);
  const [saqueValor, setSaqueValor] = useState('');
  const [saqueChave, setSaqueChave] = useState('');
  const [saqueOK, setSaqueOK] = useState(false);

  const filtered = txs.filter(t => {
    const matchStatus = filterStatus === 'todos' || t.status === filterStatus;
    const matchSearch = !searchTerm || t.item_name.toLowerCase().includes(searchTerm.toLowerCase()) || String(t.id).includes(searchTerm);
    return matchStatus && matchSearch;
  });

  const exportCSV = () => {
    const header = 'ID,Item,Valor Total,Valor Líquido,Taxa,Status,Método,Data';
    const rows = txs.map(t => `${t.id},"${t.item_name}",${t.valor_total},${t.valor_liquido},${(t.valor_total - t.valor_liquido).toFixed(2)},${t.status},${t.metodo_pagamento},${t.created_at}`);
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'extrato-a2pay.csv'; a.click();
  };

  return (
    <div>
      <SectionHeader icon={<DollarSign size={22} />} title="Financeiro" sub="Gerencie seu saldo, saque e extrato completo." />

      {/* Saldo Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <MetricCard icon={<DollarSign size={15} />} label="Saldo Disponível" value={fmt(saldo)} sub="Disponível para saque" color="#22c55e" />
        <MetricCard icon={<Ban size={15} />} label="Saldo Bloqueado" value={fmt(saldoBloqueado)} sub="Aguardando confirmação PIX" color="#f59e0b" />
        <MetricCard icon={<TrendingUp size={15} />} label="Total Recebido" value={fmt(pagas.reduce((s, t) => s + t.valor_liquido, 0))} sub={`${pagas.length} transações pagas`} color="#8942FC" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Solicitar Saque */}
        <Card>
          <h3 style={{ color: '#111827', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
            <ArrowUpRight size={18} color="#8942FC" /> Solicitar Saque (PIX)
          </h3>
          {saqueOK ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <CheckCircle2 size={48} color="#22c55e" style={{ marginBottom: '1rem' }} />
              <div style={{ color: '#22c55e', fontWeight: 700, fontSize: '1.1rem' }}>Solicitação enviada!</div>
              <div style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '0.5rem' }}>Processado em até 1 dia útil.</div>
              <button onClick={() => { setSaqueOK(false); setSaqueValor(''); setSaqueChave(''); }} style={{ marginTop: '1.5rem', background: '#8942FC', color: '#fff', border: 'none', borderRadius: 8, padding: '0.6rem 1.5rem', fontWeight: 700, cursor: 'pointer' }}>
                Novo Saque
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: '#6b7280', fontSize: '0.82rem', marginBottom: '0.4rem', fontWeight: 600 }}>VALOR (R$)</label>
                <input value={saqueValor} onChange={e => setSaqueValor(e.target.value)} type="number" placeholder="Ex: 100,00" style={{ width: '100%', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.7rem 1rem', color: '#111827', fontSize: '0.95rem', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#6b7280', fontSize: '0.82rem', marginBottom: '0.4rem', fontWeight: 600 }}>CHAVE PIX</label>
                <input value={saqueChave} onChange={e => setSaqueChave(e.target.value)} placeholder="CPF, email ou chave aleatória" style={{ width: '100%', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.7rem 1rem', color: '#111827', fontSize: '0.95rem', outline: 'none' }} />
              </div>
              <div style={{ background: 'rgba(137,66,252,0.05)', borderRadius: 8, padding: '0.7rem 1rem', fontSize: '0.82rem', color: '#8942FC', border: '1px solid rgba(137,66,252,0.1)' }}>
                Saldo disponível: <strong>{fmt(saldo)}</strong> · Taxa de saque: grátis
              </div>
              <button
                disabled={!saqueValor || !saqueChave || parseFloat(saqueValor) > saldo}
                onClick={() => setSaqueOK(true)}
                style={{ background: '#8942FC', color: '#fff', border: 'none', borderRadius: 10, padding: '0.8rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem', opacity: (!saqueValor || !saqueChave || parseFloat(saqueValor) > saldo) ? 0.5 : 1, transition: 'all .2s' }}>
                Solicitar Saque
              </button>
            </div>
          )}
        </Card>

        {/* Histórico de Saques */}
        <Card>
          <h3 style={{ color: '#111827', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
            <Activity size={18} color="#8942FC" /> Histórico de Saques
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[
              { valor: 250.00, status: 'pago', data: '14/04', chave: '***@email.com' },
              { valor: 100.00, status: 'pago', data: '10/04', chave: 'cpf: ***456' },
              { valor: 500.00, status: 'pendente', data: 'Hoje', chave: 'chave aleatória' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                <div>
                  <div style={{ color: '#111827', fontWeight: 700, fontSize: '0.88rem' }}>{fmt(s.valor)}</div>
                  <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>{s.data} · {s.chave}</div>
                </div>
                <StatusBadge status={s.status} />
              </div>
            ))}
            <p style={{ color: '#6b7280', fontSize: '0.75rem', textAlign: 'center', marginTop: '0.5rem' }}>Dados demonstrativos</p>
          </div>
        </Card>
      </div>

      {/* Extrato */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.8rem' }}>
          <h3 style={{ color: '#111827', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="#8942FC" /> Extrato Completo
          </h3>
          <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar..." style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.5rem 0.8rem 0.5rem 2rem', color: '#111827', fontSize: '0.85rem', outline: 'none', width: 160 }} />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.5rem 0.8rem', color: '#111827', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}>
              <option value="todos">Todos</option>
              <option value="pago">Pagos</option>
              <option value="aguardando_pix">Aguardando</option>
              <option value="pendente">Pendente</option>
            </select>
            <button onClick={exportCSV} style={{ background: 'transparent', border: '1px solid #22242c', borderRadius: 8, padding: '0.5rem 0.9rem', color: '#6b7280', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Download size={14} /> CSV
            </button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                {['ID', 'Item', 'Total', 'Líquido', 'Taxa', 'Método', 'Status', 'Data'].map(h => (
                  <th key={h} style={{ padding: '0.7rem 1rem', textAlign: 'left', color: '#94a3b8', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid #f8fafc' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '0.8rem 1rem', color: '#6b7280' }}>#{t.id}</td>
                  <td style={{ padding: '0.8rem 1rem', color: '#111827', fontWeight: 600, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.item_name}</td>
                  <td style={{ padding: '0.8rem 1rem', color: '#111827' }}>{fmt(t.valor_total)}</td>
                  <td style={{ padding: '0.8rem 1rem', color: '#22c55e', fontWeight: 700 }}>{fmt(t.valor_liquido)}</td>
                  <td style={{ padding: '0.8rem 1rem', color: '#f59e0b' }}>{fmt(t.valor_total - t.valor_liquido)}</td>
                  <td style={{ padding: '0.8rem 1rem' }}><span style={{ background: '#f3f4f6', padding: '0.2rem 0.6rem', borderRadius: 6, fontSize: '0.72rem', color: '#8942FC', textTransform: 'uppercase', fontWeight: 700, border: '1px solid #e5e7eb' }}>{t.metodo_pagamento || 'N/A'}</span></td>
                  <td style={{ padding: '0.8rem 1rem' }}><StatusBadge status={t.status} /></td>
                  <td style={{ padding: '0.8rem 1rem', color: '#6b7280', whiteSpace: 'nowrap' }}>{fmtDate(t.created_at)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>Nenhuma transação encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: PAGAMENTOS
// ══════════════════════════════════════════════════════════════════════════════
function PagamentosTab({ data }: { data: DashboardData }) {
  const txs = data.transacoes || [];
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [pixResult, setPixResult] = useState<{ qrcode: string; copia: string; expira: string; charge_id: string } | null>(null);
  const [pixLoading, setPixLoading] = useState(false);
  const [pixForm, setPixForm] = useState({ valor: '', descricao: '', nome: '', email: '', cpf: '' });
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = txs.filter(t => !search || t.item_name.toLowerCase().includes(search.toLowerCase()) || String(t.id).includes(search));

  const gerarPIX = async () => {
    if (!pixForm.valor) return;
    setPixLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/pix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token()}` },
        body: JSON.stringify({ valor: parseFloat(pixForm.valor), descricao: pixForm.descricao || 'Pagamento via A2Pay', customer_name: pixForm.nome || 'Cliente', customer_email: pixForm.email || 'cliente@email.com', customer_cpf: pixForm.cpf || '24971563792' })
      });
      const d = await res.json();
      if (d.pix_copia_cola) setPixResult({ qrcode: d.pix_qrcode, copia: d.pix_copia_cola, expira: d.pix_expiracao, charge_id: d.charge_id });
    } catch { /* nada */ }
    setPixLoading(false);
  };

  return (
    <div>
      <SectionHeader icon={<CreditCard size={22} />} title="Pagamentos" sub="Lista completa de transações e geração de cobranças PIX." />

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Lista de transações */}
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ color: '#111827', fontWeight: 700, fontSize: '0.95rem' }}>Lista de Transações</h3>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.4rem 0.7rem 0.4rem 1.8rem', color: '#111827', fontSize: '0.82rem', outline: 'none', width: 140 }} />
            </div>
          </div>
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {filtered.map(t => (
              <div key={t.id} onClick={() => setSelected(selected?.id === t.id ? null : t)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.9rem 1.5rem', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', background: selected?.id === t.id ? 'rgba(137,66,252,0.05)' : 'transparent', transition: 'background .15s' }}
                onMouseEnter={e => { if (selected?.id !== t.id) e.currentTarget.style.background = '#f8fafc'; }}
                onMouseLeave={e => { if (selected?.id !== t.id) e.currentTarget.style.background = 'transparent'; }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: '#f3f4f6', display: 'grid', placeItems: 'center', color: '#8942FC', flexShrink: 0 }}>
                  {t.metodo_pagamento === 'pix' ? <Zap size={15} /> : <CreditCard size={15} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#111827', fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.item_name}</div>
                  <div style={{ color: '#6b7280', fontSize: '0.72rem' }}>#{t.id} · {fmtDate(t.created_at)}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ color: '#22c55e', fontWeight: 700, fontSize: '0.85rem' }}>{fmt(t.valor_liquido)}</div>
                  <StatusBadge status={t.status} />
                </div>
                <ChevronRight size={14} color="#6b7280" />
              </div>
            ))}
            {filtered.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Nenhuma transação.</p>}
          </div>
        </Card>

        {/* Detalhe ou Criar PIX */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {selected ? (
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ color: '#111827', fontWeight: 700, fontSize: '0.9rem' }}>Detalhes #{selected.id}</h3>
                <button onClick={() => setSelected(null)} style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
              </div>
              {[
                { label: 'Descrição', value: selected.item_name },
                { label: 'Valor Total', value: fmt(selected.valor_total) },
                { label: 'Taxa Gateway', value: fmt(selected.valor_total - selected.valor_liquido), color: '#f59e0b' },
                { label: 'Valor Líquido', value: fmt(selected.valor_liquido), color: '#22c55e' },
                { label: 'Status', value: <StatusBadge status={selected.status} /> },
                { label: 'Método', value: (selected.metodo_pagamento || 'N/A').toUpperCase() },
                { label: 'Data', value: fmtDate(selected.created_at) },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.55rem 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>{r.label}</span>
                  <span style={{ color: (r as any).color || '#111827', fontSize: '0.85rem', fontWeight: 600 }}>{r.value}</span>
                </div>
              ))}
              {/* Timeline */}
              <div style={{ marginTop: '1rem' }}>
                <div style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.6rem' }}>Timeline</div>
                {[
                  { label: 'Criado', done: true },
                  { label: 'Processando', done: selected.status !== 'pendente' },
                  { label: 'Pago', done: selected.status === 'pago' },
                ].map((step, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                    <div style={{ width: 16, height: 16, borderRadius: 99, background: step.done ? '#8942FC' : '#e5e7eb', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      {step.done && <Check size={9} color="#fff" />}
                    </div>
                    <span style={{ color: step.done ? '#111827' : '#6b7280', fontSize: '0.78rem' }}>{step.label}</span>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card>
              <h3 style={{ color: '#111827', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                <Zap size={16} color="#8942FC" /> Gerar Cobrança PIX
              </h3>
              {pixResult ? (
                <div>
                  <div style={{ background: '#f9fafb', borderRadius: 10, padding: '0.5rem', marginBottom: '0.8rem', display: 'grid', placeItems: 'center' }}>
                    <img src={`data:image/png;base64,${pixResult.qrcode}`} alt="QR Code PIX" style={{ width: 150, height: 150 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                  <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.6rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <code style={{ flex: 1, fontSize: '0.65rem', color: '#8942FC', wordBreak: 'break-all', lineHeight: 1.4 }}>{pixResult.copia.slice(0, 60)}...</code>
                    <button onClick={() => { navigator.clipboard.writeText(pixResult.copia); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ background: 'transparent', border: 'none', color: copied ? '#22c55e' : '#6b7280', cursor: 'pointer', flexShrink: 0 }}>
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  <button onClick={() => { setPixResult(null); setPixForm({ valor: '', descricao: '', nome: '', email: '', cpf: '' }); }} style={{ width: '100%', background: 'transparent', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.6rem', color: '#6b7280', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                    Nova Cobrança
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                  {[
                    { key: 'valor', label: 'VALOR (R$)', placeholder: '99,90', type: 'number' },
                    { key: 'descricao', label: 'DESCRIÇÃO', placeholder: 'Pedido #123' },
                    { key: 'nome', label: 'NOME DO CLIENTE', placeholder: 'João Silva' },
                    { key: 'email', label: 'EMAIL', placeholder: 'joao@email.com' },
                    { key: 'cpf', label: 'CPF', placeholder: '000.000.000-00' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ display: 'block', color: '#6b7280', fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.3rem' }}>{f.label}</label>
                      <input type={(f as any).type || 'text'} value={(pixForm as any)[f.key]} onChange={e => setPixForm(prev => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.placeholder}
                        style={{ width: '100%', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.55rem 0.8rem', color: '#111827', fontSize: '0.85rem', outline: 'none' }} />
                    </div>
                  ))}
                  <button onClick={gerarPIX} disabled={pixLoading || !pixForm.valor} style={{ background: '#8942FC', color: '#fff', border: 'none', borderRadius: 9, padding: '0.75rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', marginTop: '0.3rem', opacity: (!pixForm.valor || pixLoading) ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Zap size={16} /> {pixLoading ? 'Gerando...' : 'Gerar QR Code PIX'}
                  </button>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: ANTIFRAUDE
// ══════════════════════════════════════════════════════════════════════════════
function AntifraudeTab({ data }: { data: DashboardData }) {
  const txs = data.transacoes || [];
  const suspeitas = txs.filter(t => t.status === 'bloqueado' || t.status === 'falhou');
  const [limitValor, setLimitValor] = useState('5000');
  const [blockPais, setBlockPais] = useState(true);
  const [blockProxy, setBlockProxy] = useState(true);
  const [limitTx, setLimitTx] = useState('10');
  const [saved, setSaved] = useState(false);

  const scoreColor = (s: number) => s >= 60 ? '#ef4444' : s >= 30 ? '#f59e0b' : '#22c55e';

  return (
    <div>
      <SectionHeader icon={<ShieldAlert size={22} />} title="Antifraude" sub="Monitoramento de risco, análise manual e regras de bloqueio." />

      {/* Cards de Status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <MetricCard icon={<ShieldAlert size={15} />} label="Transações Bloqueadas" value={String(suspeitas.length)} sub="Score ≥ 60" color="#ef4444" />
        <MetricCard icon={<AlertTriangle size={15} />} label="Suspeitas" value={String(txs.filter(t => t.status === 'pendente').length)} sub="Score entre 30-59" color="#f59e0b" />
        <MetricCard icon={<CheckCircle2 size={15} />} label="Aprovadas" value={String(txs.filter(t => t.status === 'pago').length)} sub="Score < 30" color="#22c55e" />
        <MetricCard icon={<Activity size={15} />} label="Regras Ativas" value="4" sub="IP, Volume, Valor, Geo" color="#8942FC" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
        {/* Monitoramento */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card>
            <h3 style={{ color: '#111827', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
              <Activity size={16} color="#ef4444" /> Monitoramento em Tempo Real
            </h3>
            {txs.length === 0 && <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>Sem transações para monitorar.</p>}
            {txs.slice(0, 8).map(t => {
              const score = t.status === 'bloqueado' ? 85 : t.status === 'pago' ? 5 : 35;
              return (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem', borderRadius: 8, marginBottom: '0.5rem', background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                  <div>
                    <div style={{ color: '#111827', fontWeight: 600, fontSize: '0.82rem' }}>{t.item_name} <span style={{ color: '#6b7280' }}>#{t.id}</span></div>
                    <div style={{ color: '#6b7280', fontSize: '0.72rem' }}>{fmt(t.valor_total)} · {t.metodo_pagamento || 'N/A'}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    {/* Score bar */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: scoreColor(score), fontWeight: 800, fontSize: '0.9rem' }}>{score}</div>
                      <div style={{ width: 60, height: 4, background: '#e5e7eb', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ width: `${score}%`, height: '100%', background: scoreColor(score), borderRadius: 99, transition: 'width .5s' }} />
                      </div>
                    </div>
                    <StatusBadge status={t.status} />
                  </div>
                </div>
              );
            })}
          </Card>

          {/* Análise Manual */}
          <Card>
            <h3 style={{ color: '#111827', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
              <Search size={16} color="#f59e0b" /> Análise Manual
            </h3>
            {txs.filter(t => t.status === 'aguardando_pix').slice(0, 3).map(t => (
              <div key={t.id} style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 10, padding: '0.9rem', marginBottom: '0.7rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ color: '#111827', fontWeight: 600, fontSize: '0.85rem' }}>#{t.id} · {t.item_name}</div>
                  <span style={{ color: '#f59e0b', fontWeight: 800 }}>{fmt(t.valor_total)}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.7rem', fontSize: '0.72rem' }}>
                  <span style={{ background: '#fff', padding: '0.2rem 0.5rem', borderRadius: 4, color: '#6b7280', border: '1px solid #e5e7eb' }}>🌐 IP: 127.0.0.1</span>
                  <span style={{ background: '#fff', padding: '0.2rem 0.5rem', borderRadius: 4, color: '#6b7280', border: '1px solid #e5e7eb' }}>📍 BR</span>
                  <span style={{ background: '#fff', padding: '0.2rem 0.5rem', borderRadius: 4, color: '#6b7280', border: '1px solid #e5e7eb' }}>Score: 35</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button style={{ flex: 1, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', borderRadius: 7, padding: '0.4rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>✓ Aprovar</button>
                  <button style={{ flex: 1, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: 7, padding: '0.4rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>✕ Recusar</button>
                </div>
              </div>
            ))}
            {txs.filter(t => t.status === 'aguardando_pix').length === 0 && (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '1.5rem', fontSize: '0.85rem' }}>Nenhuma transação aguardando análise.</p>
            )}
          </Card>
        </div>

        {/* Regras */}
        <Card>
          <h3 style={{ color: '#111827', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
            🗂️ Regras do Antifraude
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {/* Regra 1: Limite de valor */}
            <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '1rem' }}>
              <div style={{ color: '#111827', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem' }}>💰 Limite de Valor</div>
              <div style={{ color: '#6b7280', fontSize: '0.78rem', marginBottom: '0.6rem' }}>Transações acima deste valor recebem +20 pontos de risco</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>R$</span>
                <input value={limitValor} onChange={e => setLimitValor(e.target.value)} type="number" style={{ flex: 1, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 7, padding: '0.5rem 0.7rem', color: '#111827', fontSize: '0.9rem', outline: 'none' }} />
              </div>
            </div>

            {/* Regra 2: Limite de transações */}
            <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '1rem' }}>
              <div style={{ color: '#111827', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem' }}>⚡ Limite de Tentativas (5 min)</div>
              <div style={{ color: '#6b7280', fontSize: '0.78rem', marginBottom: '0.6rem' }}>Acima deste número de transações por merchant em 5 min = suspeito</div>
              <input value={limitTx} onChange={e => setLimitTx(e.target.value)} type="number" style={{ width: '100%', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 7, padding: '0.5rem 0.7rem', color: '#111827', fontSize: '0.9rem', outline: 'none' }} />
            </div>

            {/* Regra 3: Bloqueio por país */}
            <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <div style={{ color: '#111827', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Globe size={14} /> Bloquear IPs Estrangeiros</div>
                <button onClick={() => setBlockPais(p => !p)} style={{ width: 42, height: 22, borderRadius: 99, background: blockPais ? '#8942FC' : '#e5e7eb', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background .2s' }}>
                  <div style={{ width: 16, height: 16, borderRadius: 99, background: '#fff', position: 'absolute', top: 3, transition: 'left .2s', left: blockPais ? 22 : 3 }} />
                </button>
              </div>
              <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>IPs fora do Brasil recebem +40 pontos de risco</div>
            </div>

            {/* Regra 4: Bloquear proxy */}
            <div style={{ paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <div style={{ color: '#111827', fontWeight: 700, fontSize: '0.85rem' }}>🔒 Bloquear VPN/Proxy</div>
                <button onClick={() => setBlockProxy(p => !p)} style={{ width: 42, height: 22, borderRadius: 99, background: blockProxy ? '#8942FC' : '#e5e7eb', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background .2s' }}>
                  <div style={{ width: 16, height: 16, borderRadius: 99, background: '#fff', position: 'absolute', top: 3, transition: 'left .2s', left: blockProxy ? 22 : 3 }} />
                </button>
              </div>
              <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>VPNs e proxies recebem +50 pontos de risco</div>
            </div>

            <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
              style={{ width: '100%', background: saved ? '#22c55e' : '#8942FC', color: '#fff', border: 'none', borderRadius: 9, padding: '0.75rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'background .3s' }}>
              {saved ? <><Check size={16} /> Salvo!</> : 'Salvar Regras'}
            </button>

            <div style={{ background: 'rgba(137,66,252,0.05)', borderRadius: 8, padding: '0.8rem', fontSize: '0.78rem', color: '#8942FC', border: '1px solid rgba(137,66,252,0.1)' }}>
              <strong>Score ≥ 60</strong> = bloqueio automático<br />
              <strong>Score 30–59</strong> = marcado como suspeito<br />
              <strong>Score &lt; 30</strong> = aprovado automaticamente
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: DESENVOLVEDOR (API & WEBHOOKS)
// ══════════════════════════════════════════════════════════════════════════════
function DesenvolvedorTab() {
  const [keyData, setKeyData] = useState<APIKeyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [rotating, setRotating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);

  const fetchKey = () => {
    fetch(`${API}/api/merchants/apikey`, { headers: { 'Authorization': `Bearer ${token()}` } })
      .then(r => r.json()).then((d: APIKeyData) => { setKeyData(d); setLoading(false); });
  };
  useEffect(() => { fetchKey(); }, []);

  const handleRotate = async (environment: 'live' | 'test') => {
    if (!confirm(`Isso invalidará sua chave de ${environment === 'test' ? 'Sandbox' : 'Produção'} atual. Confirmar?`)) return;
    setRotating(true);
    const r = await fetch(`${API}/api/merchants/apikey/rotate`, { 
      headers: { 'Authorization': `Bearer ${token()}`, 'Content-Type': 'application/json' },
      method: 'POST', 
      body: JSON.stringify({ environment })
    });
    const d = await r.json();
    setKeyData(prev => prev ? { ...prev, api_key: d.api_key, api_key_test: d.api_key_test } : prev);
    setRotating(false);
    setVisible(true);
  };

  const maskedKey = (k: string) => k.split('_').slice(0, 2).join('_') + '_' + '•'.repeat(20) + k.slice(-6);
  
  const currentKey = keyData ? (localStorage.getItem('a2pay_env') === 'test' ? keyData.api_key_test : keyData.api_key) : '';

  const codeExample = currentKey ? `curl -X POST ${keyData?.endpoint} \\
  -H "Authorization: Bearer ${currentKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "valor": 99.90,
    "descricao": "Pedido #123",
    "customer_name": "João Silva",
    "customer_email": "joao@email.com",
    "customer_cpf": "12345678909"
  }'` : '';

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>Carregando...</div>;

  return (
    <div>
      <SectionHeader icon={<Terminal size={22} />} title="Desenvolvedor" sub="API Keys, Webhooks e Ambiente de Teste Sandbox." />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Card das chaves */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* LIVE KEY */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div>
                <div style={{ color: '#111827', fontWeight: 700, fontSize: '0.9rem' }}>Chave de Produção (Live)</div>
                <div style={{ color: '#6b7280', fontSize: '0.72rem' }}>Use para receber pagamentos reais</div>
              </div>
              <span style={{ background: 'rgba(34,197,94,0.1)', color: '#15803d', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 99, padding: '0.2rem 0.6rem', fontSize: '0.65rem', fontWeight: 800 }}>LIVE</span>
            </div>
            
            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '1rem', fontFamily: 'monospace', fontSize: '0.8rem', color: '#111827' }}>
              <span style={{ wordBreak: 'break-all', flex: 1, color: '#15803d' }}>{visible ? keyData?.api_key : maskedKey(keyData?.api_key || '')}</span>
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                <button onClick={() => setVisible(!visible)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280' }}>{visible ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                <button onClick={() => { navigator.clipboard.writeText(keyData?.api_key || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: copied ? '#22c55e' : '#6b7280' }}>
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                </button>
              </div>
            </div>

            <button onClick={() => handleRotate('live')} disabled={rotating} style={{ background: 'transparent', border: '1px solid #e5e7eb', color: '#6b7280', borderRadius: 6, padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
              Rotacionar Live Key
            </button>
          </Card>

          {/* SANDBOX KEY */}
          <Card style={{ border: '1px solid rgba(137,66,252,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div>
                <div style={{ color: '#111827', fontWeight: 700, fontSize: '0.9rem' }}>Chave de Testes (Sandbox)</div>
                <div style={{ color: '#6b7280', fontSize: '0.72rem' }}>Exclusiva para simulações</div>
              </div>
              <span style={{ background: 'rgba(245,158,11,0.1)', color: '#d97706', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 99, padding: '0.2rem 0.6rem', fontSize: '0.65rem', fontWeight: 800 }}>TEST</span>
            </div>
            
            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '1rem', fontFamily: 'monospace', fontSize: '0.8rem', color: '#111827' }}>
              <span style={{ wordBreak: 'break-all', flex: 1, color: '#d97706' }}>{visible ? keyData?.api_key_test : maskedKey(keyData?.api_key_test || '')}</span>
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                <button onClick={() => setVisible(!visible)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280' }}>{visible ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                <button onClick={() => { navigator.clipboard.writeText(keyData?.api_key_test || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: copied ? '#22c55e' : '#6b7280' }}>
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                </button>
              </div>
            </div>

            <button onClick={() => handleRotate('test')} disabled={rotating} style={{ background: 'transparent', border: '1px solid #e5e7eb', color: '#6b7280', borderRadius: 6, padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
              Rotacionar Sandbox Key
            </button>
          </Card>
        </div>

          {/* Exemplo de integração */}
        <Card>
          <div style={{ color: '#111827', fontWeight: 700, fontSize: '0.9rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={15} color="#8942FC" /> Exemplo de Integração (cURL)
          </div>
          <div style={{ background: '#1e293b', borderRadius: 12, padding: '1.2rem', position: 'relative', overflowX: 'auto', border: '1px solid #334155' }}>
            <pre style={{ margin: 0, color: '#f8fafc', fontSize: '0.8rem', lineHeight: 1.5, fontFamily: 'monospace' }}>
              {codeExample}
            </pre>
            <button onClick={() => { navigator.clipboard.writeText(codeExample); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 6, padding: '0.3rem 0.6rem', fontSize: '0.7rem', cursor: 'pointer' }}>
              {copied ? 'Copiado!' : 'Copiar Exemplo'}
            </button>
          </div>
          <p style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '1rem', lineHeight: 1.4 }}>
            Substitua os dados do cliente e o valor conforme sua necessidade. Este endpoint retorna um link de checkout ou payload PIX Copia e Cola.
          </p>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Webhooks */}
        <Card>
          <h3 style={{ color: '#111827', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
            <RefreshCw size={16} color="#8942FC" /> Webhooks (Notificações)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', color: '#6b7280', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.4rem' }}>URL DE NOTIFICAÇÃO</label>
              <input defaultValue="https://sualoja.com/api/webhooks/a2pay" style={{ width: '100%', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.75rem', color: '#111827', fontSize: '0.9rem', outline: 'none' }} />
            </div>
            
            <div>
              <div style={{ color: '#111827', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.6rem' }}>Eventos Monitorados (Notificações Geradas):</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['Pagamento Recebido', 'Falha no PIX', 'Saque Enviado', 'Fraude Detectada'].map(e => (
                  <span key={e} style={{ background: 'rgba(137,66,252,0.1)', color: '#8942FC', padding: '0.3rem 0.6rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600 }}>{e}</span>
                ))}
              </div>
            </div>

            <div style={{ background: '#f9fafb', borderRadius: 8, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e5e7eb' }}>
              <div>
                <div style={{ color: '#111827', fontSize: '0.85rem', fontWeight: 600 }}>Status do último disparo</div>
                <div style={{ color: '#22c55e', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                  <CheckCircle2 size={12} /> 200 OK — Há 5 minutos
                </div>
              </div>
              <button style={{ background: '#ffffff', border: '1px solid #e5e7eb', color: '#111827', borderRadius: 6, padding: '0.5rem 0.9rem', fontSize: '0.8rem', cursor: 'pointer' }}>Re-processar Eventos</button>
            </div>
          </div>
        </Card>

        {/* Ambiente de Teste / Sandbox */}
        <Card>
          <h3 style={{ color: '#111827', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
            <Activity size={16} color="#f59e0b" /> Ambiente de Teste (Sandbox)
          </h3>
          <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <strong style={{ color: '#f59e0b', fontSize: '0.88rem' }}>Modo Sandbox Ativo</strong>
              <div style={{ width: 44, height: 24, borderRadius: 99, background: '#f59e0b', position: 'relative' }}>
                <div style={{ width: 18, height: 18, borderRadius: 99, background: '#fff', position: 'absolute', top: 3, left: 23 }} />
              </div>
            </div>
            <p style={{ color: '#d97706', fontSize: '0.8rem', margin: 0, lineHeight: 1.5 }}>
              Use este ambiente para simular pagamentos, aprovações, estornos e falhas.<br/><br/>
              <strong>Métricas financeiras reais não serão afetadas.</strong>
            </p>
          </div>
          <button style={{ width: '100%', background: 'transparent', border: '1px dashed #f59e0b', color: '#f59e0b', borderRadius: 8, padding: '0.8rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'background .2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            Gerar Transação Fake (Teste)
          </button>
          <button style={{ width: '100%', background: 'transparent', border: '1px dashed #ef4444', color: '#ef4444', borderRadius: 8, padding: '0.8rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'background .2s', marginTop: '0.7rem' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            Simular Erro (Chargeback)
          </button>
        </Card>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: CONTA / KYC
// ══════════════════════════════════════════════════════════════════════════════
function ContaTab() {
  return (
    <div>
      <SectionHeader icon={<User size={22} />} title="Minha Conta" sub="Gerencie seu perfil, verifique sua empresa (KYC) e configure taxas." />

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Perfil & Dados da Empresa */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.8rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ width: 68, height: 68, borderRadius: 18, background: '#8942FC', display: 'grid', placeItems: 'center', color: '#fff', fontSize: '1.8rem', fontWeight: 800, boxShadow: '0 4px 15px rgba(137,66,252,0.3)' }}>LT</div>
            <div>
              <h3 style={{ color: '#111827', fontWeight: 800, fontSize: '1.2rem' }}>Lojista Demo</h3>
              <div style={{ color: '#6b7280', fontSize: '0.88rem', marginTop: '0.2rem' }}>CNPJ: 45.123.456/0001-99</div>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', color: '#6b7280', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.4rem' }}>NOME FANTASIA (SUA LOJA)</label>
              <input defaultValue="Lojista Demo" style={{ width: '100%', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.75rem', color: '#111827', fontSize: '0.9rem', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#6b7280', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.4rem' }}>E-MAIL COMERCIAL</label>
              <input defaultValue="demo@lojista.com" style={{ width: '100%', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.75rem', color: '#111827', fontSize: '0.9rem', outline: 'none' }} />
            </div>
          </div>
          <button style={{ marginTop: '1.5rem', background: '#f3f4f6', color: '#111827', border: 'none', borderRadius: 8, padding: '0.7rem 1.5rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>Salvar Alterações</button>
        </Card>

        {/* Verificação KYC */}
        <Card>
          <h3 style={{ color: '#111827', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
            <CheckCircle2 size={16} color="#22c55e" /> Verificação KYC
          </h3>
          <div style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', display: 'grid', placeItems: 'center', color: '#22c55e' }}>
              <Check size={22} />
            </div>
            <div>
              <div style={{ color: '#15803d', fontWeight: 700, fontSize: '0.95rem' }}>Conta Verificada</div>
              <div style={{ color: '#6b7280', fontSize: '0.78rem', marginTop: '0.2rem' }}>Documentos aprovados em 14/04</div>
            </div>
          </div>

          <div style={{ border: '1px dashed #e5e7eb', borderRadius: 10, padding: '1.8rem 1rem', textAlign: 'center', cursor: 'pointer', transition: 'background .2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <Upload size={28} color="#6b7280" style={{ marginBottom: '0.8rem' }} />
            <div style={{ color: '#111827', fontWeight: 600, fontSize: '0.9rem' }}>Atualizar Documentos</div>
            <div style={{ color: '#6b7280', fontSize: '0.78rem', marginTop: '0.3rem' }}>Envie seu Contrato Social ou CNH/RG (PDF, JPG)</div>
          </div>
        </Card>
      </div>

      {/* Configurações Financeiras */}
      <Card>
        <h3 style={{ color: '#111827', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
          <Settings size={16} color="#8942FC" /> Configurações Financeiras Avançadas
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Conta Bancária */}
          <div>
            <div style={{ color: '#111827', fontWeight: 600, fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>🏦 Conta para Saque (Destino)</div>
            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.7rem' }}>
                <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>Instituição</span>
                <span style={{ color: '#111827', fontSize: '0.85rem', fontWeight: 600 }}>033 - Banco Santander</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.7rem' }}>
                <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>Agência</span>
                <span style={{ color: '#111827', fontSize: '0.85rem', fontWeight: 600 }}>1234</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>Conta Corrente</span>
                <span style={{ color: '#111827', fontSize: '0.85rem', fontWeight: 600 }}>1234567-8</span>
              </div>
            </div>
            <button style={{ marginTop: '1rem', color: '#8942FC', background: 'transparent', border: 'none', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Alterar conta bancária →</button>
          </div>

          {/* Taxas Customizadas */}
          <div>
            <div style={{ color: '#111827', fontWeight: 600, fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>💸 Taxas Personalizadas & Repasse</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.8rem', borderBottom: '1px solid #e5e7eb' }}>
                <div>
                  <div style={{ color: '#111827', fontSize: '0.85rem' }}>Taxa Checkout PIX (Fixa)</div>
                  <div style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.2rem' }}>Acordo comercial vigente</div>
                </div>
                <div style={{ color: '#f59e0b', fontWeight: 800, fontSize: '1.1rem' }}>R$ 0,99</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#111827', fontSize: '0.85rem' }}>Frequência de Liquidação</div>
                  <div style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.2rem' }}>Quando seu dinheiro fica livre</div>
                </div>
                <select style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 6, padding: '0.5rem 0.8rem', color: '#111827', outline: 'none', fontSize: '0.85rem' }}>
                  <option>D+0 (Tempo Real)</option>
                  <option>D+1 (Diário)</option>
                  <option>Semanal</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isSandbox, setIsSandbox] = useState(() => localStorage.getItem('a2pay_env') === 'test');
  const navigate = useNavigate();

  const fetchData = (env: boolean) => {
    setLoading(true);
    fetch(`${API}/api/pagamentos`, { 
      headers: { 
        'Authorization': `Bearer ${token()}`,
        'x-a2pay-env': env ? 'test' : 'live'
      } 
    })
      .then(r => { 
        if (!r.ok) {
          if (r.status === 401) { localStorage.removeItem('token'); navigate('/login'); }
          throw new Error("Erro ao carregar dados do painel");
        }
        return r.json(); 
      })
      .then((d: DashboardData) => { 
        setData(d); 
        setLoading(false); 
      })
      .catch((err) => { 
        console.error("[Dashboard] Error:", err);
        setData({ role: 'error', error: err.message } as any);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData(isSandbox);
  }, [navigate]);

  const toggleEnv = () => {
    const newVal = !isSandbox;
    setIsSandbox(newVal);
    localStorage.setItem('a2pay_env', newVal ? 'test' : 'live');
    fetchData(newVal);
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
      <div style={{ width: 48, height: 48, border: '3px solid #f3f4f6', borderTopColor: '#8942FC', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#6b7280' }}>Carregando painel...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!data || data.role === 'error') return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem', textAlign: 'center', padding: '2rem' }}>
        <ShieldAlert size={48} color="#ef4444" />
        <h2 style={{ color: '#111827', fontWeight: 700 }}>Erro ao carregar o painel</h2>
        <p style={{ color: '#6b7280', maxWidth: 400 }}>Não foi possível buscar as informações da API. Verifique sua conexão ou tente novamente.</p>
        <button onClick={() => fetchData(isSandbox)} style={{ background: '#8942FC', color: '#fff', border: 'none', padding: '0.6rem 1.5rem', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Tentar Novamente</button>
    </div>
  );

  if (data.role === 'master') return <MasterApp data={data} />;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const tabs: { id: Tab; icon: JSX.Element; label: string; group?: string }[] = [
    { id: 'overview',    icon: <LayoutDashboard size={18} />, label: 'Dashboard', group: 'PRINCIPAL' },
    { id: 'financeiro',  icon: <DollarSign size={18} />,      label: 'Financeiro', group: 'SUA LOJA' },
    { id: 'pagamentos',  icon: <CreditCard size={18} />,      label: 'Pagamentos', group: 'SUA LOJA' },
    { id: 'antifraude',  icon: <ShieldAlert size={18} />,     label: 'Antifraude', group: 'SUA LOJA' },
    { id: 'desenvolvedor', icon: <Terminal size={18} />,      label: 'Integração', group: 'DEVELOPER' },
    { id: 'conta',       icon: <User size={18} />,            label: 'Configurações', group: 'DEVELOPER' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* SIDEBAR */}
      <aside style={{ width: '280px', background: '#ffffff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', zIndex: 100 }}>
        
        {/* Sidebar Header */}
        <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ background: '#8942FC', width: '32px', height: '32px', borderRadius: '8px', display: 'grid', placeItems: 'center' }}>
            <Shield size={18} color="#fff" fill="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#111827', letterSpacing: '-0.02em' }}>A2Pay</span>
        </div>

        {/* App Switcher (Simulado) */}
        <div style={{ margin: '0 1rem 2rem', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: '#f3f4f6', display: 'grid', placeItems: 'center' }}>
              <Building size={14} color="#6b7280" />
            </div>
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#374151' }}>Minha Loja</span>
          </div>
          <ChevronDown size={16} color="#94a3b8" />
        </div>

        {/* Navigation Groups */}
        <div style={{ flex: 1, padding: '0 0.75rem', overflowY: 'auto' }}>
          {['PRINCIPAL', 'SUA LOJA', 'DEVELOPER'].map(group => (
            <div key={group} style={{ marginBottom: '1.5rem' }}>
              <div style={{ padding: '0 0.75rem', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{group}</div>
              {tabs.filter(t => t.group === group).map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 0.75rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, transition: 'all .2s', marginBottom: '2px',
                    background: activeTab === tab.id ? 'rgba(137,66,252,0.08)' : 'transparent',
                    color: activeTab === tab.id ? '#8942FC' : '#6b7280',
                  }}>
                  <span style={{ color: activeTab === tab.id ? '#8942FC' : '#94a3b8' }}>{tab.icon}</span>
                  {tab.label}
                  {activeTab === tab.id && <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#8942FC' }} />}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div style={{ padding: '1rem', borderTop: '1px solid #f3f4f6' }}>
          {/* Dev Mode Toggle */}
          <div onClick={toggleEnv} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Code size={18} color="#6b7280" />
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#374151' }}>Dev Mode</span>
            </div>
            <div style={{ width: 36, height: 20, borderRadius: 99, background: isSandbox ? '#8942FC' : '#e5e7eb', position: 'relative', transition: 'background .3s' }}>
              <div style={{ width: 14, height: 14, borderRadius: 99, background: '#fff', position: 'absolute', top: 3, left: isSandbox ? 19 : 3, transition: 'all .3s cubic-bezier(0.4, 0, 0.2, 1)' }} />
            </div>
          </div>

          {/* Support */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', color: '#6b7280' }}>
            <HelpCircle size={18} />
            <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Suporte</span>
          </div>

          {/* User Profile */}
          <div style={{ marginTop: '0.5rem', padding: '0.75rem', borderRadius: '12px', background: '#f9fafb', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid #f3f4f6' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#8942FC', color: '#fff', fontSize: '0.8rem', fontWeight: 800, display: 'grid', placeItems: 'center' }}>
              {data.role === 'admin' ? 'AD' : 'LJ'}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Lojista A2Pay</div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{data.role === 'admin' ? 'Administrador' : 'Merchant'}</div>
            </div>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, height: '100vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        
        {/* TOP HEADER */}
        <header style={{ height: '73px', background: '#ffffff', borderBottom: '1px solid #e5e7eb', padding: '0 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 90 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.9rem', fontWeight: 500 }}>
            <Monitor size={16} />
            <span style={{ color: '#94a3b8' }}>Dashboard</span>
            <ChevronRight size={14} />
            <span style={{ color: '#111827', fontWeight: 600 }}>{tabs.find(t => t.id === activeTab)?.label}</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {isSandbox && (
              <div style={{ background: 'rgba(245,158,11,0.1)', color: '#d97706', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(245,158,11,0.2)', textTransform: 'uppercase' }}>
                Ambiente Teste
              </div>
            )}
            <button style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}><Bell size={20} /></button>
            <div style={{ width: '1px', height: '20px', background: '#e5e7eb' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
               <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Minha Loja</div>
               <ChevronDown size={14} color="#94a3b8" />
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div style={{ padding: '2rem 2.5rem', maxWidth: '1400px' }}>
          {activeTab === 'overview'   && <OverviewTab data={data} />}
          {activeTab === 'financeiro' && <FinanceiroTab data={data} />}
          {activeTab === 'pagamentos' && <PagamentosTab data={data} />}
          {activeTab === 'antifraude' && <AntifraudeTab data={data} />}
          {activeTab === 'desenvolvedor' && <DesenvolvedorTab />}
          {activeTab === 'conta'      && <ContaTab />}
        </div>
      </main>
    </div>
  );
}
