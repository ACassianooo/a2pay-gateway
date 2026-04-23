// Centralização da URL da API para facilitar o deploy em produção.
// Em desenvolvimento usa o localhost:8080. Em produção, configure VITE_API_URL.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

console.log("[A2Pay] API Base URL:", API_BASE_URL);
