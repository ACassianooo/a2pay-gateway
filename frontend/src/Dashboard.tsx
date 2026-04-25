import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, DollarSign, CreditCard, ShieldAlert, Terminal, User, Zap, Activity, HelpCircle, LogOut, 
  ChevronRight, Bell, Monitor, Search, Filter, Download, CheckCircle2, Building, ChevronDown, 
  Code, Shield, List, ArrowUpRight, Ban, TrendingUp, Eye, EyeOff, Check, RefreshCw, 
  ShieldCheck, Users, History, Lock, ShoppingBag, Clock, XCircle, Copy, Globe,
  AlertTriangle, Upload, Settings, Banknote, QrCode, Wallet, Plus, Info, ArrowRight,
  Ticket, Repeat, FileText, Link as LinkIcon, Undo2, BookOpen, Key, Radio, Puzzle, Layers, SlidersHorizontal,
  Pencil, LayoutGrid, ListFilter, Image as ImageIcon, MoreHorizontal, ArrowLeft, Folder, Store
} from 'lucide-react';
import { MasterApp } from './admin/MasterApp';
import { API_BASE_URL } from './api';

// Import Admin Tabs
import { AdminOverview } from './admin/dashboard/AdminOverview';
import { AdminUsers } from './admin/users/AdminUsers';
import { AdminTransactions } from './admin/transactions/AdminTransactions';
import { AdminWithdrawals } from './admin/withdrawals/AdminWithdrawals';
import { AdminFinance } from './admin/finance/AdminFinance';
import { AdminFraud } from './admin/fraud/AdminFraud';
import { AdminReports } from './admin/reports/AdminReports';
import { AdminIntegrations } from './admin/integrations/AdminIntegrations';
import { AdminAudit } from './admin/audit/AdminAudit';
import { AdminAccessControl } from './admin/settings/AdminAccessControl';
import DemoStore from './DemoStore';
import AssinaturasTab from './AssinaturasTab';

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
interface Customer {
  id: string;
  name: string;
  email: string;
  cpf: string;
  created_at: string;
}
interface EmpresaInfo { nome: string; volume_girado: number; taxas_cobradas: number; }
interface DashboardData {
  role: string;
  saldo_lojista?: number;
  transacoes?: Transaction[];
  clientes?: Customer[];
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

type Tab = 'overview' | 'financeiro' | 'pagamentos' | 'clientes' | 'desenvolvedor' | 'conta' | 
  'produtos' | 'cupons' | 'assinaturas' | 'cobrancas' | 'antecipacoes' | 'link-pagamentos' | 'extrato' | 'disputas' |
  'docs' | 'api-keys' | 'webhook' | 'plugins' | 'roadmap' | 'antifraude' |
  'admin-overview' | 'admin-users' | 'admin-transactions' | 'admin-finance' | 'admin-withdrawals' | 'admin-fraud' | 'admin-reports' | 'admin-integrations' | 'admin-audit' | 'admin-access' | 'admin-demo';

const API = API_BASE_URL;
const token = () => localStorage.getItem('token') || '';
const fmt = (v: number) => `R$ ${v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
const fmtDate = (d: string) => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string; icon: React.ReactElement; label: string }> = {
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
function MetricCard({ label, value, icon, sub, color }: {
  label: string; value: string; icon?: React.ReactElement; sub?: string; color?: string;
}) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>{label}</div>
        {icon && <div style={{ color: color || '#94a3b8' }}>{icon}</div>}
      </div>
      <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>{sub}</div>}
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ icon, title, sub }: { icon: React.ReactElement; title: string; sub?: string }) {
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
function Card({ children, style = {}, onClick }: { children: React.ReactNode; style?: React.CSSProperties, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', ...style }}
    >
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
  const volume = pagas.reduce((s, t) => s + t.valor_total, 0);
  const ticketMedio = pagas.length > 0 ? volume / pagas.length : 0;

  const periods = ['Hoje', 'Esse mês', 'Últimos 30 dias', 'Últimos 90 dias', 'Todo o período', 'Personalizado'];

  const metodos = [
    { name: 'Cartão de crédito', key: 'card', color: '#f97316', icon: <CreditCard size={15} /> },
    { name: 'Pix', key: 'pix', color: '#a855f7', icon: <Zap size={15} /> },
    { name: 'Pix QR Code', key: 'pix_qr_code', color: '#14b8a6', icon: <QrCode size={15} /> },
  ];

  const stats = metodos.map(m => {
    const val = pagas.filter(t => (t.metodo_pagamento || 'pix') === m.key).reduce((s, t) => s + t.valor_total, 0);
    return { ...m, value: val };
  });

  const totalVolume = stats.reduce((s, m) => s + m.value, 0);

  return (
    <div>
      {/* Filtros de Período */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {periods.map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            style={{ 
              padding: '0.6rem 1.2rem', 
              borderRadius: '10px', 
              border: period === p ? 'none' : '1px solid #e2e8f0', 
              background: period === p ? '#c084fc' : '#fff', 
              color: period === p ? '#4c1d95' : '#64748b', 
              fontSize: '0.85rem', 
              fontWeight: 700, 
              cursor: 'pointer', 
              transition: 'all .2s', 
              whiteSpace: 'nowrap' 
            }}>
            {p}
          </button>
        ))}
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <MetricCard label="Total em vendas" value={fmt(volume)} />
        <MetricCard label="Total de transações" value={String(pagas.length)} />
        <MetricCard label="Ticket Médio" value={fmt(ticketMedio)} />
      </div>

      {/* Métodos de Pagamento */}
      <Card style={{ padding: '1.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f8fafc', display: 'grid', placeItems: 'center', border: '1px solid #f1f5f9' }}>
            <Wallet size={18} color="#64748b" />
          </div>
          <h3 style={{ color: '#111827', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em' }}>Métodos de pagamentos</h3>
        </div>

        {/* Barra de Progresso Geral */}
        <div style={{ width: '100%', height: '36px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden', marginBottom: '2rem', position: 'relative' }}>
          {totalVolume > 0 ? (
            <div style={{ display: 'flex', width: '100%', height: '100%' }}>
              {stats.map((m, i) => (
                <div key={i} style={{ 
                  width: `${(m.value / totalVolume) * 100}%`, 
                  height: '100%', 
                  background: m.color, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  transition: 'width .5s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                  {((m.value / totalVolume) * 100) > 10 && `${Math.round((m.value / totalVolume) * 100)}%`}
                </div>
              ))}
            </div>
          ) : (
             <div style={{ width: '100%', height: '100%', background: '#e2e8f0' }} />
          )}
        </div>

        {/* Lista de Métodos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          {stats.sort((a,b) => b.value - a.value).map(m => (
            <div key={m.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', borderTop: '1px solid #f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ color: m.color }}>{m.icon}</div>
                <span style={{ color: '#111827', fontSize: '0.9rem', fontWeight: 700 }}>{m.name}</span>
              </div>
              <span style={{ color: '#111827', fontSize: '0.95rem', fontWeight: 700 }}>{fmt(m.value)}</span>
            </div>
          ))}
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem 0', borderTop: '1px solid #f1f5f9', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#16a34a', display: 'grid', placeItems: 'center' }}>
                 <Check size={14} color="#fff" strokeWidth={3} />
              </div>
              <span style={{ color: '#111827', fontSize: '0.95rem', fontWeight: 800 }}>Total</span>
            </div>
            <span style={{ color: '#111827', fontSize: '1.1rem', fontWeight: 900 }}>{fmt(totalVolume)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: CLIENTES

// ══════════════════════════════════════════════════════════════════════════════
function ProdutosTab() {
  const [currentSubTab, setCurrentSubTab] = useState('todos');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const products: any[] = [];

  const subTabs = [
    { id: 'todos', label: 'Todos os produtos' },
    { id: 'recursos', label: 'Recursos' },
    { id: 'cupons', label: 'Cupons' },
    { id: 'tarifas', label: 'Tarifas de envio' },
    { id: 'aliquotas', label: 'Alíquotas' },
    { id: 'tabelas', label: 'Tabelas de preços' },
  ];

  if (editingProduct) {
    return (
      <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
        <button 
          onClick={() => setEditingProduct(null)}
          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
          <ArrowLeft size={18} /> Voltar para lista
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', margin: 0 }}>Detalhes do produto</h1>
          <button style={{ background: '#fff', border: '1px solid #8942FC', color: '#8942FC', borderRadius: 10, padding: '0.6rem 1.8rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
            Editar
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          {/* Left Column: Info */}
          <Card style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <div style={{ background: '#f8fafc', width: 32, height: 32, borderRadius: 8, display: 'grid', placeItems: 'center', border: '1px solid #e2e8f0' }}>
                <Pencil size={16} color="#64748b" />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: 0 }}>Informações básicas</h2>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>ID do produto: <span style={{ fontWeight: 500, color: '#94a3b8', marginLeft: 4 }}>{editingProduct.id}</span></label>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '0.5rem' }}>Nome do produto</label>
              <input 
                defaultValue={editingProduct.name}
                style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '0.8rem 1rem', fontSize: '0.95rem', color: '#111827' }} 
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '0.5rem' }}>Preço</label>
              <input 
                defaultValue={`R$ ${editingProduct.price.toFixed(2).replace('.', ',')}`}
                style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '0.8rem 1rem', fontSize: '0.95rem', color: '#64748b' }} 
              />
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>O preço não pode ser alterado após a criação do produto</p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '0.5rem' }}>Descrição</label>
              <textarea 
                defaultValue={editingProduct.sub}
                style={{ width: '100%', minHeight: '150px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '0.8rem 1rem', fontSize: '0.95rem', color: '#111827', resize: 'vertical' }} 
              />
            </div>
          </Card>

          {/* Right Column: Image */}
          <Card style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <ImageIcon size={20} color="#64748b" />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: 0 }}>Imagem do produto</h2>
            </div>

            <div style={{ width: '100%', aspectRatio: '1/1', background: `${editingProduct.color}08`, borderRadius: 12, border: `1px solid ${editingProduct.color}15`, display: 'grid', placeItems: 'center' }}>
              <ImageIcon size={64} color={editingProduct.color} strokeWidth={1} />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', margin: 0 }}>Seus Produtos</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.5rem' }}>
          <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Todos</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>{products.length}</div>
        </div>
        <div style={{ background: '#fff', border: '2px solid #8942FC', borderRadius: 12, padding: '1.5rem' }}>
          <div style={{ color: '#8942FC', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Ativo</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#8942FC' }}>{products.length}</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.5rem' }}>
          <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Arquivados</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>0</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              placeholder="Pesquisar..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '0.6rem 1rem 0.6rem 2.5rem', fontSize: '0.88rem' }}
            />
          </div>
          <button style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b', cursor: 'pointer' }}>
            <ListFilter size={16} /> Status: Ativo
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: 8 }}>
            <button 
              onClick={() => setViewMode('grid')}
              style={{ background: viewMode === 'grid' ? '#fff' : 'transparent', border: 'none', borderRadius: 6, padding: '0.4rem', cursor: 'pointer', boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
              <LayoutGrid size={18} color={viewMode === 'grid' ? '#8942FC' : '#64748b'} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              style={{ background: viewMode === 'list' ? '#fff' : 'transparent', border: 'none', borderRadius: 6, padding: '0.4rem', cursor: 'pointer', boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
              <List size={18} color={viewMode === 'list' ? '#8942FC' : '#64748b'} />
            </button>
          </div>
          <button style={{ background: '#c084fc', color: '#4c1d95', border: 'none', borderRadius: 10, padding: '0.6rem 1.2rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>+ Novo</button>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {products.map(p => (
          <Card key={p.id} onClick={() => setEditingProduct(p)} style={{ padding: 0, overflow: 'hidden', border: '1px solid #f1f5f9', transition: 'all 0.2s', cursor: 'pointer' }}>
            <div style={{ height: '160px', background: `${p.color}10`, display: 'grid', placeItems: 'center', position: 'relative' }}>
              <ImageIcon size={48} color={p.color} strokeWidth={1} />
              <div style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <MoreHorizontal size={18} color="#64748b" />
              </div>
            </div>
            <div style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem' }}>{p.sub}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#111827' }}>R$ {p.price.toFixed(2).replace('.', ',')}</div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setEditingProduct(p); }}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                  <Pencil size={16} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
function ClientesTab() {
  const [clientes, setClientes] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`${API}/api/merchants/customers`, {
      headers: { 'Authorization': `Bearer ${token()}` }
    })
    .then(r => r.json())
    .then(d => { setClientes(d || []); setLoading(false); })
    .catch(() => setLoading(false));
  }, []);

  const filtered = (clientes || []).filter(c => 
    (c.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.id || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <SectionHeader icon={<Users size={22} />} title="Clientes" sub="Gerenciamento de compradores e histórico de relacionamento." />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Pesquisar por ID, e-mail, nome..." 
            style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '0.8rem 1rem 0.8rem 2.8rem', color: '#111827', outline: 'none', fontSize: '0.9rem' }} 
          />
        </div>
        <button style={{ background: '#c084fc', color: '#4c1d95', border: 'none', borderRadius: 12, padding: '0.8rem 1.8rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
           <Plus size={18} strokeWidth={3} /> Cadastrar cliente
        </button>
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
              <th style={{ padding: '1.2rem 1.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>ID</th>
              <th style={{ padding: '1.2rem 1.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>Nome</th>
              <th style={{ padding: '1.2rem 1.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>E-mail</th>
              <th style={{ padding: '1.2rem 1.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>Data de Criação</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>Carregando clientes...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>Nenhum cliente encontrado.</td></tr>
            ) : filtered.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1.2rem 1.5rem', color: '#94a3b8', fontSize: '0.82rem' }}>{c.id}</td>
                <td style={{ padding: '1.2rem 1.5rem', color: '#111827', fontSize: '0.88rem', fontWeight: 700 }}>{c.name}</td>
                <td style={{ padding: '1.2rem 1.5rem', color: '#111827', fontSize: '0.88rem' }}>{c.email}</td>
                <td style={{ padding: '1.2rem 1.5rem', color: '#64748b', fontSize: '0.85rem' }}>{fmtDate(c.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: FINANCEIRO
// ══════════════════════════════════════════════════════════════════════════════
function SaquesTab({ data }: { data: DashboardData }) {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [saqueModal, setSaqueModal] = useState(false);

  const saldo = data.saldo_lojista || 0;

  const fetchWithdrawals = () => {
    fetch(`${API}/api/merchants/withdrawals`, {
      headers: { 'Authorization': `Bearer ${token()}` }
    })
    .then(r => r.json())
    .then(d => { setWithdrawals(d || []); setLoading(false); })
    .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const filtered = (withdrawals || []).filter(w => {
    const matchStatus = statusFilter === 'todos' || w.status === statusFilter;
    const matchSearch = !search || String(w.id).includes(search) || String(w.amount).includes(search);
    return matchStatus && matchSearch;
  });

  return (
     <div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', marginBottom: '2.5rem', letterSpacing: '-0.02em' }}>Saques</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2.5rem' }}>
           <SaqueMiniCard label="Disponível para antecipar (D+2)" value={0} actionLabel="Antecipar" icon={<Zap size={14} />} />
           <SaqueMiniCard label="Antecipação em processamento" value={0} actionLabel="Ver status" icon={<Clock size={14} />} />
           <SaqueMiniCard label="Valor bloqueado em disputas" value={0} actionLabel="Ver disputas" icon={<Lock size={14} />} />
           
           <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 700 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 8, background: '#f8fafc', display: 'grid', placeItems: 'center', border: '1px solid #f1f5f9' }}><Banknote size={15} /></div>
                    Disponível para saque
                 </div>
                 <Info size={14} color="#94a3b8" />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.2rem' }}>
                 <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>{fmt(saldo)}</div>
                 <button onClick={() => setSaqueModal(true)} style={{ background: '#c084fc', color: '#4c1d95', border: 'none', borderRadius: 12, padding: '0.7rem 1.4rem', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    Sacar <ChevronRight size={18} strokeWidth={3} />
                 </button>
              </div>

              <div style={{ marginTop: '1.2rem' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>
                    <span>Limite diário de saques: R$ 0,00 / R$ 5.000,00</span>
                    <Info size={12} />
                 </div>
                 <div style={{ width: '100%', height: 7, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: '0%', height: '100%', background: '#c084fc' }} />
                 </div>
              </div>
           </Card>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1 }}>
                <div style={{ position: 'relative', width: '340px' }}>
                    <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar por ID, valor" style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '0.75rem 1rem 0.75rem 2.8rem', color: '#111827', fontSize: '0.9rem', outline: 'none' }} />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '0.75rem 1.2rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 600, outline: 'none', cursor: 'pointer', minWidth: '160px' }}>
                    <option value="todos">Status</option>
                    <option value="pending">Pendente</option>
                    <option value="paid">Pago</option>
                </select>
            </div>
            <button style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '0.75rem 1.5rem', color: '#374151', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <Upload size={18} /> Exportar
            </button>
        </div>

        <Card style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                        <th style={{ padding: '1.2rem 1.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>ID de pagamento</th>
                        <th style={{ padding: '1.2rem 1.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>Valor</th>
                        <th style={{ padding: '1.2rem 1.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>Status</th>
                        <th style={{ padding: '1.2rem 1.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>Criação</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                         <tr><td colSpan={4} style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>Carregando histórico...</td></tr>
                    ) : filtered.length === 0 ? (
                        <tr><td colSpan={4} style={{ padding: '5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.95rem' }}>Nenhum dado encontrado</td></tr>
                    ) : filtered.map(w => (
                        <tr key={w.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '1.2rem 1.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>#{w.id}</td>
                            <td style={{ padding: '1.2rem 1.5rem', color: '#111827', fontSize: '0.9rem', fontWeight: 800 }}>{fmt(w.amount)}</td>
                            <td style={{ padding: '1.2rem 1.5rem' }}><StatusBadge status={w.status} /></td>
                            <td style={{ padding: '1.2rem 1.5rem', color: '#64748b', fontSize: '0.85rem' }}>{fmtDate(w.created_at)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Card>

        {saqueModal && <SaqueModal onClose={() => setSaqueModal(false)} saldo={saldo} onSucess={() => { fetchWithdrawals(); }} />}
     </div>
  );
}

function SaqueMiniCard({ label, value, actionLabel, icon }: any) {
    return (
        <Card style={{ padding: '1.5rem', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 700 }}>
                    {icon} {label}
                </div>
                <Info size={14} color="#94a3b8" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>{fmt(value)}</div>
                <button style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '0.5rem 1rem', color: '#374151', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', transition: 'all .2s' }}>
                    {actionLabel}
                </button>
            </div>
        </Card>
    );
}

function SaqueModal({ onClose, saldo, onSucess }: { onClose: () => void; saldo: number; onSucess: () => void }) {
  const [valor, setValor] = useState('');
  const [chave, setChave] = useState('');
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);

  const handleSaque = () => {
    setLoading(true);
    fetch(`${API}/api/merchants/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token()}` },
      body: JSON.stringify({ amount: parseFloat(valor), pix_key: chave })
    })
    .then(r => r.ok ? r.json() : r.json().then(e => { throw e; }))
    .then(() => { setOk(true); onSucess(); })
    .catch(e => alert(e.error || 'Erro ao processar saque'))
    .finally(() => setLoading(false));
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '450px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        {ok ? (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0fdf4', color: '#22c55e', display: 'grid', placeItems: 'center', margin: '0 auto 1.5rem' }}>
              <Check size={32} strokeWidth={3} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>Saque Solicitado!</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>Seu pedido está em processamento e será pago em instantes.</p>
            <button onClick={onClose} style={{ width: '100%', background: '#111827', color: '#fff', border: 'none', borderRadius: 12, padding: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>Fechar</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827' }}>Solicitar Saque</h3>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><XCircle size={24} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', color: '#64748b', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>Valor do Saque</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#94a3b8' }}>R$</span>
                  <input type="number" value={valor} onChange={e => setValor(e.target.value)} placeholder="0,00" style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '0.8rem 1rem 0.8rem 2.5rem', fontSize: '1.1rem', fontWeight: 800, outline: 'none' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', color: '#64748b', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>Chave PIX de Destino</label>
                <input value={chave} onChange={e => setChave(e.target.value)} placeholder="E-mail, CPF ou Chave Aleatória" style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '0.8rem 1rem', fontSize: '0.95rem', fontWeight: 600, outline: 'none' }} />
              </div>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 12, border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Saldo disponível</span>
                  <span style={{ color: '#111827', fontWeight: 800 }}>{fmt(saldo)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Taxa de transferência</span>
                  <span style={{ color: '#22c55e', fontWeight: 800 }}>Grátis</span>
                </div>
              </div>
              <button
                disabled={loading || !valor || !chave || parseFloat(valor) > saldo || parseFloat(valor) <= 0}
                onClick={handleSaque}
                style={{ width: '100%', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 12, padding: '1rem', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', opacity: (loading || !valor || !chave || parseFloat(valor) > saldo || parseFloat(valor) <= 0) ? 0.5 : 1, transition: 'all .2s' }}>
                {loading ? 'Processando...' : 'Confirmar Saque'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// TAB: CUPONS
// ══════════════════════════════════════════════════════════════════════════════
function CuponsTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.04em' }}>Cupons</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            style={{ background: '#c084fc', color: '#4c1d95', border: 'none', borderRadius: 12, padding: '0.85rem 1.8rem', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', boxShadow: '0 4px 14px rgba(192, 132, 252, 0.3)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(192, 132, 252, 0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(192, 132, 252, 0.3)'; }}
          >
            <Plus size={20} strokeWidth={3} /> Criar cupom
          </button>
       </div>

       <Card style={{ padding: '2rem', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.02)' }}>
          <div style={{ position: 'relative', width: '420px', marginBottom: '2.5rem' }}>
             <Search size={18} style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
             <input 
               value={search} 
               onChange={e => setSearch(e.target.value)} 
               placeholder="Pesquisar por código" 
               style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1rem 1rem 1rem 3.5rem', color: '#111827', fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s' }}
               onFocus={e => { e.currentTarget.style.borderColor = '#8942FC'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(137,66,252,0.05)'; }}
               onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.boxShadow = 'none'; }}
             />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
               <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                     <th style={{ padding: '1.2rem 1.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Código</th>
                     <th style={{ padding: '1.2rem 1.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resgatados</th>
                     <th style={{ padding: '1.2rem 1.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Limites de Resgates</th>
                     <th style={{ padding: '1.2rem 1.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Desconto</th>
                     <th style={{ padding: '1.2rem 1.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Criação</th>
                     <th style={{ padding: '1.2rem 1.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                     <th style={{ padding: '1.2rem 1.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ações</th>
                  </tr>
               </thead>
               <tbody>
                  <tr>
                     <td colSpan={7} style={{ padding: '8rem 2rem', textAlign: 'center', color: '#94a3b8', fontSize: '1rem', fontWeight: 500 }}>Nenhum dado encontrado</td>
                  </tr>
               </tbody>
            </table>
          </div>
       </Card>

       {isModalOpen && <CreateCouponModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}

function CreateCouponModal({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease-out' }}>
       <Card style={{ width: '100%', maxWidth: '520px', padding: 0, overflow: 'hidden', animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)', border: '1px solid #f1f5f9' }}>
          <style>{`
            @keyframes modalSlideUp { 
              from { transform: translateY(30px) scale(0.98); opacity: 0; } 
              to { transform: translateY(0) scale(1); opacity: 1; } 
            }
          `}</style>
          
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.5rem', borderRadius: '10px', transition: 'background 0.2s', display: 'grid', placeItems: 'center' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                   <ArrowLeft size={20} />
                </button>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>Criar cupom</h3>
             </div>
             <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0.5rem', borderRadius: '10px', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; }}>
                <XCircle size={22} />
             </button>
          </div>

          <div style={{ padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <label style={{ display: 'block', color: '#64748b', fontSize: '0.85rem', fontWeight: 700, marginLeft: '4px' }}>Código</label>
                <input placeholder="Nome do cupom" style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1rem 1.25rem', color: '#111827', fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s' }} onFocus={e => e.currentTarget.style.borderColor = '#8942FC'} onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'} />
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <label style={{ display: 'block', color: '#64748b', fontSize: '0.85rem', fontWeight: 700, marginLeft: '4px' }}>Tipo de desconto</label>
                <div style={{ position: 'relative' }}>
                   <select style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1rem 1.25rem', color: '#111827', fontSize: '0.95rem', outline: 'none', appearance: 'none', cursor: 'pointer', transition: 'all 0.2s' }} onFocus={e => e.currentTarget.style.borderColor = '#8942FC'} onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
                      <option>Fixo</option>
                      <option>Percentual</option>
                   </select>
                   <ChevronDown size={18} color="#94a3b8" style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <label style={{ display: 'block', color: '#64748b', fontSize: '0.85rem', fontWeight: 700, marginLeft: '4px' }}>Desconto</label>
                <input placeholder="Desconto" style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1rem 1.25rem', color: '#111827', fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s' }} onFocus={e => e.currentTarget.style.borderColor = '#8942FC'} onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'} />
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <label style={{ display: 'block', color: '#64748b', fontSize: '0.85rem', fontWeight: 700, marginLeft: '4px' }}>Quantidade máxima de utilizações</label>
                <input placeholder="Quantidade máxima de utilizações (-1 = infinito)" style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1rem 1.25rem', color: '#111827', fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s' }} onFocus={e => e.currentTarget.style.borderColor = '#8942FC'} onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'} />
             </div>

             <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button onClick={onClose} style={{ background: '#c084fc', color: '#4c1d95', border: 'none', borderRadius: 12, padding: '1rem 3rem', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(192, 132, 252, 0.3)', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(192, 132, 252, 0.4)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(192, 132, 252, 0.3)'; }}>
                   Salvar
                </button>
             </div>
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
// ══════════════════════════════════════════════════════════════════════════════
// TAB: API INTEGRATION
// ══════════════════════════════════════════════════════════════════════════════

function ClickableKey({ apiKey }: { apiKey: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const masked = apiKey ? (apiKey.substring(0, 11) + '...' + apiKey.slice(-3)) : '';

  return (
    <div onClick={handleCopy} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', position: 'relative', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#8942FC'} onMouseLeave={e => e.currentTarget.style.color = 'inherit'}>
      <span>{copied ? <span style={{ color: '#22c55e', fontWeight: 700 }}>Copiado!</span> : masked}</span>
    </div>
  );
}

function ActionMenu({ env, onDelete }: { env: 'live' | 'test', onDelete: (env: 'live' | 'test') => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block', textAlign: 'left' }}>
      <button onClick={() => setIsOpen(!isOpen)} style={{ background: '#f8fafc', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'inline-grid', placeItems: 'center', cursor: 'pointer', color: '#94a3b8', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#111827'; }} onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#94a3b8'; }}>
        <MoreHorizontal size={18} />
      </button>
      {isOpen && (
        <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '0.3rem', background: '#fff', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)', minWidth: '150px', zIndex: 10, padding: '0.5rem', animation: 'fadeIn 0.15s ease-out' }}>
          <button style={{ width: '100%', textAlign: 'left', padding: '0.6rem 0.8rem', background: 'transparent', border: 'none', color: '#111827', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', borderRadius: '6px', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            Ver Logs
          </button>
          <div style={{ height: '1px', background: '#f1f5f9', margin: '0.2rem 0' }} />
          <button 
            onClick={() => { setIsOpen(false); onDelete(env); }}
            style={{ width: '100%', textAlign: 'left', padding: '0.6rem 0.8rem', background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', borderRadius: '6px', transition: 'background 0.2s' }} 
            onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'} 
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            Excluir
          </button>
        </div>
      )}
    </div>
  );
}

function APITab() {
	const [keyData, setKeyData] = useState<APIKeyData | null>(null);
	const [loading, setLoading] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const fetchKey = () => {
		fetch(`${API}/api/merchants/apikey`, { headers: { 'Authorization': `Bearer ${token()}` } })
			.then(r => r.json()).then((d: APIKeyData) => { setKeyData(d); setLoading(false); });
	};
	useEffect(() => { fetchKey(); }, []);

  const handleDeleteKey = async (env: 'live' | 'test') => {
    if (!window.confirm(`Tem certeza que deseja excluir sua chave de ${env === 'live' ? 'Produção' : 'Testes'}? Integrações usando essa chave vão parar de funcionar.`)) return;
    
    try {
      const res = await fetch(`${API}/api/merchants/apikey`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ environment: env })
      });
      if (res.ok) {
        alert("Chave excluída com sucesso.");
        fetchKey();
      } else {
        const error = await res.json();
        alert("Erro ao excluir chave: " + error.error);
      }
    } catch (err) {
      alert("Erro de conexão ao excluir chave.");
    }
  };

	if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>Carregando dados da API...</div>;

	return (
		<div style={{ animation: 'fadeIn 0.3s ease-out' }}>
			<h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', marginBottom: '1.8rem', letterSpacing: '-0.02em' }}>Integração com API</h2>

			{/* Stats Cards Row */}
			<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
				<Card style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem' }}>
					<div>
						<div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Suas Chamadas</div>
						<div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>--</div>
					</div>
					<ChevronRight size={20} color="#e2e8f0" />
				</Card>

				<Card style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem' }}>
					<div>
						<div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Uptime</div>
						<div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>99.98%</div>
					</div>
					<Info size={18} color="#e2e8f0" />
				</Card>

				<Card style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem' }}>
					<div>
						<div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Status atual</div>
						<div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
							Ativo
						</div>
					</div>
					<div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 12px rgba(34,197,94,0.4)' }} />
				</Card>
			</div>

			{/* Controls Row */}
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
				<div style={{ position: 'relative', width: '320px' }}>
					<Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
					<input 
						placeholder="Pesquisar por ID, valor" 
						style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '0.75rem 1rem 0.75rem 2.8rem', fontSize: '0.9rem', outline: 'none' }} 
					/>
				</div>
				<button onClick={() => setIsModalOpen(true)} style={{ background: '#c084fc', color: '#4c1d95', border: 'none', borderRadius: 10, padding: '0.7rem 1.4rem', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}>
					<Plus size={20} strokeWidth={3} /> Nova chave
				</button>
			</div>

			{/* Keys Table */}
			<Card style={{ padding: 0, overflow: 'visible' }}>
				<table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
					<thead>
						<tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
							<th style={{ padding: '1.2rem 1.5rem', color: '#64748b', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', borderTopLeftRadius: 16 }}>Chave</th>
							<th style={{ padding: '1.2rem 1.5rem', color: '#64748b', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase' }}>Desc.</th>
							<th style={{ padding: '1.2rem 1.5rem', color: '#64748b', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase' }}>Versão</th>
							<th style={{ padding: '1.2rem 1.5rem', color: '#64748b', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase' }}>Status</th>
							<th style={{ padding: '1.2rem 1.5rem', color: '#64748b', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase' }}>Criação</th>
							<th style={{ padding: '1.2rem 1.5rem', color: '#64748b', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'right', borderTopRightRadius: 16 }}>Ações</th>
						</tr>
					</thead>
					<tbody>
            {keyData && (
              <>
                {/* Linha da Chave Live */}
                {keyData.api_key && keyData.api_key !== '' && (
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1.2rem 1.5rem', color: '#64748b', fontSize: '0.88rem', fontFamily: 'monospace' }}>
                      <ClickableKey apiKey={keyData.api_key} />
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem', color: '#111827', fontSize: '0.88rem', fontWeight: 600 }}>API TICKET</td>
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      <span style={{ background: '#f1f5f9', color: '#475569', padding: '0.25rem 0.6rem', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700 }}>API A1</span>
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      <div style={{ background: '#dcfce7', color: '#166534', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.6rem', borderRadius: 99, fontSize: '0.75rem', fontWeight: 800 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} /> Ativo
                      </div>
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem', color: '#64748b', fontSize: '0.85rem' }}>Hoje</td>
                    <td style={{ padding: '1.2rem 1.5rem', textAlign: 'right' }}>
                      <ActionMenu env="live" onDelete={handleDeleteKey} />
                    </td>
                  </tr>
                )}

                {/* Linha da Chave Teste */}
                {keyData.api_key_test && keyData.api_key_test !== '' && (
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1.2rem 1.5rem', color: '#64748b', fontSize: '0.88rem', fontFamily: 'monospace' }}>
                      <ClickableKey apiKey={keyData.api_key_test} />
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem', color: '#111827', fontSize: '0.88rem', fontWeight: 600 }}>API TICKET (TESTE)</td>
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      <span style={{ background: '#f1f5f9', color: '#475569', padding: '0.25rem 0.6rem', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700 }}>API A1</span>
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      <div style={{ background: '#fef3c7', color: '#d97706', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.6rem', borderRadius: 99, fontSize: '0.75rem', fontWeight: 800 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} /> Ativo
                      </div>
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem', color: '#64748b', fontSize: '0.85rem' }}>Hoje</td>
                    <td style={{ padding: '1.2rem 1.5rem', textAlign: 'right' }}>
                      <ActionMenu env="test" onDelete={handleDeleteKey} />
                    </td>
                  </tr>
                )}
              </>
            )}
					</tbody>
				</table>
			</Card>

			{isModalOpen && <CreateApiKeyModal onClose={() => setIsModalOpen(false)} onSuccess={() => { fetchKey(); setIsModalOpen(false); }} />}
		</div>
	);
}

function CreateApiKeyModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [version, setVersion] = useState<'v1' | 'v2'>('v2');
  const [environment, setEnvironment] = useState('live');
  const [permissions, setPermissions] = useState('pix,card');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = () => {
    setLoading(true);
    fetch(`${API}/api/merchants/apikey/rotate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token()}` },
      body: JSON.stringify({ environment, capabilities: permissions })
    })
    .then(r => r.ok ? r.json() : r.json().then(e => { throw e; }))
    .then(() => onSuccess())
    .catch(e => alert(e.error || 'Erro ao gerar chave API'))
    .finally(() => setLoading(false));
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease-out' }}>
      <Card style={{ width: '100%', maxWidth: '480px', padding: 0, overflow: 'hidden', border: '1px solid #f1f5f9', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}><ArrowLeft size={20} /></button>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', margin: 0 }}>Nova chave</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}><XCircle size={20} /></button>
        </div>

        <div style={{ padding: '2rem 1.5rem', background: '#fcfcfd' }}>
          {/* Versão da API */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '0.75rem' }}>Versão da API</label>
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: 8, marginBottom: '0.5rem' }}>
              <button 
                style={{ flex: 1, background: '#8942FC', border: 'none', borderRadius: 6, padding: '0.6rem', fontWeight: 700, fontSize: '0.85rem', color: '#fff', cursor: 'default', boxShadow: '0 2px 5px rgba(137,66,252,0.3)' }}>
                API A1
              </button>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>A1: Checkout, Assinaturas, Transparente e recursos compartilhados.</div>
          </div>

          {/* Escopo */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '0.5rem' }}>Escopo</label>
            <div style={{ position: 'relative' }}>
              <select value={environment} onChange={e => setEnvironment(e.target.value)} style={{ width: '100%', appearance: 'none', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '0.8rem 1rem', fontSize: '0.95rem', color: '#111827', outline: 'none' }}>
                <option value="live">Produção (Live)</option>
                <option value="test">Teste (Sandbox)</option>
              </select>
              <ChevronDown size={18} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            </div>
          </div>

          {/* Permissões */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '0.5rem' }}>Permissões</label>
            <div style={{ position: 'relative' }}>
              <select value={permissions} onChange={e => setPermissions(e.target.value)} style={{ width: '100%', appearance: 'none', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '0.8rem 1rem', fontSize: '0.95rem', color: '#111827', outline: 'none' }}>
                <option value="pix,card,subscriptions">Acesso Total (PIX, Cartão, Assinaturas)</option>
                <option value="pix">Apenas PIX</option>
                <option value="card">Apenas Cartão</option>
              </select>
              <ChevronDown size={18} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            </div>
          </div>

          {/* Descrição */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '0.5rem' }}>Descrição</label>
            <input 
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Digite a descrição (ex: Integração WooCommerce)" 
              style={{ width: '100%', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '0.8rem 1rem', fontSize: '0.95rem', color: '#111827', outline: 'none' }} 
            />
          </div>

          {/* Botões */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button onClick={onClose} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '0.7rem 1.4rem', color: '#374151', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
              Voltar
            </button>
            <button 
              onClick={handleCreate}
              disabled={loading}
              style={{ background: '#8942FC', border: 'none', borderRadius: 10, padding: '0.7rem 1.4rem', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Criando...' : 'Criar'}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}



// ══════════════════════════════════════════════════════════════════════════════
// TAB: CONTA / KYC
// ══════════════════════════════════════════════════════════════════════════════
function ContaTab({ data }: { data: any }) {
  return (
    <div>
      <SectionHeader icon={<User size={22} />} title="Minha Conta" sub="Gerencie seu perfil, verifique sua empresa (KYC) e configure taxas." />

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Perfil & Dados da Empresa */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.8rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ width: 68, height: 68, borderRadius: 18, background: '#8942FC', display: 'grid', placeItems: 'center', color: '#fff', fontSize: '1.8rem', fontWeight: 800, boxShadow: '0 4px 15px rgba(137,66,252,0.3)' }}>
              {data.role === 'master' ? 'MA' : 'LJ'}
            </div>
            <div>
              <h3 style={{ color: '#111827', fontWeight: 800, fontSize: '1.2rem' }}>{data.role === 'master' ? 'Master Admin' : 'Minha Loja'}</h3>
              <div style={{ color: '#6b7280', fontSize: '0.88rem', marginTop: '0.2rem' }}>Cadastro Ativo</div>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', color: '#6b7280', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.4rem' }}>NOME FANTASIA (SUA LOJA)</label>
              <input placeholder="Digite o nome da sua loja" style={{ width: '100%', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.75rem', color: '#111827', fontSize: '0.9rem', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#6b7280', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.4rem' }}>E-MAIL COMERCIAL</label>
              <input placeholder="seuemail@exemplo.com" style={{ width: '100%', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.75rem', color: '#111827', fontSize: '0.9rem', outline: 'none' }} />
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
                  <div style={{ color: '#111827', fontSize: '0.85rem' }}>Taxa Checkout PIX</div>
                  <div style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.2rem' }}>Acordo comercial vigente</div>
                </div>
                <div style={{ color: '#f59e0b', fontWeight: 800, fontSize: '1.1rem' }}>0,99%</div>
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
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['PRINCIPAL', 'SUA LOJA', 'INTEGRAÇÃO', 'CONTA', 'GESTÃO', 'FINANCEIRO', 'SEGURANÇA', 'SISTEMA']);
  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]);
  };

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

  // Determina se é admin/master para inicializar a tab correta
  const isMaster = data ? (data.role === 'master' || data.role === 'admin') : false;

  useEffect(() => {
    fetchData(isSandbox);
  }, [navigate]);

  // Inicializa a tab ativa para admin (DEVE ficar antes dos early returns)
  useEffect(() => {
    if (isMaster && (activeTab === 'overview' || activeTab === 'financeiro')) {
      setActiveTab('admin-overview');
    }
  }, [isMaster, data?.role]);

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

  // isMaster já foi calculado antes dos early returns



  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const merchantTabs: { id: Tab; icon: React.ReactElement; label: string; group?: string }[] = [
    { id: 'overview',        icon: <LayoutDashboard size={18} />, label: 'Dashboard', group: 'PRINCIPAL' },
    
    // Grupo SUA LOJA
    { id: 'produtos',        icon: <ShoppingBag size={18} />,     label: 'Produtos', group: 'SUA LOJA' },
    { id: 'cupons',          icon: <Ticket size={18} />,          label: 'Cupons', group: 'SUA LOJA' },
    { id: 'clientes',        icon: <Users size={18} />,           label: 'Clientes', group: 'SUA LOJA' },
    { id: 'assinaturas',     icon: <Repeat size={18} />,          label: 'Assinaturas', group: 'SUA LOJA' },
    { id: 'cobrancas',       icon: <FileText size={18} />,        label: 'Cobranças', group: 'SUA LOJA' },
    { id: 'antecipacoes',    icon: <Zap size={18} />,             label: 'Antecipações', group: 'SUA LOJA' },
    { id: 'link-pagamentos', icon: <LinkIcon size={18} />,        label: 'Link de pagamentos', group: 'SUA LOJA' },
    { id: 'financeiro',      icon: <Banknote size={18} />,        label: 'Saques', group: 'SUA LOJA' },
    { id: 'extrato',         icon: <List size={18} />,            label: 'Extrato', group: 'SUA LOJA' },
    { id: 'disputas',        icon: <Undo2 size={18} />,           label: 'Disputas', group: 'SUA LOJA' },

    // Grupo INTEGRAÇÃO
    { id: 'docs',            icon: <BookOpen size={18} />,        label: 'Documentação', group: 'INTEGRAÇÃO' },
    { id: 'api-keys',        icon: <Key size={18} />,             label: 'API', group: 'INTEGRAÇÃO' },
    { id: 'webhook',         icon: <Radio size={18} />,           label: 'Webhook', group: 'INTEGRAÇÃO' },
    { id: 'plugins',         icon: <Puzzle size={18} />,          label: 'Plugins', group: 'INTEGRAÇÃO' },
    { id: 'roadmap',         icon: <Layers size={18} />,          label: 'Roadmap', group: 'INTEGRAÇÃO' },
    
    { id: 'conta',           icon: <User size={18} />,            label: 'Configurações', group: 'CONTA' },
  ];

  const adminTabs: { id: Tab; icon: React.ReactElement; label: string; group?: string }[] = [
    { id: 'admin-overview',     icon: <LayoutDashboard size={18} />, label: 'Visão Global', group: 'GESTÃO' },
    { id: 'admin-users',        icon: <Users size={18} />,           label: 'Comunidade', group: 'GESTÃO' },
    { id: 'admin-transactions',  icon: <List size={18} />,            label: 'Transações CORE', group: 'GESTÃO' },
    { id: 'admin-finance',      icon: <Banknote size={18} />,        label: 'Financeiro', group: 'FINANCEIRO' },
    { id: 'admin-withdrawals',  icon: <Download size={18} />,        label: 'Saques Cashouts', group: 'FINANCEIRO' },
    { id: 'admin-fraud',        icon: <ShieldAlert size={18} />,     label: 'Segurança Risco', group: 'SEGURANÇA' },
    { id: 'admin-audit',        icon: <History size={18} />,         label: 'Logs Auditoria', group: 'SEGURANÇA' },
    { id: 'admin-integrations', icon: <Zap size={18} />,             label: 'Integrações', group: 'SISTEMA' },
    { id: 'admin-demo',         icon: <ShoppingBag size={18} />,     label: 'Simular Loja', group: 'SISTEMA' },
    { id: 'admin-reports',      icon: <TrendingUp size={18} />,      label: 'Relatórios', group: 'SISTEMA' },
    { id: 'admin-access',       icon: <Lock size={18} />,            label: 'Governança', group: 'SISTEMA' },
  ];

  const currentTabs = isMaster ? adminTabs : merchantTabs;
  const groups = isMaster ? ['GESTÃO', 'FINANCEIRO', 'SEGURANÇA', 'SISTEMA'] : ['PRINCIPAL', 'SUA LOJA', 'INTEGRAÇÃO', 'CONTA'];

  const renderBreadcrumbs = () => {
    const currentTabObj = currentTabs.find(t => t.id === activeTab);
    if (!currentTabObj) return null;

    const getGroupIcon = (group: string) => {
      switch(group) {
        case 'SUA LOJA': return <Store size={18} />;
        case 'INTEGRAÇÃO': return <SlidersHorizontal size={18} />;
        case 'GESTÃO': return <Shield size={18} />;
        case 'FINANCEIRO': return <Banknote size={18} />;
        case 'SEGURANÇA': return <Lock size={18} />;
        case 'SISTEMA': return <Settings size={18} />;
        default: return <Folder size={18} />;
      }
    };

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#94a3b8', fontSize: '0.95rem', fontWeight: 600 }}>
        {currentTabObj.group && currentTabObj.group !== 'PRINCIPAL' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#64748b' }}>
               {React.cloneElement(getGroupIcon(currentTabObj.group) as React.ReactElement<any>, { strokeWidth: 2.5 })}
               <span>{currentTabObj.group === 'SUA LOJA' ? 'Sua Loja' : currentTabObj.group.charAt(0) + currentTabObj.group.slice(1).toLowerCase()}</span>
            </div>
            <span style={{ color: '#e2e8f0', fontWeight: 400, fontSize: '1.2rem' }}>/</span>
          </>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#111827' }}>
          {React.cloneElement(currentTabObj.icon as React.ReactElement<any>, { size: 18, strokeWidth: 2.5 })}
          <span style={{ fontWeight: 700 }}>{currentTabObj.label}</span>
        </div>
      </div>
    );
  };

  // (useEffect de admin tab movido para antes dos early returns)

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
              {isMaster ? <Shield size={14} color="#8942FC" /> : <Building size={14} color="#6b7280" />}
            </div>
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#374151' }}>{isMaster ? 'Admin Panel' : 'Minha Loja'}</span>
          </div>
          <ChevronDown size={16} color="#94a3b8" />
        </div>

        {/* Navigation Groups */}
        <div style={{ flex: 1, padding: '0 0.75rem', overflowY: 'auto' }}>
          {groups.map(group => {
            const isExpanded = expandedGroups.includes(group);
            const isCollapsible = group === 'SUA LOJA' || group === 'INTEGRAÇÃO';
            const groupTabs = currentTabs.filter(t => t.group === group);
            const isAnyTabActive = groupTabs.some(t => t.id === activeTab);

            return (
              <div key={group} style={{ marginBottom: '0.75rem' }}>
                {group !== 'PRINCIPAL' && (
                  <div 
                    onClick={() => isCollapsible && toggleGroup(group)}
                    style={{ 
                      padding: '0.7rem 0.75rem', 
                      fontSize: '0.88rem', 
                      fontWeight: 700, 
                      color: isAnyTabActive ? '#111827' : '#64748b', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      cursor: isCollapsible ? 'pointer' : 'default',
                      borderRadius: '10px',
                      border: (isCollapsible && isAnyTabActive) ? '1px solid #8942FC' : '1px solid transparent',
                      background: (isCollapsible && isAnyTabActive && !isExpanded) ? 'rgba(137,66,252,0.05)' : 'transparent',
                      marginBottom: '0.25rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {group === 'SUA LOJA' && <ShoppingBag size={18} color={isAnyTabActive ? '#8942FC' : '#94a3b8'} />}
                      {group === 'INTEGRAÇÃO' && <SlidersHorizontal size={18} color={isAnyTabActive ? '#8942FC' : '#94a3b8'} />}
                      <span style={{ textTransform: 'capitalize', fontSize: '0.9rem' }}>{group.toLowerCase()}</span>
                    </div>
                    {isCollapsible && (
                      isExpanded ? <ChevronDown size={16} color="#94a3b8" /> : <ChevronRight size={16} color="#94a3b8" />
                    )}
                  </div>
                )}

                {isExpanded && (
                  <div style={{ marginLeft: isCollapsible ? '0.5rem' : '0', borderLeft: isCollapsible ? '1px solid #f1f5f9' : 'none', paddingLeft: isCollapsible ? '0.5rem' : '0' }}>
                    {groupTabs.map(tab => (
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
                )}
              </div>
            );
          })}
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
              {isMaster ? 'MA' : (data.role === 'admin' ? 'AD' : 'LJ')}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{isMaster ? 'Master User' : 'Minha Loja'}</div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{isMaster ? 'Sistema Master' : (data.role === 'admin' ? 'Administrador' : 'Lojista')}</div>
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
          {renderBreadcrumbs()}
          
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
          {/* Merchant Tabs */}
          {activeTab === 'overview'   && <OverviewTab data={data} />}
          {activeTab === 'assinaturas' && <AssinaturasTab />}
          {activeTab === 'produtos'   && <ProdutosTab />}
          {activeTab === 'cupons'     && <CuponsTab />}
          {activeTab === 'clientes'   && <ClientesTab />}
          {activeTab === 'financeiro' && <SaquesTab data={data} />}
          {activeTab === 'pagamentos' && <PagamentosTab data={data} />}
          {activeTab === 'antifraude' && <AntifraudeTab data={data} />}
          {activeTab === 'api-keys'    && <APITab />}
          {activeTab === 'conta'      && <ContaTab data={data} />}

          {/* Admin Tabs */}
          {activeTab === 'admin-overview'     && <AdminOverview data={data} />}
          {activeTab === 'admin-users'        && <AdminUsers data={data} />}
          {activeTab === 'admin-transactions' && <AdminTransactions data={data} />}
          {activeTab === 'admin-finance'      && <AdminFinance data={data} />}
          {activeTab === 'admin-withdrawals'  && <AdminWithdrawals data={data} />}
          {activeTab === 'admin-fraud'        && <AdminFraud data={data} />}
          {activeTab === 'admin-audit'        && <AdminAudit data={data} />}
          {activeTab === 'admin-integrations' && <AdminIntegrations data={data} />}
          {activeTab === 'admin-demo'         && <DemoStore />}
          {activeTab === 'admin-reports'      && <AdminReports data={data} />}
          {activeTab === 'admin-access'       && <AdminAccessControl data={data} />}
        </div>
      </main>
    </div>
  );
}
