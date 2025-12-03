import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (username, password) => {
    const response = await api.post('/auth/register', { username, password });
    return response.data;
  },

  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  updatePublicKey: async (username, publicKey, keyAlgorithm) => {
    const response = await api.post('/auth/update-public-key', {
      username,
      publicKey,
      keyAlgorithm
    });
    return response.data;
  },

  getPublicKey: async (username) => {
    const response = await api.get(`/auth/public-key/${username}`);
    return response.data;
  }
};

// Key-exchange API (demo transport layer)
export const kxAPI = {
  sendMessage: async (to, messageType, payload) => {
    const response = await api.post('/kx/send', { to, messageType, payload });
    return response.data;
  },

  getInbox: async () => {
    const response = await api.get('/kx/inbox');
    return response.data.messages;
  }
};

// Encrypted messages API
export const messagesAPI = {
  sendEncrypted: async (payload) => {
<<<<<<< HEAD
=======
    // Ensure nonce is included
    if (!payload.nonce) {
      throw new Error('Nonce is required for message encryption');
    }
>>>>>>> 44486ae (Full Deployment)
    const response = await api.post('/messages/send', payload);
    return response.data;
  },

  getConversation: async (peerUsername, sessionId) => {
    const response = await api.get(
      `/messages/conversation/${encodeURIComponent(peerUsername)}/${encodeURIComponent(
        sessionId
      )}`
    );
    return response.data;
  }
};

<<<<<<< HEAD
=======
// Encrypted file sharing API
export const filesAPI = {
  uploadFile: async (fileId, chunks, metadata) => {
    const response = await api.post('/files/upload', { fileId, chunks, metadata });
    return response.data;
  },

  listFiles: async (peerUsername, sessionId) => {
    const response = await api.get(
      `/files/list/${encodeURIComponent(peerUsername)}/${encodeURIComponent(sessionId)}`
    );
    return response.data;
  },

  downloadFile: async (fileId) => {
    const response = await api.get(`/files/download/${encodeURIComponent(fileId)}`);
    return response.data;
  }
};

>>>>>>> 44486ae (Full Deployment)
export default api;

