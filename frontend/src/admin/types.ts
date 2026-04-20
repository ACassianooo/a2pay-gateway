export interface EmpresaInfo {
  nome: string;
  volume_girado: number;
  taxas_cobradas: number;
}

export interface Transaction {
  id: number;
  item_name: string;
  valor_total: number;
  valor_liquido: number;
  status: string;
  metodo_pagamento: string;
  created_at: string;
}

export interface DashboardData {
  role: string;
  saldo_lojista?: number;
  transacoes?: Transaction[];
  lucro_total?: number;
  empresas?: EmpresaInfo[];
}
