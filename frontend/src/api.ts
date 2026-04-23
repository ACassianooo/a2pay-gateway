// Centralização da URL da API para facilitar o deploy em produção.
// No Vercel unificado, usamos caminhos relativos '/api' para evitar CORS.
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

console.log("[A2Pay] API Base URL:", API_BASE_URL || "(relative)");
