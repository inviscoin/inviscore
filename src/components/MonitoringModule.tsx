import React, { useState, useEffect } from 'react';
import { Activity, Database, Server, Terminal, Wifi, CloudRain, Cpu, BarChart2, Shield, Mail, BellRing, Key, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DeployStatus } from './DeployStatus';

interface Metric {
  label: string;
  value: string;
  status: 'good' | 'warning' | 'danger';
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  source: 'VERCEL_EDGE' | 'SUPABASE_PG' | 'SMTP_SECURE' | 'CLIENT' | 'FCM_PUSH';
  message: string;
  duration?: string;
  recipient?: string;
}

interface SupabaseQueryLog {
  id: string;
  timestamp: string;
  query: string;
  durationMs: number;
  statusCode: number;
}

export const MonitoringModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'infrastructure' | 'email_security' | 'supabase_queries'>('infrastructure');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [queryLogs, setQueryLogs] = useState<SupabaseQueryLog[]>([]);
  const [emailLogs, setEmailLogs] = useState<LogEntry[]>([
    {
      id: 'e1',
      timestamp: new Date(Date.now() - 3600000).toISOString().substring(11, 23),
      level: 'warn',
      source: 'SMTP_SECURE',
      message: 'ALERTA DE SEGURANÇA: Nova sessão aberta a partir do IP 189.123.82.1 (São Paulo, BR)',
      recipient: 'juninho.portoj@gmail.com'
    },
    {
      id: 'e2',
      timestamp: new Date(Date.now() - 1800000).toISOString().substring(11, 23),
      level: 'info',
      source: 'SMTP_SECURE',
      message: 'DISPATCH_SUCCESS: Link de recuperação de senha enviado com hash de verificação redundante',
      recipient: 'juninho.portoj@gmail.com'
    }
  ]);

  const [metrics, setMetrics] = useState<Metric[]>([
    { label: 'Edge Latency', value: '14ms', status: 'good' },
    { label: 'DB Connections', value: '4/10', status: 'good' },
    { label: 'V8 Heap Memory', value: '45MB', status: 'good' },
    { label: 'Cloudflare Cache HR', value: '98.2%', status: 'good' }
  ]);
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);

  // Simulates incoming real-time telemetry from Vercel & Supabase
  useEffect(() => {
    if (!isLiveStreaming) return;

    const sources: ('VERCEL_EDGE' | 'SUPABASE_PG' | 'CLIENT')[] = ['VERCEL_EDGE', 'SUPABASE_PG'];
    const generateLog = (): LogEntry => {
      const src = sources[Math.floor(Math.random() * sources.length)];
      const isError = Math.random() > 0.95;
      const isWarn = Math.random() > 0.8;
      
      let msg = '';
      if (src === 'VERCEL_EDGE') {
        msg = isError ? 'Edge Function execution timeout.' : isWarn ? 'High memory usage detected on Edge.' : 'GET /api/v1/session - 200 OK';
      } else {
        msg = isError ? 'Connection pool exhausted.' : isWarn ? 'Slow query detected (>500ms).' : 'UPSERT public.users - 200 OK';
      }

      // Simulate FCM Push Notification for Critical Errors
      if (isError) {
        setTimeout(() => {
          setLogs(prev => [{
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString().substring(11, 23),
            level: 'warn',
            source: 'FCM_PUSH',
            message: `FCM_ALERT: Dispatched Push Notification to admin device - ${msg}`
          }, ...prev]);
        }, 500);
      }

      return {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString().substring(11, 23), // HH:mm:ss.xxx
        level: isError ? 'error' : isWarn ? 'warn' : 'info',
        source: src,
        message: msg,
        duration: isError ? undefined : `${Math.floor(Math.random() * 120 + 10)}ms`
      };
    };

    const generateQueryLog = (): SupabaseQueryLog => {
      const isSlow = Math.random() > 0.8;
      const isError = Math.random() > 0.95;
      const tables = ['users', 'wallets', 'transactions', 'sessions'];
      const actions = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'];
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString().substring(11, 23),
        query: `${actions[Math.floor(Math.random()*actions.length)]} FROM public.${tables[Math.floor(Math.random()*tables.length)]} WHERE id = $1`,
        durationMs: isError ? 0 : Math.floor(Math.random() * (isSlow ? 800 : 50) + 5),
        statusCode: isError ? 500 : 200
      };
    };

    // Initial logs
    setLogs(Array.from({ length: 8 }, generateLog));
    setQueryLogs(Array.from({ length: 5 }, generateQueryLog));

    const interval = setInterval(() => {
      setLogs(prev => {
        const newLogs = [generateLog(), ...prev];
        if (newLogs.length > 50) newLogs.pop();
        return newLogs;
      });

      setQueryLogs(prev => {
        const newQ = [generateQueryLog(), ...prev];
        if (newQ.length > 30) newQ.pop();
        return newQ;
      });

      // Update metrics slightly
      setMetrics(prev => prev.map(m => {
        if (m.label === 'Edge Latency') return { ...m, value: `${Math.floor(Math.random() * 30 + 10)}ms` };
        if (m.label === 'DB Connections') return { ...m, value: `${Math.floor(Math.random() * 8 + 1)}/10` };
        if (m.label === 'V8 Heap Memory') return { ...m, value: `${Math.floor(Math.random() * 20 + 35)}MB` };
        return m;
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  // Handle manual trigger of simulated security alert or password recovery email
  const handleSimulateForgotPassword = () => {
    if (navigator.vibrate) navigator.vibrate(40);
    const newEntry: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString().substring(11, 23),
      level: 'info',
      source: 'SMTP_SECURE',
      message: 'AUTORECOVERY_REQUEST: Nova solicitação de redefinição recebida. Token OTP enviado e lacrado temporariamente.',
      recipient: 'juninho.portoj@gmail.com'
    };
    setEmailLogs(prev => [newEntry, ...prev]);
    alert('E-mail de Recuperação de Senha simulado e disparado com sucesso para juninho.portoj@gmail.com através do SMTP Secure!');
  };

  const handleSimulateSecurityAlert = () => {
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    const newEntry: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString().substring(11, 23),
      level: 'error',
      source: 'SMTP_SECURE',
      message: 'SECURITY_ALERT: Tentativa de login maliciosa bloqueada vinda de host anônimo IP: 45.92.110.13',
      recipient: 'juninho.portoj@gmail.com'
    };
    setEmailLogs(prev => [newEntry, ...prev]);
    
    // Simulate FCM trigger alongside SMTP for critical
    setTimeout(() => {
        setLogs(prev => [{
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString().substring(11, 23),
            level: 'warn',
            source: 'FCM_PUSH',
            message: 'FCM_ALERT: Dispatched Push Notification to admin device - SECURITY_ALERT: Tentativa maliciosa bloqueada'
          }, ...prev]);
    }, 300);

    alert('Alerta de Segurança crítico despachado via e-mail para juninho.portoj@gmail.com!');
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0b0e11] p-4 text-[#e0e0e0] font-mono overflow-y-auto no-scrollbar pb-10">
      
      <DeployStatus 
        isStreaming={isLiveStreaming} 
        onToggleStreaming={() => setIsLiveStreaming(!isLiveStreaming)} 
      />

      {/* Tab Selectors */}
      <div className="flex border-b border-white/5 bg-black/20 shrink-0 gap-3 mb-4 text-xs overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('infrastructure')}
          className={`py-2 px-3 font-mono font-black uppercase tracking-wider transition-all whitespace-nowrap relative cursor-pointer ${
            activeTab === 'infrastructure' ? 'text-emerald-400' : 'text-neutral-500 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5" />
            <span>Infra & FCM</span>
          </div>
          {activeTab === 'infrastructure' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('supabase_queries')}
          className={`py-2 px-3 font-mono font-black uppercase tracking-wider transition-all whitespace-nowrap relative cursor-pointer ${
            activeTab === 'supabase_queries' ? 'text-cyan-400' : 'text-neutral-500 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" />
            <span>Supabase PgBouncer</span>
          </div>
          {activeTab === 'supabase_queries' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('email_security')}
          className={`py-2 px-3 font-mono font-black uppercase tracking-wider transition-all whitespace-nowrap relative cursor-pointer ${
            activeTab === 'email_security' ? 'text-amber-400' : 'text-neutral-500 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" />
            <span>Segurança & E-mails</span>
          </div>
          {activeTab === 'email_security' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-400" />
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'infrastructure' && (
          <motion.div
            key="infrastructure"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex-1 flex flex-col min-h-0"
          >
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 shrink-0">
              {metrics.map((m, idx) => (
                 <div 
                  key={idx}
                  className={`p-3 rounded-xl border flex flex-col gap-1.5 ${
                    m.status === 'good' ? 'bg-emerald-950/20 border-emerald-500/20' : 
                    m.status === 'warning' ? 'bg-amber-950/20 border-amber-500/20' : 
                    'bg-red-950/20 border-red-500/20'
                  }`}
                >
                  <span className="text-[8.5px] uppercase tracking-wide text-neutral-400">{m.label}</span>
                  <span className={`text-sm font-black ${
                    m.status === 'good' ? 'text-emerald-400' : 
                    m.status === 'warning' ? 'text-amber-400' : 
                    'text-red-400'
                  }`}>{m.value}</span>
                 </div>
              ))}
            </div>

            {/* Control Panel */}
            <div className="flex justify-between items-center bg-black/40 border border-white/5 p-3 rounded-t-xl shrink-0 gap-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest hidden sm:flex">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-cyan-400">Stream de Logs (Live)</span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <span className="text-[9px] text-neutral-500">
                  Filtros: <strong className="text-emerald-400">OK</strong> <strong className="text-amber-400">WARN</strong> <strong className="text-red-400">ERR</strong>
                </span>
              </div>
            </div>

            {/* Terminal View */}
            <div className="flex-1 bg-[#050508] border border-white/5 border-t-0 p-4 rounded-b-xl overflow-y-auto no-scrollbar shadow-inner relative flex flex-col justify-start">
              <div className="absolute top-0 bottom-0 left-4 w-px bg-white/5 pointer-events-none" />
              
              <AnimatePresence>
                {logs.map((log) => (
                  <div 
                    key={log.id}
                    className="flex items-start gap-4 mb-2 text-[10px] w-full"
                  >
                    <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                      log.level === 'info' ? 'bg-emerald-500' : 
                      log.level === 'warn' && log.source === 'FCM_PUSH' ? 'bg-purple-500' :
                      log.level === 'warn' ? 'bg-amber-500' : 
                      'bg-red-500 animate-pulse'
                    }`} />
                    
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 w-full px-2 py-1 hover:bg-white/5 rounded transition-colors">
                      <span className="text-neutral-500 shrink-0 font-mono">{log.timestamp}</span>
                      <span className={`px-1 rounded uppercase font-black tracking-widest shrink-0 text-[8px] ${
                        log.source === 'VERCEL_EDGE' ? 'bg-black text-white border border-white/20' : 
                        log.source === 'FCM_PUSH' ? 'bg-purple-900/30 text-purple-400 border border-purple-500/30' :
                        'bg-emerald-900/30 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {log.source === 'FCM_PUSH' && <Bell className="w-2 h-2 inline-block mr-1" />}
                        {log.source}
                      </span>
                      <span className={`flex-1 text-left ${
                        log.level === 'error' ? 'text-red-400 font-bold' : 
                        log.source === 'FCM_PUSH' ? 'text-purple-300' :
                        log.level === 'warn' ? 'text-amber-300' : 
                        'text-neutral-300'
                      }`}>
                        {log.message}
                      </span>
                      {log.duration && (
                        <span className="text-cyan-400 shrink-0 font-mono ml-auto">
                          {log.duration}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {activeTab === 'supabase_queries' && (
          <motion.div
            key="supabase_queries"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex-1 flex flex-col min-h-0"
          >
            {/* Control Panel */}
            <div className="flex justify-between items-center bg-black/40 border border-white/5 p-3 rounded-t-xl shrink-0">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest">
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-cyan-400">PgBouncer Query Logs</span>
                </div>
              </div>
            </div>

            {/* Terminal View */}
            <div className="flex-1 bg-[#050508] border border-white/5 border-t-0 p-4 rounded-b-xl overflow-y-auto no-scrollbar shadow-inner relative flex flex-col justify-start">
              <AnimatePresence>
                {queryLogs.map((q) => (
                  <div key={q.id} className="flex flex-col mb-3 p-2 rounded bg-black/20 border border-white/5 text-[10px]">
                     <div className="flex justify-between items-center mb-1">
                        <span className="text-neutral-500 font-mono tracking-wide">{q.timestamp}</span>
                        <div className="flex gap-2">
                           <span className={`px-1.5 py-0.5 rounded font-bold ${q.statusCode >= 400 ? 'bg-red-500/20 text-red-500 border border-red-500/20' : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/20'}`}>
                              {q.statusCode}
                           </span>
                           <span className={`px-1.5 py-0.5 rounded font-mono ${q.durationMs > 500 ? 'bg-amber-500/20 text-amber-500' : 'bg-cyan-500/20 text-cyan-500'}`}>
                             {q.durationMs}ms
                           </span>
                        </div>
                     </div>
                     <span className={`font-mono leading-relaxed ${q.statusCode >= 400 ? 'text-red-400/80' : 'text-neutral-300'}`}>{q.query}</span>
                  </div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {activeTab === 'email_security' && (
          <motion.div
            key="email_security"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex-1 flex flex-col gap-4 min-h-0"
          >
            {/* Interactive Dispatch simulators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
              <button
                onClick={handleSimulateForgotPassword}
                className="p-4 rounded-xl border border-amber-500/20 bg-amber-950/10 hover:bg-amber-500 hover:text-black transition-all cursor-pointer text-left focus:outline-none flex flex-col justify-between"
              >
                <div className="flex items-center gap-2 mb-2 text-amber-400 font-bold text-xs uppercase hover:text-inherit">
                  <Key className="w-4 h-4" />
                  <span>Simular Redefinir Senha</span>
                </div>
                <p className="text-[10px] text-neutral-400 hover:text-inherit font-sans">Simula o disparo SMTP de um link criptográfico de segurança para recuperação de chaves.</p>
              </button>

              <button
                onClick={handleSimulateSecurityAlert}
                className="p-4 rounded-xl border border-red-500/20 bg-red-950/10 hover:bg-red-500 hover:text-white transition-all cursor-pointer text-left focus:outline-none flex flex-col justify-between"
              >
                <div className="flex items-center gap-2 mb-2 text-red-400 font-bold text-xs uppercase hover:text-inherit">
                  <Shield className="w-4 h-4" />
                  <span>Simular Alerta Crítico</span>
                </div>
                <p className="text-[10px] text-neutral-400 hover:text-inherit font-sans">Despacha notificação crítica de login anômalo ou tentativa de ataque cibernético.</p>
              </button>
            </div>

            {/* Email dispatch stream logs */}
            <div className="flex-1 bg-[#050508] border border-white/5 rounded-xl p-4 overflow-y-auto no-scrollbar shadow-inner relative flex flex-col justify-start">
              <div className="flex items-center gap-2 mb-4 text-[#00c8ff] text-[10px] uppercase font-bold shrink-0">
                <Mail className="w-4 h-4" />
                <span>Logs do Gateway SMTP Redundante INVIS (juninho.portoj@gmail.com)</span>
              </div>

              <div className="space-y-3">
                {emailLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-3 rounded-xl border text-[10px] ${
                      log.level === 'error' ? 'bg-red-950/10 border-red-500/20' : 'bg-black/30 border-white/5'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1.5 font-mono text-[9px] text-neutral-500">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold uppercase text-amber-500">[{log.source}]</span>
                        <span>Destinatário: <strong className="text-white font-sans">{log.recipient}</strong></span>
                      </div>
                      <span>{log.timestamp}</span>
                    </div>
                    <p className={`text-left leading-normal ${log.level === 'error' ? 'text-red-400 font-bold' : 'text-neutral-300'}`}>
                      {log.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
};
