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
  List, RotateCcw, Banknote, History
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
}
interface APIKeyData { api_key: string; capabilities: string; endpoint: string; created_at: string; }

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
    <div style={{ background: '#13151a', border: '1px solid #22242c', borderRadius: 16, padding: '1.4rem 1.6rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', transition: 'border-color .2s', cursor: 'default', position: 'relative', overflow: 'hidden' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = `${color}50`)}
      onMouseLeave={e => (e.currentTarget.style.borderColor = '#22242c')}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          <span style={{ color }}>{icon}</span> {label}
        </div>
        {spark && <Sparkline data={spark} color={color} />}
      </div>
      <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>{sub}</div>}
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ icon, title, sub }: { icon: JSX.Element; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: '1.8rem' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fff', fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.3rem' }}>
        <span style={{ color: '#8942FC' }}>{icon}</span>{title}
      </h2>
      {sub && <p style={{ color: '#6b7280', fontSize: '0.88rem' }}>{sub}</p>}
    </div>
  );
}

// ── Card container ────────────────────────────────────────────────────────────
function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: '#13151a', border: '1px solid #22242c', borderRadius: 16, padding: '1.5rem', ...style }}>
      {children}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: OVERVIEW
// ══════════════════════════════════════════════════════════════════════════════
function OverviewTab({ data }: { data: DashboardData }) {
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

  return (
    <div>
      <SectionHeader icon={<LayoutDashboard size={22} />} title="Visão Geral" sub="Métricas em tempo real do seu negócio." />

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <MetricCard icon={<DollarSign size={15} />} label="Saldo Disponível" value={fmt(saldo)} sub="Pronto para saque" color="#22c55e" spark={sparks} />
        <MetricCard icon={<Clock size={15} />} label="Saldo Pendente" value={fmt(saldoPendente)} sub="Aguardando confirmação" color="#f59e0b" />
        <MetricCard icon={<TrendingUp size={15} />} label="Volume Total" value={fmt(volume)} sub={`${pagas.length} transações pagas`} color="#8942FC" spark={sparks} />
        <MetricCard icon={<Activity size={15} />} label="Taxas Cobradas" value={fmt(taxas)} sub="Taxa fixa de R$ 0,99/PIX" color="#6366f1" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Transações recentes */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>Transações Recentes</h3>
            <span style={{ color: '#8942FC', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Ver todas →</span>
          </div>
          {recent.length === 0 && <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>Nenhuma transação.</p>}
          {recent.map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #1a1c24' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#1a1c24', display: 'grid', placeItems: 'center', color: '#8942FC' }}>
                  {t.metodo_pagamento === 'pix' ? <Zap size={16} /> : <CreditCard size={16} />}
                </div>
                <div>
                  <div style={{ color: '#fff', fontSize: '0.88rem', fontWeight: 600 }}>{t.item_name || 'Pagamento'}</div>
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
          <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={16} color="#f59e0b" /> Alertas
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {pendentes.length > 0 && (
              <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: '0.8rem' }}>
                <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.82rem' }}>⚡ {pendentes.length} PIX aguardando</div>
                <div style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.2rem' }}>Confirme no painel financeiro</div>
              </div>
            )}
            <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, padding: '0.8rem' }}>
              <div style={{ color: '#22c55e', fontWeight: 700, fontSize: '0.82rem' }}>✅ Antifraude ativo</div>
              <div style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.2rem' }}>4 regras monitorando</div>
            </div>
            <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, padding: '0.8rem' }}>
              <div style={{ color: '#818cf8', fontWeight: 700, fontSize: '0.82rem' }}>🔑 API Key ativa</div>
              <div style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.2rem' }}>Integração pronta para uso</div>
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
          <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                <input value={saqueValor} onChange={e => setSaqueValor(e.target.value)} type="number" placeholder="Ex: 100,00" style={{ width: '100%', background: '#0b0c10', border: '1px solid #22242c', borderRadius: 8, padding: '0.7rem 1rem', color: '#fff', fontSize: '0.95rem', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#6b7280', fontSize: '0.82rem', marginBottom: '0.4rem', fontWeight: 600 }}>CHAVE PIX</label>
                <input value={saqueChave} onChange={e => setSaqueChave(e.target.value)} placeholder="CPF, email ou chave aleatória" style={{ width: '100%', background: '#0b0c10', border: '1px solid #22242c', borderRadius: 8, padding: '0.7rem 1rem', color: '#fff', fontSize: '0.95rem', outline: 'none' }} />
              </div>
              <div style={{ background: 'rgba(137,66,252,0.08)', borderRadius: 8, padding: '0.7rem 1rem', fontSize: '0.8rem', color: '#a78bfa' }}>
                Saldo disponível: <strong>{fmt(saldo)}</strong> · Taxa de saque: grátis
              </div>
              <button
                disabled={!saqueValor || !saqueChave || parseFloat(saqueValor) > saldo}
                onClick={() => setSaqueOK(true)}
                style={{ background: '#8942FC', color: '#fff', border: 'none', borderRadius: 10, padding: '0.8rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem', opacity: (!saqueValor || !saqueChave || parseFloat(saqueValor) > saldo) ? 0.5 : 1 }}>
                Solicitar Saque
              </button>
            </div>
          )}
        </Card>

        {/* Histórico de Saques */}
        <Card>
          <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} color="#8942FC" /> Histórico de Saques
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[
              { valor: 250.00, status: 'pago', data: '14/04', chave: '***@email.com' },
              { valor: 100.00, status: 'pago', data: '10/04', chave: 'cpf: ***456' },
              { valor: 500.00, status: 'pendente', data: 'Hoje', chave: 'chave aleatória' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem', background: '#0b0c10', borderRadius: 8, border: '1px solid #1a1c24' }}>
                <div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.88rem' }}>{fmt(s.valor)}</div>
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
          <h3 style={{ color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="#8942FC" /> Extrato Completo
          </h3>
          <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar..." style={{ background: '#0b0c10', border: '1px solid #22242c', borderRadius: 8, padding: '0.5rem 0.8rem 0.5rem 2rem', color: '#fff', fontSize: '0.85rem', outline: 'none', width: 160 }} />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ background: '#0b0c10', border: '1px solid #22242c', borderRadius: 8, padding: '0.5rem 0.8rem', color: '#fff', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}>
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
              <tr style={{ borderBottom: '1px solid #22242c' }}>
                {['ID', 'Item', 'Total', 'Líquido', 'Taxa', 'Método', 'Status', 'Data'].map(h => (
                  <th key={h} style={{ padding: '0.7rem 1rem', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid #1a1c24' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#1a1c24')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '0.8rem 1rem', color: '#6b7280' }}>#{t.id}</td>
                  <td style={{ padding: '0.8rem 1rem', color: '#fff', fontWeight: 600, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.item_name}</td>
                  <td style={{ padding: '0.8rem 1rem', color: '#fff' }}>{fmt(t.valor_total)}</td>
                  <td style={{ padding: '0.8rem 1rem', color: '#22c55e', fontWeight: 700 }}>{fmt(t.valor_liquido)}</td>
                  <td style={{ padding: '0.8rem 1rem', color: '#f59e0b' }}>{fmt(t.valor_total - t.valor_liquido)}</td>
                  <td style={{ padding: '0.8rem 1rem' }}><span style={{ background: '#1a1c24', padding: '0.2rem 0.5rem', borderRadius: 4, fontSize: '0.75rem', color: '#a78bfa', textTransform: 'uppercase', fontWeight: 700 }}>{t.metodo_pagamento || 'N/A'}</span></td>
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
          <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid #22242c', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>Lista de Transações</h3>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." style={{ background: '#0b0c10', border: '1px solid #22242c', borderRadius: 8, padding: '0.4rem 0.7rem 0.4rem 1.8rem', color: '#fff', fontSize: '0.82rem', outline: 'none', width: 140 }} />
            </div>
          </div>
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {filtered.map(t => (
              <div key={t.id} onClick={() => setSelected(selected?.id === t.id ? null : t)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.9rem 1.5rem', borderBottom: '1px solid #1a1c24', cursor: 'pointer', background: selected?.id === t.id ? 'rgba(137,66,252,0.08)' : 'transparent', transition: 'background .15s' }}
                onMouseEnter={e => { if (selected?.id !== t.id) e.currentTarget.style.background = '#1a1c24'; }}
                onMouseLeave={e => { if (selected?.id !== t.id) e.currentTarget.style.background = 'transparent'; }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: '#1a1c24', display: 'grid', placeItems: 'center', color: '#8942FC', flexShrink: 0 }}>
                  {t.metodo_pagamento === 'pix' ? <Zap size={15} /> : <CreditCard size={15} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.item_name}</div>
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
                <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>Detalhes #{selected.id}</h3>
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
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.55rem 0', borderBottom: '1px solid #1a1c24' }}>
                  <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>{r.label}</span>
                  <span style={{ color: (r as any).color || '#fff', fontSize: '0.85rem', fontWeight: 600 }}>{r.value}</span>
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
                    <div style={{ width: 16, height: 16, borderRadius: 99, background: step.done ? '#8942FC' : '#22242c', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      {step.done && <Check size={9} color="#fff" />}
                    </div>
                    <span style={{ color: step.done ? '#fff' : '#6b7280', fontSize: '0.78rem' }}>{step.label}</span>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card>
              <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                <Zap size={16} color="#8942FC" /> Gerar Cobrança PIX
              </h3>
              {pixResult ? (
                <div>
                  <div style={{ background: '#fff', borderRadius: 10, padding: '0.5rem', marginBottom: '0.8rem', display: 'grid', placeItems: 'center' }}>
                    <img src={`data:image/png;base64,${pixResult.qrcode}`} alt="QR Code PIX" style={{ width: 150, height: 150 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                  <div style={{ background: '#0b0c10', border: '1px solid #22242c', borderRadius: 8, padding: '0.6rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <code style={{ flex: 1, fontSize: '0.65rem', color: '#a78bfa', wordBreak: 'break-all', lineHeight: 1.4 }}>{pixResult.copia.slice(0, 60)}...</code>
                    <button onClick={() => { navigator.clipboard.writeText(pixResult.copia); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ background: 'transparent', border: 'none', color: copied ? '#22c55e' : '#6b7280', cursor: 'pointer', flexShrink: 0 }}>
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  <button onClick={() => { setPixResult(null); setPixForm({ valor: '', descricao: '', nome: '', email: '', cpf: '' }); }} style={{ width: '100%', background: 'transparent', border: '1px solid #22242c', borderRadius: 8, padding: '0.6rem', color: '#6b7280', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
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
                        style={{ width: '100%', background: '#0b0c10', border: '1px solid #22242c', borderRadius: 8, padding: '0.55rem 0.8rem', color: '#fff', fontSize: '0.85rem', outline: 'none' }} />
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
            <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
              <Activity size={16} color="#ef4444" /> Monitoramento em Tempo Real
            </h3>
            {txs.length === 0 && <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>Sem transações para monitorar.</p>}
            {txs.slice(0, 8).map(t => {
              const score = t.status === 'bloqueado' ? 85 : t.status === 'pago' ? 5 : 35;
              return (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem', borderRadius: 8, marginBottom: '0.5rem', background: '#0b0c10', border: '1px solid #1a1c24' }}>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.82rem' }}>{t.item_name} <span style={{ color: '#6b7280' }}>#{t.id}</span></div>
                    <div style={{ color: '#6b7280', fontSize: '0.72rem' }}>{fmt(t.valor_total)} · {t.metodo_pagamento || 'N/A'}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    {/* Score bar */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: scoreColor(score), fontWeight: 800, fontSize: '0.9rem' }}>{score}</div>
                      <div style={{ width: 60, height: 4, background: '#22242c', borderRadius: 99, overflow: 'hidden' }}>
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
            <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
              <Search size={16} color="#f59e0b" /> Análise Manual
            </h3>
            {txs.filter(t => t.status === 'aguardando_pix').slice(0, 3).map(t => (
              <div key={t.id} style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 10, padding: '0.9rem', marginBottom: '0.7rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>#{t.id} · {t.item_name}</div>
                  <span style={{ color: '#f59e0b', fontWeight: 800 }}>{fmt(t.valor_total)}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.7rem', fontSize: '0.72rem' }}>
                  <span style={{ background: '#1a1c24', padding: '0.2rem 0.5rem', borderRadius: 4, color: '#6b7280' }}>🌐 IP: 127.0.0.1</span>
                  <span style={{ background: '#1a1c24', padding: '0.2rem 0.5rem', borderRadius: 4, color: '#6b7280' }}>📍 BR</span>
                  <span style={{ background: '#1a1c24', padding: '0.2rem 0.5rem', borderRadius: 4, color: '#6b7280' }}>Score: 35</span>
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
          <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
            🗂️ Regras do Antifraude
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {/* Regra 1: Limite de valor */}
            <div style={{ borderBottom: '1px solid #22242c', paddingBottom: '1rem' }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem' }}>💰 Limite de Valor</div>
              <div style={{ color: '#6b7280', fontSize: '0.78rem', marginBottom: '0.6rem' }}>Transações acima deste valor recebem +20 pontos de risco</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>R$</span>
                <input value={limitValor} onChange={e => setLimitValor(e.target.value)} type="number" style={{ flex: 1, background: '#0b0c10', border: '1px solid #22242c', borderRadius: 7, padding: '0.5rem 0.7rem', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
              </div>
            </div>

            {/* Regra 2: Limite de transações */}
            <div style={{ borderBottom: '1px solid #22242c', paddingBottom: '1rem' }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem' }}>⚡ Limite de Tentativas (5 min)</div>
              <div style={{ color: '#6b7280', fontSize: '0.78rem', marginBottom: '0.6rem' }}>Acima deste número de transações por merchant em 5 min = suspeito</div>
              <input value={limitTx} onChange={e => setLimitTx(e.target.value)} type="number" style={{ width: '100%', background: '#0b0c10', border: '1px solid #22242c', borderRadius: 7, padding: '0.5rem 0.7rem', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
            </div>

            {/* Regra 3: Bloqueio por país */}
            <div style={{ borderBottom: '1px solid #22242c', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Globe size={14} /> Bloquear IPs Estrangeiros</div>
                <button onClick={() => setBlockPais(p => !p)} style={{ width: 42, height: 22, borderRadius: 99, background: blockPais ? '#8942FC' : '#22242c', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background .2s' }}>
                  <div style={{ width: 16, height: 16, borderRadius: 99, background: '#fff', position: 'absolute', top: 3, transition: 'left .2s', left: blockPais ? 22 : 3 }} />
                </button>
              </div>
              <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>IPs fora do Brasil recebem +40 pontos de risco</div>
            </div>

            {/* Regra 4: Bloquear proxy */}
            <div style={{ paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>🔒 Bloquear VPN/Proxy</div>
                <button onClick={() => setBlockProxy(p => !p)} style={{ width: 42, height: 22, borderRadius: 99, background: blockProxy ? '#8942FC' : '#22242c', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background .2s' }}>
                  <div style={{ width: 16, height: 16, borderRadius: 99, background: '#fff', position: 'absolute', top: 3, transition: 'left .2s', left: blockProxy ? 22 : 3 }} />
                </button>
              </div>
              <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>VPNs e proxies recebem +50 pontos de risco</div>
            </div>

            <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
              style={{ width: '100%', background: saved ? '#22c55e' : '#8942FC', color: '#fff', border: 'none', borderRadius: 9, padding: '0.75rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'background .3s' }}>
              {saved ? <><Check size={16} /> Salvo!</> : 'Salvar Regras'}
            </button>

            <div style={{ background: 'rgba(137,66,252,0.08)', borderRadius: 8, padding: '0.8rem', fontSize: '0.75rem', color: '#a78bfa' }}>
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
  const [copiedCode, setCopiedCode] = useState(false);
  const [visible, setVisible] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://minhaloja.com/webhook/a2pay');

  const [selectedCaps, setSelectedCaps] = useState('pix,card');

  const fetchKey = () => {
    fetch(`${API}/api/merchants/apikey`, { headers: { 'Authorization': `Bearer ${token()}` } })
      .then(r => r.json()).then((d: APIKeyData) => { setKeyData(d); setLoading(false); setSelectedCaps(d.capabilities || 'pix,card'); });
  };
  useEffect(() => { fetchKey(); }, []);

  const handleRotate = async () => {
    if (!confirm('Isso invalidará sua chave atual. Confirmar?')) return;
    setRotating(true);
    const r = await fetch(`${API}/api/merchants/apikey/rotate`, { 
      method: 'POST', 
      headers: { 'Authorization': `Bearer ${token()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ capabilities: selectedCaps })
    });
    const d = await r.json();
    setKeyData(prev => prev ? { ...prev, api_key: d.api_key, capabilities: d.capabilities } : prev);
    setRotating(false);
    setVisible(true);
  };

  const maskedKey = keyData ? 'a2pay_pk_' + '•'.repeat(20) + keyData.api_key.slice(-6) : '';
  const codeExample = keyData ? `curl -X POST ${keyData.endpoint} \\
  -H "Authorization: Bearer ${keyData.api_key}" \\
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
        {/* Card da chave */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, marginBottom: '0.2rem' }}>Chave Secreta de Produção</div>
              <div style={{ color: '#6b7280', fontSize: '0.78rem' }}>Gerada em {keyData?.created_at}</div>
            </div>
            <span style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 99, padding: '0.2rem 0.8rem', fontSize: '0.72rem', fontWeight: 700 }}>ATIVA</span>
          </div>
          <div style={{ background: '#0b0c10', border: '1px solid #22242c', borderRadius: 10, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.8rem', marginBottom: '1rem', fontFamily: 'monospace', fontSize: '0.85rem', color: '#fff' }}>
            <span style={{ wordBreak: 'break-all', flex: 1 }}>{visible ? keyData?.api_key : maskedKey}</span>
            <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
              <button onClick={() => setVisible(v => !v)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280' }}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button>
              <button onClick={() => { navigator.clipboard.writeText(keyData?.api_key || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: copied ? '#22c55e' : '#6b7280' }}>
                {copied ? <Check size={17} /> : <Copy size={17} />}
              </button>
            </div>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: '1.5rem' }}>
            <strong style={{ color: '#fff' }}>Endpoint de Pagamento:</strong>{' '}
            <code style={{ color: '#a78bfa', background: 'rgba(167,139,250,0.1)', padding: '0.1rem 0.5rem', borderRadius: 4 }}>POST {keyData?.endpoint}</code>
          </div>

          <div style={{ marginBottom: '1.5rem', background: '#1a1c24', padding: '1rem', borderRadius: 10 }}>
            <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.8rem' }}>Permissões da Chave (Escopo)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                <input type="radio" name="caps" value="pix,card" checked={selectedCaps === 'pix,card'} onChange={(e) => setSelectedCaps(e.target.value)} style={{ accentColor: '#8942FC', transform: 'scale(1.2)' }} />
                <span style={{ color: '#fff', fontSize: '0.85rem' }}>Híbrido (Cartão e PIX)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                <input type="radio" name="caps" value="pix" checked={selectedCaps === 'pix'} onChange={(e) => setSelectedCaps(e.target.value)} style={{ accentColor: '#8942FC', transform: 'scale(1.2)' }} />
                <span style={{ color: '#fff', fontSize: '0.85rem' }}>Exclusivo PIX <span style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '0.1rem 0.4rem', borderRadius: 4, fontSize: '0.7rem', marginLeft: '0.4rem', fontWeight: 700 }}>RECOMENDADO</span></span>
              </label>
            </div>
            <p style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.8rem', lineHeight: 1.4 }}>Selecione o escopo acima e clique em Rotacionar. A chave resultante só conseguirá autorizar pagamentos nos métodos selecionados.</p>
          </div>

          <button onClick={handleRotate} disabled={rotating} style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: 8, padding: '0.6rem 1.2rem', cursor: rotating ? 'not-allowed' : 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', opacity: rotating ? 0.6 : 1 }}>
            <RefreshCw size={15} /> {rotating ? 'Aplicando...' : 'Guardar Alteração e Rotacionar Chave'}
          </button>
        </Card>

        {/* Exemplo de integração */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Code size={16} color="#8942FC" /> Documentação Expressa (cURL)
            </h3>
            <button onClick={() => { navigator.clipboard.writeText(codeExample); setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2000); }} style={{ background: 'transparent', border: '1px solid #22242c', color: copiedCode ? '#22c55e' : '#6b7280', borderRadius: 6, padding: '0.3rem 0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
              {copiedCode ? <Check size={12} /> : <Copy size={12} />} {copiedCode ? 'Copiado!' : 'Copiar Exemplo'}
            </button>
          </div>
          <pre style={{ background: '#0b0c10', border: '1px solid #22242c', borderRadius: 10, padding: '1.2rem', color: '#a78bfa', fontSize: '0.78rem', overflowX: 'auto', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>{codeExample}</pre>
          <h4 style={{ color: '#fff', marginTop: '1.2rem', marginBottom: '0.6rem', fontSize: '0.85rem' }}>Resposta JSON</h4>
          <pre style={{ background: '#0b0c10', border: '1px solid #22242c', borderRadius: 10, padding: '1rem', color: '#6b7280', fontSize: '0.75rem', overflowX: 'auto', lineHeight: 1.7, margin: 0 }}>{`{
  "id": 42,
  "charge_id": "pay_abc123",
  "status": "aguardando_pix",
  "valor": 99.90,
  "taxa_gateway": 0.99,
  "valor_liquido": 98.91,
  "pix_qrcode": "data:image/png;base64,...",
  "pix_copia_cola": "00020101021226...",
  "pix_expiracao": "2026-04-16"
}`}</pre>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
        {/* Webhooks */}
        <Card>
          <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
            <Webhook size={16} color="#8942FC" /> Webhooks de Retorno (Notificações)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', color: '#6b7280', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>URL DO WEBBHOOK (MÉTODO POST)</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} placeholder="https://seudominio.com/webhook" style={{ flex: 1, background: '#0b0c10', border: '1px solid #22242c', borderRadius: 8, padding: '0.7rem 0.8rem', color: '#fff', fontSize: '0.85rem', outline: 'none' }} />
                <button style={{ background: '#8942FC', color: '#fff', border: 'none', borderRadius: 8, padding: '0 1.2rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>Salvar URL</button>
              </div>
              <p style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.5rem' }}>Enviaremos payloads JSON sempre que o status de uma transação mudar.</p>
            </div>
            
            <div>
              <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.6rem' }}>Eventos Monitorados (Notificações Geradas):</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['Pagamento Recebido', 'Falha no PIX', 'Saque Enviado', 'Fraude Detectada'].map(e => (
                  <span key={e} style={{ background: '#1a1c24', color: '#a78bfa', padding: '0.3rem 0.6rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600 }}>{e}</span>
                ))}
              </div>
            </div>

            <div style={{ background: 'rgba(137,66,252,0.08)', borderRadius: 8, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>Status do último disparo</div>
                <div style={{ color: '#22c55e', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                  <CheckCircle2 size={12} /> 200 OK — Há 5 minutos
                </div>
              </div>
              <button style={{ background: 'transparent', border: '1px solid #22242c', color: '#fff', borderRadius: 6, padding: '0.5rem 0.9rem', fontSize: '0.8rem', cursor: 'pointer' }}>Re-processar Eventos</button>
            </div>
          </div>
        </Card>

        {/* Ambiente de Teste / Sandbox */}
        <Card>
          <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.8rem', paddingBottom: '1.5rem', borderBottom: '1px solid #22242c' }}>
            <div style={{ width: 68, height: 68, borderRadius: 18, background: '#8942FC', display: 'grid', placeItems: 'center', color: '#fff', fontSize: '1.8rem', fontWeight: 800 }}>LT</div>
            <div>
              <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem' }}>Lojista Demo</h3>
              <div style={{ color: '#6b7280', fontSize: '0.88rem', marginTop: '0.2rem' }}>CNPJ: 45.123.456/0001-99</div>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', color: '#6b7280', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.4rem' }}>NOME FANTASIA (SUA LOJA)</label>
              <input defaultValue="Lojista Demo" style={{ width: '100%', background: '#0b0c10', border: '1px solid #22242c', borderRadius: 8, padding: '0.75rem', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#6b7280', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.4rem' }}>E-MAIL COMERCIAL</label>
              <input defaultValue="demo@lojista.com" style={{ width: '100%', background: '#0b0c10', border: '1px solid #22242c', borderRadius: 8, padding: '0.75rem', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
            </div>
          </div>
          <button style={{ marginTop: '1.5rem', background: '#22242c', color: '#fff', border: 'none', borderRadius: 8, padding: '0.7rem 1.5rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>Salvar Alterações</button>
        </Card>

        {/* Verificação KYC */}
        <Card>
          <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
            <CheckCircle2 size={16} color="#22c55e" /> Verificação KYC
          </h3>
          <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'grid', placeItems: 'center', color: '#22c55e' }}>
              <Check size={22} />
            </div>
            <div>
              <div style={{ color: '#22c55e', fontWeight: 700, fontSize: '0.95rem' }}>Conta Verificada</div>
              <div style={{ color: '#6b7280', fontSize: '0.78rem', marginTop: '0.2rem' }}>Documentos aprovados em 14/04</div>
            </div>
          </div>

          <div style={{ border: '1px dashed #22242c', borderRadius: 10, padding: '1.8rem 1rem', textAlign: 'center', cursor: 'pointer', transition: 'background .2s' }} onMouseEnter={e => e.currentTarget.style.background = '#1a1c24'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <Upload size={28} color="#6b7280" style={{ marginBottom: '0.8rem' }} />
            <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>Atualizar Documentos</div>
            <div style={{ color: '#6b7280', fontSize: '0.78rem', marginTop: '0.3rem' }}>Envie seu Contrato Social ou CNH/RG (PDF, JPG)</div>
          </div>
        </Card>
      </div>

      {/* Configurações Financeiras */}
      <Card>
        <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
          <Settings size={16} color="#8942FC" /> Configurações Financeiras Avançadas
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Conta Bancária */}
          <div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>🏦 Conta para Saque (Destino)</div>
            <div style={{ background: '#0b0c10', border: '1px solid #1a1c24', borderRadius: 8, padding: '1.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.7rem' }}>
                <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>Instituição</span>
                <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>033 - Banco Santander</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.7rem' }}>
                <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>Agência</span>
                <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>1234</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>Conta Corrente</span>
                <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>1234567-8</span>
              </div>
            </div>
            <button style={{ marginTop: '1rem', color: '#8942FC', background: 'transparent', border: 'none', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Alterar conta bancária →</button>
          </div>

          {/* Taxas Customizadas */}
          <div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>💸 Taxas Personalizadas & Repasse</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.8rem', borderBottom: '1px solid #1a1c24' }}>
                <div>
                  <div style={{ color: '#fff', fontSize: '0.85rem' }}>Taxa Checkout PIX (Fixa)</div>
                  <div style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.2rem' }}>Acordo comercial vigente</div>
                </div>
                <div style={{ color: '#f59e0b', fontWeight: 800, fontSize: '1.1rem' }}>R$ 0,99</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#fff', fontSize: '0.85rem' }}>Frequência de Liquidação</div>
                  <div style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.2rem' }}>Quando seu dinheiro fica livre</div>
                </div>
                <select style={{ background: '#0b0c10', border: '1px solid #22242c', borderRadius: 6, padding: '0.5rem 0.8rem', color: '#fff', outline: 'none', fontSize: '0.85rem' }}>
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
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API}/api/pagamentos`, { headers: { 'Authorization': `Bearer ${token()}` } })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d: DashboardData) => { setData(d); setLoading(false); })
      .catch(() => { localStorage.removeItem('token'); navigate('/login'); });
  }, [navigate]);

  if (loading || !data) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
      <div style={{ width: 48, height: 48, border: '3px solid #22242c', borderTopColor: '#8942FC', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#6b7280' }}>Carregando painel...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (data.role === 'master') return <MasterApp data={data} />;

  const tabs: { id: Tab; icon: JSX.Element; label: string }[] = [
    { id: 'overview',    icon: <LayoutDashboard size={16} />, label: 'Visão Geral' },
    { id: 'financeiro',  icon: <DollarSign size={16} />,      label: 'Financeiro' },
    { id: 'pagamentos',  icon: <CreditCard size={16} />,      label: 'Pagamentos' },
    { id: 'antifraude',  icon: <ShieldAlert size={16} />,     label: 'Antifraude' },
    { id: 'desenvolvedor', icon: <Terminal size={16} />,      label: 'Desenvolvedor' },
    { id: 'conta',       icon: <User size={16} />,            label: 'Conta / KYC' },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '2rem', background: '#13151a', borderRadius: 12, padding: '0.4rem', width: 'fit-content', border: '1px solid #22242c', overflowX: 'auto', flexWrap: 'nowrap', maxWidth: '100%' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 1.1rem', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all .2s', whiteSpace: 'nowrap',
              background: activeTab === tab.id ? '#8942FC' : 'transparent',
              color: activeTab === tab.id ? '#fff' : '#6b7280',
              boxShadow: activeTab === tab.id ? '0 2px 12px rgba(137,66,252,0.35)' : 'none',
            }}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview'   && <OverviewTab data={data} />}
      {activeTab === 'financeiro' && <FinanceiroTab data={data} />}
      {activeTab === 'pagamentos' && <PagamentosTab data={data} />}
      {activeTab === 'antifraude' && <AntifraudeTab data={data} />}
      {activeTab === 'desenvolvedor' && <DesenvolvedorTab />}
      {activeTab === 'conta'      && <ContaTab />}
    </div>
  );
}
