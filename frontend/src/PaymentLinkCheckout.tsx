import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from './api';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function PaymentLinkCheckout() {
  const { id } = useParams<{id: string}>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [linkData, setLinkData] = useState<any>(null);
  const [amount, setAmount] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerDocument, setCustomerDocument] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', type: 'error' });

  const showAlert = (title: string, message: string, type: 'error' | 'success' = 'error') => {
    setModalContent({ title, message, type });
    setModalOpen(true);
  };

  useEffect(() => {
    // Busca dados do link (simulado aqui para a UI, depois criar endpoint real se precisar)
    // Para simplificar, como o link de pagamento tem apenas ID e HASH, 
    // a gente deveria buscar do backend. 
    // Criar uma rota GET /api/merchants/payment-links/:hash 
    // Mas por enquanto, vamos fazer o POST direto para criar o intent se o valor for fixo.
    fetch(`${API_BASE_URL}/api/pagamentos/link-info/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Link não encontrado ou expirado");
        return res.json();
      })
      .then(data => {
        setLinkData(data);
        if (data.amount) {
            setAmount((data.amount).toString());
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      showAlert("Atenção", "Por favor, insira um e-mail válido (exemplo: seuemail@dominio.com)", "error");
      return;
    }

    const docDigits = customerDocument.replace(/\D/g, '');
    if (docDigits.length !== 11 && docDigits.length !== 14) {
      showAlert("Atenção", "O CPF ou CNPJ está incompleto.", "error");
      return;
    }

    if (!customerEmail || !customerDocument) {
      showAlert("Campos obrigatórios", "Preencha email e CPF/CNPJ", "error");
      return;
    }

    setProcessing(true);
    // Cria intent de pagamento
    let numericAmount = 0;
    if (linkData.amount) {
        numericAmount = linkData.amount;
    } else {
        numericAmount = Number(amount.replace(/\D/g, '')) / 100 || Number(amount.replace(',', '.'));
    }
    
    fetch(`${API_BASE_URL}/api/pagamentos/intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            merchant_id: linkData.merchant_id,
            valor_total: numericAmount,
            item_name: linkData.name,
            customer_email: customerEmail,
            customer_document: customerDocument.replace(/\D/g, ''),
            customer_name: customerName,
            is_payment_link: true,
            payment_link_id: linkData.id
        })
    })
    .then(r => r.json())
    .then(data => {
        if (data.intent_id) {
            navigate(`/checkout/${data.intent_id}`);
        } else {
            showAlert("Erro", data.error || "Não foi possível gerar a transação. Verifique os dados e tente novamente.", "error");
            setProcessing(false);
        }
    })
    .catch(() => {
        showAlert("Erro de Conexão", "Não foi possível conectar aos nossos servidores. Verifique sua internet.", "error");
        setProcessing(false);
    });
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      // CPF Mask
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      // CNPJ Mask
      value = value.substring(0, 14); // Limita em 14 digitos (CNPJ)
      value = value.replace(/^(\d{2})(\d)/, '$1.$2');
      value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
      value = value.replace(/(\d{4})(\d)/, '$1-$2');
    }
    setCustomerDocument(value);
  };

  if (loading) return <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>Carregando link...</div>;
  if (error) return <div style={{ display: 'grid', placeItems: 'center', height: '100vh', color: 'red' }}>{error}</div>;
  if (!linkData) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ background: '#fff', padding: '3rem', borderRadius: '32px', maxWidth: '500px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <div style={{ width: 64, height: 64, background: '#f3e8ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#8942FC' }}>
                    <ShoppingBag size={32} />
                </div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>{linkData.name}</h1>
                <p style={{ color: '#64748b' }}>Complete seus dados para prosseguir com o pagamento.</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {!linkData.amount && (
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Valor do Pagamento (R$)</label>
                        <input required type="text" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem' }} />
                    </div>
                )}
                
                {linkData.amount && (
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span style={{ color: '#64748b', fontWeight: 600 }}>Total a pagar:</span>
                        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>R$ {linkData.amount.toFixed(2).replace('.', ',')}</span>
                    </div>
                )}

                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Nome Completo</label>
                    <input required value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="João da Silva" style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem' }} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>E-mail</label>
                    <input required type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="joao@email.com" style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem' }} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>CPF ou CNPJ</label>
                    <input required value={customerDocument} onChange={handleDocumentChange} placeholder="000.000.000-00" maxLength={18} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem' }} />
                </div>

                <button disabled={processing} style={{ marginTop: '1rem', background: '#8942FC', color: '#fff', border: 'none', padding: '1rem', borderRadius: '16px', fontWeight: 800, fontSize: '1.1rem', cursor: processing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}>
                    {processing ? 'Processando...' : 'Ir para Pagamento'} <ArrowRight size={20} />
                </button>
            </form>
        </div>

        {/* Custom Alert Modal */}
        {modalOpen && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', animation: 'fadeIn 0.2s ease-out' }}>
                <div style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 400, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', animation: 'scaleIn 0.2s ease-out', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '2rem 1.5rem 1.5rem', textAlign: 'center' }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: modalContent.type === 'error' ? '#fef2f2' : '#f0fdf4', color: modalContent.type === 'error' ? '#ef4444' : '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            {modalContent.type === 'error' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            )}
                        </div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', margin: '0 0 0.5rem 0' }}>{modalContent.title}</h2>
                        <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.5, margin: 0 }}>{modalContent.message}</p>
                    </div>
                    <div style={{ padding: '1rem 1.5rem 1.5rem' }}>
                        <button onClick={() => setModalOpen(false)} style={{ width: '100%', background: modalContent.type === 'error' ? '#ef4444' : '#22c55e', color: '#fff', border: 'none', padding: '0.8rem', borderRadius: 12, fontWeight: 700, fontSize: '1rem', cursor: 'pointer', transition: 'filter 0.2s' }} onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.9)'} onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}>
                            Entendi
                        </button>
                    </div>
                </div>
            </div>
        )}

        <style>{`
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes scaleIn {
                from { opacity: 0; transform: scale(0.95) translateY(10px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
            }
        `}</style>
    </div>
  );
}
