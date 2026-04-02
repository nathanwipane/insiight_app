import axios from "axios";

// lib/config.ts
const config = {
  // Server-side only URLs (secure)
  api: {
    baseUrl: process.env.API_BASE_URL || 'https://api.insiightanalytics.com/api',
    timeout: parseInt(process.env.API_TIMEOUT || '5000'),
  }
} as const;
  

const apiClient = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
});

export default apiClient;