// Centralização da URL da API para facilitar o deploy em produção.
// Usando a URL oficial do backend hospedado no Render.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

console.log("[A2Pay] API Base URL:", API_BASE_URL);
