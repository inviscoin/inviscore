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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
);

