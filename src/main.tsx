import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID || '563039381952-8bevtsh2r9p2qaq5pcq5ltme8vao1sqe.apps.googleusercontent.com';

// Ignorar erros benignos de WebSocket do Vite HMR causados pelo sandboxing do iframe/Cloud Run
if (typeof window !== 'undefined') {
  // Catch uncaught runtime exceptions
  window.addEventListener('error', (event) => {
    const message = event.message || '';
    if (
      message.includes('WebSocket') ||
      message.includes('websocket') ||
      message.includes('vite') ||
      message.includes('closed without opened') ||
      message.includes('failed to connect')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const reasonValue = event.reason?.message || String(event.reason || '');
    if (
      reasonValue.includes('WebSocket') ||
      reasonValue.includes('websocket') ||
      reasonValue.includes('vite') ||
      reasonValue.includes('closed without opened') ||
      reasonValue.includes('failed to connect')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  // Intercept and swallow console.error and console.warn calls containing these strings
  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = (...args) => {
    const msg = args.map(arg => String(arg || '')).join(' ');
    if (
      msg.includes('WebSocket') ||
      msg.includes('websocket') ||
      msg.includes('vite') ||
      msg.includes('closed without opened') ||
      msg.includes('failed to connect')
    ) {
      return;
    }
    originalError.apply(console, args);
  };

  console.warn = (...args) => {
    const msg = args.map(arg => String(arg || '')).join(' ');
    if (
      msg.includes('WebSocket') ||
      msg.includes('websocket') ||
      msg.includes('vite') ||
      msg.includes('closed without opened') ||
      msg.includes('failed to connect')
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

let shouldRender = true;
if (typeof window !== 'undefined') {
  const isPopup = window.opener && (
    window.location.hash.includes('access_token') || 
    window.location.hash.includes('id_token') || 
    window.location.search.includes('access_token')
  );
  
  if (isPopup) {
    shouldRender = false;
    try {
      console.log("⚡ [OAuth Popup] Detected active session in popup context. Communicating back to opener...");
      
      // Dispatch authentication message with hash parameters back to the parent iframe
      window.opener.postMessage({ 
        type: 'SUPABASE_OAUTH_SUCCESS', 
        hash: window.location.hash 
      }, window.location.origin);
      
      // Render a polished Branded Success Screen inside the popup window
      document.body.innerHTML = `
        <div style="background-color:#0b0e11;color:#ffffff;font-family:sans-serif;height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center;margin:0;padding:20px;box-sizing:border-box;">
          <div style="width:72px;height:72px;border-radius:50%;background:rgba(0,200,255,0.06);border:2px solid #00c8ff;display:flex;align-items:center;justify-content:center;margin-bottom:24px;box-shadow:0 0 30px rgba(0,200,255,0.3);animation:pulse 1.4s infinite alternate;">
            <svg viewBox="0 0 24 24" width="32" height="32" stroke="#00c8ff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h2 style="font-size:20px;letter-spacing:4px;margin:0 0 10px 0;text-transform:uppercase;color:#ffffff;font-weight:900;text-shadow:0 0 10px rgba(0,255,255,0.2);">CONEXÃO OK</h2>
          <p style="font-size:12px;color:#8f9cae;margin:0 auto;max-width:340px;line-height:1.6;font-family:monospace;letter-spacing:1px;text-transform:uppercase;">AUTENTICAÇÃO EXECUTADA COM SUCESSO. ESTE TERMINAL SERÁ ENCERRADO EM INSTANTES.</p>
          <style>
            @keyframes pulse {
              from { transform: scale(0.95); box-shadow: 0 0 15px rgba(0,200,255,0.15); }
              to { transform: scale(1.05); box-shadow: 0 0 35px rgba(0,200,255,0.55); }
            }
          </style>
        </div>
      `;
      setTimeout(() => {
        window.close();
      }, 1500);
    } catch (e) {
      console.error("Popup communication error:", e);
    }
  }
}

if (shouldRender) {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </StrictMode>,
  );
}

