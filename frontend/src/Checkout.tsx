import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from './api';
import { CheckCircle, Copy, RefreshCw, X } from 'lucide-react';

export default function Checkout() {
  const { id } = useParams<{id: string}>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [intent, setIntent] = useState<any>(null);
  const [pixData, setPixData] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutos
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Buscar detalhes da intenção
    fetch(`${API_BASE_URL}/api/pagamentos/intent/${id}`)
      .then(r => r.json())
      .then(data => {
        setIntent(data);
        if (data.status === 'pago') setSuccess(true);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    // Processar PIX automaticamente se não tiver os dados
    if (intent && !pixData && !success && intent.status !== 'pago') {
      setProcessing(true);
      fetch(`${API_BASE_URL}/api/pagamentos/processar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent_id: parseInt(id || "0"), metodo: 'pix' })
      })
      .then(r => r.json())
      .then(data => {
        setPixData(data);
        setProcessing(false);
      })
      .catch(() => setProcessing(false));
    }
  }, [intent, id, pixData, success]);

  // Polling de status para detectar o pagamento real
  useEffect(() => {
    if (!success && intent) {
      const interval = setInterval(() => {
        fetch(`${API_BASE_URL}/api/pagamentos/intent/${id}`)
          .then(r => r.json())
          .then(data => {
            if (data.status === 'pago') setSuccess(true);
          });
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [success, intent, id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = () => {
    if (pixData?.pix_copia_cola) {
      navigator.clipboard.writeText(pixData.pix_copia_cola);
      alert("Código PIX copiado!");
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#fcfcfc' }}>
      <div style={{ textAlign: 'center' }}>
        <RefreshCw size={32} className="spin" color="#8942FC" />
        <div style={{ marginTop: '1rem', fontWeight: 600, color: '#64748b' }}>Iniciando Checkout Seguro...</div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .spin { animation: spin 2s linear infinite; }`}</style>
    </div>
  );

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'grid', placeItems: 'center', padding: '2rem' }}>
        <div style={{ maxWidth: '450px', width: '100%', textAlign: 'center', background: '#fff', padding: '3.5rem 2rem', borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#f0fdf4', color: '#22c55e', display: 'grid', placeItems: 'center', margin: '0 auto 1.5rem' }}>
             <CheckCircle size={48} strokeWidth={2.5} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#111827', marginBottom: '1rem', letterSpacing: '-0.02em' }}>Pagamento Confirmado!</h2>
          <p style={{ color: '#64748b', marginBottom: '2.5rem', lineHeight: 1.6, fontSize: '1.05rem' }}>Obrigado! Sua transação foi processada com sucesso pelo Gato Gateway.</p>
          <button onClick={() => navigate('/')} style={{ width: '100%', background: '#111827', color: '#fff', border: 'none', borderRadius: '16px', padding: '1.2rem', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', transition: 'transform 0.2s' }}>Voltar para a loja</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fcfcfc', color: '#111827', fontFamily: "'Inter', sans-serif" }}>
      {/* Black Header */}
      <header style={{ background: '#000', color: '#fff', padding: '1rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          <div style={{ fontWeight: 950, fontSize: '1.3rem', letterSpacing: '-0.06em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ width: 22, height: 22, background: '#fff', borderRadius: 4, display: 'grid', placeItems: 'center' }}>
                <div style={{ width: 10, height: 10, background: '#000', transform: 'rotate(45deg)' }}></div>
            </div>
            GATO
          </div>
          <nav style={{ display: 'flex', gap: '1.75rem', fontSize: '0.9rem', fontWeight: 600 }}>
            <span style={{ cursor: 'pointer', opacity: 0.8 }}>Eventos</span>
            <span style={{ cursor: 'pointer', opacity: 0.8 }}>Ingressos</span>
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#333', fontSize: '0.75rem', fontWeight: 800, display: 'grid', placeItems: 'center' }}>A</div>
            <span style={{ fontWeight: 600 }}>Antonio</span>
          </div>
          <X size={20} style={{ cursor: 'pointer', opacity: 0.6 }} />
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '680px', margin: '4rem auto', padding: '0 1.5rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '1rem', color: '#64748b', marginBottom: '0.4rem', fontWeight: 500 }}>Valor da inscrição</div>
          <div style={{ fontSize: '3rem', fontWeight: 900, color: '#ef4444', letterSpacing: '-0.04em' }}>
            R$ {(intent?.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '2rem', color: '#111827', letterSpacing: '-0.02em' }}>Pagamento via PIX</h2>
        </div>

        {/* Gray Box Container */}
        <div style={{ background: '#f4f4f4', borderRadius: '32px', padding: '3rem 2rem', textAlign: 'center', border: '1px solid #eee' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#111827' }}>
                Valor: <span style={{ fontWeight: 800 }}>R$ {(intent?.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.6rem', fontWeight: 500 }}>
                ({intent?.item_name || 'Inscrição'} R$ {(intent?.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} + Kit R$ 0,00)
            </div>
          </div>

          {/* QR Code */}
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '24px', width: 'fit-content', margin: '0 auto 2.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.04)', position: 'relative' }}>
            {processing ? (
                <div style={{ width: '220px', height: '220px', display: 'grid', placeItems: 'center' }}>
                    <RefreshCw size={32} className="spin" color="#64748b" />
                </div>
            ) : pixData?.pix_qrcode ? (
                <img src={`data:image/png;base64,${pixData.pix_qrcode}`} alt="QR Code" style={{ width: '220px', height: '220px', display: 'block' }} />
            ) : (
                <div style={{ width: '220px', height: '220px', display: 'grid', placeItems: 'center', color: '#94a3b8' }}>Gerando QR Code...</div>
            )}
          </div>

          {/* Copy Button */}
          <button 
            onClick={handleCopy}
            disabled={!pixData}
            style={{ width: '100%', maxWidth: '480px', background: '#fff', border: 'none', borderRadius: '16px', padding: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', fontWeight: 700, fontSize: '1rem', color: '#111827', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: 'all 0.2s', opacity: pixData ? 1 : 0.5 }}
            onMouseEnter={e => { if (pixData) e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'; }}
          >
            <Copy size={20} /> Copiar código PIX
          </button>

          {/* Timer */}
          <div style={{ marginTop: '3rem', fontSize: '2.5rem', fontWeight: 900, color: '#111827', letterSpacing: '0.08em' }}>
            {formatTime(timeLeft)}
          </div>

          {/* Status */}
          <div style={{ marginTop: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.7rem', color: '#d97706', fontSize: '1rem', fontWeight: 700 }}>
            <RefreshCw size={20} className="spin" /> Aguardando pagamento...
          </div>
          <style>{`
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            .spin { animation: spin 2.5s linear infinite; }
          `}</style>
        </div>

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'none', opacity: 0.8 }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}>Cancelar</button>
        </div>
      </main>
    </div>
  );
}
