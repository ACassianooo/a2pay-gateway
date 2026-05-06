import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from './api';
import { CheckCircle, Copy, RefreshCw, Clock, ArrowLeft, Check } from 'lucide-react';

export default function Checkout() {
  const { id } = useParams<{id: string}>();
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [intent, setIntent] = useState<any>(null);
  const [pixData, setPixData] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutos
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
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
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#fcfcfc' }}>
      <RefreshCw size={40} className="spin" color="#9d66ff" />
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
          <button onClick={() => navigate('/')} style={{ width: '100%', background: '#111827', color: '#fff', border: 'none', borderRadius: '16px', padding: '1.2rem', fontWeight: 800, fontSize: '1rem', cursor: 'pointer' }}>Voltar para a loja</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#fff', 
      color: '#111827', 
      fontFamily: "'Inter', sans-serif",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '1100px', 
        display: 'grid', 
        gridTemplateColumns: '1.2fr 0.8fr', 
        gap: '4rem',
        alignItems: 'start'
      }}>
        
        {/* Left Column: Payment Info */}
        <div>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontWeight: 600, cursor: 'pointer', marginBottom: '2rem' }}>
            <ArrowLeft size={18} /> Voltar
          </button>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.04em' }}>Finalizar Pagamento</h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: 1.5, marginBottom: '3rem', maxWidth: '500px' }}>
            Para completar sua compra, escaneie o QR Code abaixo ou copie o código PIX. Seu pagamento será processado instantaneamente.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* PIX QR Code Area */}
            <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
              <div style={{ 
                background: '#f3f4f6', 
                padding: '1.5rem', 
                borderRadius: '24px', 
                width: 'fit-content',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
              }}>
                {processing ? (
                    <div style={{ width: '180px', height: '180px', display: 'grid', placeItems: 'center' }}>
                        <RefreshCw size={32} className="spin" color="#9d66ff" />
                    </div>
                ) : pixData?.pix_qrcode ? (
                    <img 
                      src={pixData.pix_qrcode.startsWith('http') ? pixData.pix_qrcode : `data:image/png;base64,${pixData.pix_qrcode}`} 
                      alt="QR Code" 
                      style={{ width: '180px', height: '180px', display: 'block' }} 
                    />
                ) : (
                    <div style={{ width: '180px', height: '180px', display: 'grid', placeItems: 'center', color: '#94a3b8' }}>Gerando...</div>
                )}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#d97706', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  <RefreshCw size={18} className="spin" /> Aguardando pagamento
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>
                   {formatTime(timeLeft)}
                </div>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>O código expira em 15 minutos.</p>
              </div>
            </div>


            <button 
              onClick={handleCopy}
              style={{ 
                background: copied ? '#22c55e' : '#9d66ff', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '16px', 
                padding: '1.2rem 2.5rem', 
                fontSize: '1.1rem', 
                fontWeight: 700, 
                cursor: 'pointer',
                boxShadow: copied ? '0 10px 15px -3px rgba(34, 197, 94, 0.3)' : '0 10px 15px -3px rgba(157, 102, 255, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.8rem'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              {copied ? <Check size={22} /> : <Copy size={20} />}
              {copied ? 'Copiado!' : 'Copiar e Pagar'}
            </button>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div style={{ 
          background: '#f9fafb', 
          borderRadius: '40px', 
          padding: '3rem',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid #f1f1f1'
        }}>
          {/* Purple Glow Effect */}
          <div style={{ 
            position: 'absolute', 
            top: '-50px', 
            right: '-50px', 
            width: '250px', 
            height: '250px', 
            background: 'radial-gradient(circle, rgba(157, 102, 255, 0.15) 0%, rgba(157, 102, 255, 0) 70%)',
            zIndex: 0
          }}></div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 500 }}>Você está pagando,</p>
            <h2 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '3rem', letterSpacing: '-0.04em' }}>
               R$ {(intent?.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>{intent?.item_name || 'Inscrição Evento'}</div>
                        <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.4rem' }}>
                            Qtd: {intent?.metadata?.quantity || 1} • Lote: {intent?.metadata?.lote || 'Único'}
                        </div>
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>R$ {(intent?.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>Descontos e Ofertas</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981' }}>R$ 0,00</div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '1rem 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '1.1rem', fontWeight: 500 }}>
                    <div>Taxas</div>
                    <div>R$ 0,00</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>Total</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>R$ {(intent?.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
            </div>
          </div>
        </div>

      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 2.5s linear infinite; }
      `}</style>
    </div>
  );
}
