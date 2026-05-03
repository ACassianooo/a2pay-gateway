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
      alert("Por favor, insira um e-mail válido (exemplo: seuemail@dominio.com)");
      return;
    }

    const docDigits = customerDocument.replace(/\D/g, '');
    if (docDigits.length !== 11 && docDigits.length !== 14) {
      alert("O CPF ou CNPJ está incompleto.");
      return;
    }

    if (!customerEmail || !customerDocument) {
      alert("Preencha email e CPF/CNPJ");
      return;
    }

    setProcessing(true);
    // Cria intent de pagamento
    const numericAmount = Number(amount.replace(/\D/g, '')) / 100 || Number(amount);
    
    fetch(`${API_BASE_URL}/api/pagamentos/intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            merchant_id: linkData.merchant_id,
            total_amount: numericAmount,
            description: linkData.name,
            customer_email: customerEmail,
            customer_document: customerDocument.replace(/\D/g, ''),
            customer_name: customerName,
            is_payment_link: true,
            payment_link_id: linkData.id
        })
    })
    .then(r => r.json())
    .then(data => {
        if (data.id) {
            navigate(`/checkout/${data.id}`);
        } else {
            alert("Erro ao gerar pagamento");
            setProcessing(false);
        }
    })
    .catch(() => {
        alert("Erro de conexão");
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
    </div>
  );
}
