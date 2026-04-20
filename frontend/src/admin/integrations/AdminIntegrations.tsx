import type { DashboardData } from '../types';
import { SectionHeader, Card } from '../AdminComponents';
import { Terminal, Activity, Zap, PlayCircle } from 'lucide-react';

export function AdminIntegrations({ data }: { data: DashboardData }) {
  return (
    <div>
      <SectionHeader icon={<Zap size={22} />} title="Integrações Externas & Dev" sub="Monitoramento de APIs do BaaS, Webhooks e Ferramentas de QA Internas." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <Card>
          <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={16} color="#8942FC" /> Monitoramento
          </h3>
          <ul style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', paddingLeft: '1.2rem' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>Status do PIX <span style={{ color: '#22c55e', fontWeight: 700 }}>ONLINE</span></li>
            <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>Adquirente Cartão <span style={{ color: '#22c55e', fontWeight: 700 }}>ONLINE</span></li>
            <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>API Antifraude <span style={{ color: '#f59e0b', fontWeight: 700 }}>HIGH LATENCY</span></li>
          </ul>
        </Card>

        <Card>
          <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Terminal size={16} color="#ef4444" /> Logs de Sistema (Erros)
          </h3>
          <ul style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', paddingLeft: '1.2rem' }}>
            <li>Falhas de comunicação HTTP</li>
            <li>Timeouts em Webhooks</li>
            <li>Erros internos da API (500)</li>
          </ul>
        </Card>

        <Card style={{ border: '1px solid rgba(137,66,252,0.4)', background: 'linear-gradient(180deg, #13151a 0%, #0b0c10 100%)' }}>
          <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlayCircle size={16} color="#8942FC" /> Ferramentas Internas Mocks
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <button style={{ background: 'transparent', border: '1px solid #22242c', color: '#fff', padding: '0.6rem 1rem', borderRadius: 6, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left' }}>Simular Pagamento Fake</button>
            <button style={{ background: 'transparent', border: '1px solid #22242c', color: '#fff', padding: '0.6rem 1rem', borderRadius: 6, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left' }}>Disparar Webhook Mock</button>
            <button style={{ background: 'transparent', border: '1px solid #22242c', color: '#fff', padding: '0.6rem 1rem', borderRadius: 6, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left' }}>Reprocessar Fila Lenta</button>
            <button style={{ background: 'transparent', border: '1px solid #22242c', color: '#fff', padding: '0.6rem 1rem', borderRadius: 6, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left' }}>Testar Regra Antifraude</button>
          </div>
        </Card>
      </div>
    </div>
  );
}
