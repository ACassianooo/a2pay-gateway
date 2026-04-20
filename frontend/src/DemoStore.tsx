import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { API_BASE_URL } from './api';

export default function DemoStore() {
  const [itemName, setItemName] = useState('Teclado Mecânico RGB');
  const [valorStr, setValorStr] = useState('250.00');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateIntent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const valorTotal = parseFloat(valorStr);
      if (isNaN(valorTotal) || valorTotal <= 0.99) {
        alert("O valor deve ser maior que R$ 0,99 (taxa do gateway).");
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/pagamentos/intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchant_id: 2, item_name: itemName, valor_total: valorTotal })
      });

      const data = await res.json();
      
      if (res.ok) {
         // Em um mundo real, o site redirecionaria o usuário para a URL do Gateway.
         // Aqui, redirecionamos para a nossa rota local /checkout/:id
         navigate(`/checkout/${data.intent_id}`);
      } else {
         alert("Erro: " + JSON.stringify(data));
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao conectar com a API.");
    }
    setLoading(false);
  };

  return (
    <div className="checkout-container" style={{maxWidth: '600px'}}>
      <div className="checkout-header">
        <ShoppingBag size={48} color="#66fcf1" style={{marginBottom: '1rem'}} />
        <h2>Simulador de E-commerce Externo</h2>
        <p>Crie uma intenção de pagamento como se fosse uma loja parceira integrando nosso gateway.</p>
      </div>

      <form onSubmit={handleCreateIntent}>
        <div className="form-group">
          <label>Nome do Produto</label>
          <input 
            type="text" 
            className="form-control" 
            value={itemName} 
            onChange={e => setItemName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Valor de Venda (R$)</label>
          <input 
            type="number" 
            step="0.01"
            className="form-control" 
            value={valorStr} 
            onChange={e => setValorStr(e.target.value)}
            required
          />
          <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem'}}>
            Atenção: A taxa exata do Gateway será abatida dependendo do método de pagamento escolhido pelo cliente (ex: R$ 0,99 se PIX, ou 3,00% + R$ 0,50 se Cartão). O lojista receberá o saldo líquido.
          </p>
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Gerando Pagamento...' : 'Comprar e Pagar com A2Pay'}
        </button>
      </form>
    </div>
  );
}
