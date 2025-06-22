const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://pyquer-server.onrender.com';

export const API_ENDPOINTS = {
  HEALTH: `${API_BASE_URL}/api/health`,
  UPLOAD: `${API_BASE_URL}/api/upload`,
  GEMINI: `${API_BASE_URL}/api/ai/gemini`,
  MISTRAL: `${API_BASE_URL}/api/ai/mistral`,
  COHERE: `${API_BASE_URL}/api/ai/cohere`
}; 