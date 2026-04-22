import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from './api';
import { CreditCard, CheckCircle, QrCode } from 'lucide-react';

export default function Checkout() {
  const { id } = useParams<{id: string}>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [method, setMethod] = useState<'cartao' | 'pix'>('pix');
  const [pixCode, setPixCode] = useState('');
  
  const [cardNumber, setCardNumber] = useState('4111 1111 1111 1111');
  const [validade, setValidade] = useState('12/30');
  const [cvv, setCvv] = useState('123');

  useEffect(() => {
    // Simulando uma API gerando nosso código Copia e Cola unico do Banco Central
    setPixCode("00020101021126360014br.gov.bcb.pix0114+5511999999999520400005303986540510.005802BR5915A2Pay6009Sao Paulo62070503***6304");
  }, []);

  const handleProcessPayment = async (metodo: 'cartao' | 'pix') => {
    setLoading(true);
    try {
      let finalCardToken = "";

      if (metodo === 'cartao') {
         // Passo 1: Segurança PCI - Coletar dados brutos e transformar em Token A2Pay anonimo
         const vaultRes = await fetch(`${API_BASE_URL}/api/vault/tokenize`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ card_number: cardNumber, validade, cvv })
         });
         
         if (!vaultRes.ok) throw new Error("Erro ao tokenizar cartão no Vault.");
         const vaultData = await vaultRes.json();
         finalCardToken = vaultData.token;
      }

      // Passo 2: Pagamento final usando apenas o token
      const payload = {
        intent_id: parseInt(id || "0"),
        metodo: metodo,
        cartao: finalCardToken
      };

      const res = await fetch(`${API_BASE_URL}/api/pagamentos/processar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const err_text = await res.text();
        alert("Erro no pagamento: " + err_text);
      }
    } catch(e: any) {
      alert(e.message || "Erro de comunicação com o servidor.");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="checkout-container" style={{textAlign: 'center'}}>
        <CheckCircle size={64} color="#8942FC" style={{margin: '0 auto 1.5rem'}} />
        <h2 style={{color: '#111827', marginBottom: '1rem'}}>Pagamento Confirmado!</h2>
        <p style={{color: '#6b7280', marginBottom: '2rem'}}>
          Obrigado pela sua compra. O valor foi processado integralmente pelo A2Pay.
        </p>
        <button className="btn-primary" onClick={() => navigate('/')}>
          Ver Saldo no Dashboard Lojista
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <div style={{display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem'}}>
           <div 
             onClick={() => setMethod('pix')} 
             style={{
               padding: '1rem', 
               cursor: 'pointer',
               borderBottom: method === 'pix' ? '2px solid var(--accent)' : '2px solid transparent',
               color: method === 'pix' ? 'var(--accent)' : 'var(--text-muted)'
             }}>
             <QrCode size={24} style={{display: 'block', margin: '0 auto 0.5rem'}} />
             PIX Instantâneo
           </div>
           <div 
             onClick={() => setMethod('cartao')} 
             style={{
               padding: '1rem', 
               cursor: 'pointer',
               borderBottom: method === 'cartao' ? '2px solid var(--accent)' : '2px solid transparent',
               color: method === 'cartao' ? 'var(--accent)' : 'var(--text-muted)'
             }}>
             <CreditCard size={24} style={{display: 'block', margin: '0 auto 0.5rem'}} />
             Cartão (Visa Direct)
           </div>
        </div>
      </div>

      <div className="receipt">
        <div className="receipt-row">
          <span>Transação ID:</span>
          <span>#{id}</span>
        </div>
        <div className="receipt-row">
          <span>Processador:</span>
          <span style={{color: 'var(--accent)'}}>A2Pay Pagamentos LTDA</span>
        </div>
      </div>

      {method === 'cartao' && (
        <form onSubmit={(e) => { e.preventDefault(); handleProcessPayment('cartao'); }}>
          <p style={{marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem'}}>
            Integrado diretamente à rede Visa MPGS. Custo único: 3,00% + R$ 0,50 sobre o valor da compra.
          </p>
          <div className="form-group">
            <label>Número do Cartão Verificado</label>
            <input type="text" className="form-control" placeholder="0000 0000 0000 0000" required value={cardNumber} onChange={e => setCardNumber(e.target.value)} />
          </div>
          <div style={{display: 'flex', gap: '1rem'}}>
            <div className="form-group" style={{flex: 1}}>
              <label>Validade</label>
              <input type="text" className="form-control" placeholder="MM/YY" required value={validade} onChange={e => setValidade(e.target.value)} />
            </div>
            <div className="form-group" style={{flex: 1}}>
              <label>CVV</label>
              <input type="text" className="form-control" placeholder="123" required value={cvv} onChange={e => setCvv(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Redirecionando Visa/Master...' : 'Completar Pagamento de Cartão'}
          </button>
        </form>
      )}

      {method === 'pix' && (
        <div style={{textAlign: 'center'}}>
          <div style={{
            background: '#fff', 
            width: '200px', 
            height: '200px', 
            margin: '0 auto 1.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRadius: '8px'
          }}>
            <QrCode size={160} color="#000" />
          </div>
          <div className="form-group">
            <label>Código Copia e Cola</label>
            <input type="text" className="form-control" readOnly value={pixCode} style={{textAlign: 'center', fontSize: '0.8rem'}} />
          </div>
          
          <p style={{color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem'}}>
            Livre de taxas variáveis de intermediação. Apenas exatos R$ 0,99 de custo gateway.
          </p>

          <button onClick={() => handleProcessPayment('pix')} className="btn-primary" disabled={loading} style={{backgroundColor: '#8942FC', color: '#fff', width: '100%' }}>
             {loading ? 'Aguardando o Banco...' : 'Confirmar Pagamento PIX'}
          </button>
        </div>
      )}

    </div>
  );
}
