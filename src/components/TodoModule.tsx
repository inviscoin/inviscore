import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ClipboardList, 
  Zap, 
  Bell, 
  CheckCircle2, 
  Search, 
  ArrowUpDown, 
  AlertTriangle, 
  Plus, 
  Trash2,
  X,
  HelpCircle,
  Sparkles,
  AlertOctagon,
  Info
} from 'lucide-react';
import { TaskItem, Task } from './TaskItem';
import { useInvis } from '../context/InvisContext';
import { SupabaseService, isSupabaseConfigured } from '../lib/supabase';

export const TodoModule: React.FC = () => {
  const { currentUser } = useInvis();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // Searching & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');

  // Deletion Confirmation Target Modal (replaces inline system with proper secure modal)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Custom reminder modal/input setup coordinated in state
  const [reminderTaskId, setReminderTaskId] = useState<string | null>(null);
  const [reminderTimeStr, setReminderTimeStr] = useState('');

  // Sincronizar logs e notificações simuladas com push / monitoramento
  const [pushEnabled, setPushEnabled] = useState(false);

  // Load from Supabase or LocalStorage
  useEffect(() => {
    const loadTasks = async () => {
      if (currentUser?.id && isSupabaseConfigured()) {
        const dbTasks = await SupabaseService.fetchTasks(currentUser.id);
        if (dbTasks && dbTasks.length > 0) {
          setTasks(dbTasks);
          return;
        }
      }

      const saved = localStorage.getItem('invis_tasks');
      if (saved) {
        try {
          setTasks(JSON.parse(saved));
        } catch (e) {
          console.error('Falha ao carregar tarefas');
        }
      } else {
        // Default initial tasks matching Matrix & INVIS concepts
        setTasks([
          { id: '1', text: 'Sincronizar chaves criptográficas do barramento de dados', completed: true, priority: 'high', createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
          { id: '2', text: 'Verificar latência global dos nós IPFS e Supabase PG logs', completed: false, priority: 'medium', createdAt: new Date(Date.now() - 3600000).toISOString() },
          { id: '3', text: 'Simular transação de teste com API Gateway Mercado Pago', completed: false, priority: 'low', createdAt: new Date().toISOString() }
        ]);
      }
    };

    loadTasks();

    // Check push notifications permission simulation
    const pushStatus = localStorage.getItem('invis_push_enabled') === 'true';
    setPushEnabled(pushStatus);
  }, [currentUser?.id]);

  // Poll for scheduled reminders
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      let updatedTasks = false;
      
      const nextTasks = tasks.map(task => {
        if (task.reminderTime && !task.completed) {
          const remDate = new Date(task.reminderTime);
          if (now >= remDate) {
            // Trigger push warning!
            dispatchPushNotification(
              'Alerta de Lembrete Crítico! ⏰',
              `Lembrete agendado para o protocolo: "${task.text}"`
            );
            triggerHaptic([80, 50, 80]);
            updatedTasks = true;
            // Clear reminder once fired index
            return { ...task, reminderTime: undefined };
          }
        }
        return task;
      });

      if (updatedTasks) {
        saveTasks(nextTasks);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [tasks, pushEnabled]);

  const saveTasks = (updated: Task[], actionType?: 'upsert' | 'delete', targetTask?: Task) => {
    setTasks(updated);
    localStorage.setItem('invis_tasks', JSON.stringify(updated));

    if (currentUser?.id && isSupabaseConfigured()) {
      if (actionType === 'delete' && targetTask) {
        SupabaseService.deleteTask(currentUser.id, targetTask.id);
      } else if (actionType === 'upsert' && targetTask) {
        SupabaseService.upsertTask(currentUser.id, targetTask);
      } else {
        updated.forEach(t => {
          SupabaseService.upsertTask(currentUser.id!, t);
        });
      }
    }
  };

  const triggerHaptic = (ms: number | number[] = 20) => {
    if (navigator.vibrate) {
      navigator.vibrate(ms as any);
    }
  };

  // Simulated push notification dispatcher
  const dispatchPushNotification = (title: string, body: string) => {
    const pushStatus = localStorage.getItem('invis_push_enabled') === 'true';
    if (pushStatus || true) { // Always show high contrast overlay when push is simulated
      // Show local toast / notification overlay
      if ('Notification' in window && Notification.permission === 'granted' && pushEnabled) {
        new Notification(title, { body, icon: '/favicon.ico' });
      } else {
        // Fallback custom alert
        let container = document.getElementById('invis-toast-container');
        if (!container) {
          container = document.createElement('div');
          container.id = 'invis-toast-container';
          container.className = 'fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm pointer-events-none';
          document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.className = 'p-4 rounded-2xl bg-[#0d0d12]/95 border-2 border-[#00c8ff] text-white shadow-[0_0_20px_rgba(0,200,255,0.35)] flex items-start gap-3 transition-opacity duration-300 pointer-events-auto transform hover:scale-[1.02] cursor-pointer';
        toast.onclick = () => toast.remove();
        toast.innerHTML = `
          <div class="p-1 rounded-full bg-[#00c8ff]/10 text-[#00c8ff] shrink-0 font-bold">📡</div>
          <div>
            <h4 class="text-xs font-black uppercase tracking-wider text-white">${title}</h4>
            <p class="text-[10px] text-neutral-400 mt-1">${body}</p>
          </div>
        `;
        container.appendChild(toast);
        setTimeout(() => {
          toast.style.opacity = '0';
          setTimeout(() => toast.remove(), 300);
        }, 6000);
      }
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    triggerHaptic(40);
    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      completed: false,
      priority: newPriority,
      createdAt: new Date().toISOString()
    };

    const updated = [...tasks, newTask];
    saveTasks(updated, 'upsert', newTask);
    setNewTaskText('');
    setNewPriority('medium');

    dispatchPushNotification(
      'Tarefa Agendada 🎯',
      `Nova tarefa adicionada ao painel operacional: "${newTask.text}"`
    );
  };

  const handleToggleComplete = (id: string) => {
    triggerHaptic(30);
    let toggledTask: Task | undefined;
    const updated = tasks.map(t => {
      if (t.id === id) {
        const nextState = !t.completed;
        if (nextState) {
          dispatchPushNotification(
            'Tarefa Concluída! 🎉',
            `Você finalizou o protocolo operacional: "${t.text}"`
          );
        }
        toggledTask = { ...t, completed: nextState };
        return toggledTask;
      }
      return t;
    });
    saveTasks(updated, 'upsert', toggledTask);
  };

  const handleStartEdit = (task: Task) => {
    triggerHaptic(20);
    setEditingTaskId(task.id);
    setEditingText(task.text);
  };

  const handleSaveEdit = (id: string) => {
    triggerHaptic(40);
    let editedTask: Task | undefined;
    const updated = tasks.map(t => {
      if (t.id === id) {
        editedTask = { ...t, text: editingText.trim() };
        return editedTask;
      }
      return t;
    });
    saveTasks(updated, 'upsert', editedTask);
    setEditingTaskId(null);
    setEditingText('');
  };

  const handleDeleteRequest = (id: string) => {
    triggerHaptic(40);
    const target = tasks.find(t => t.id === id);
    if (target) {
      setTaskToDelete(target);
    }
  };

  const handleConfirmDeleteAndDismiss = () => {
    if (!taskToDelete) return;
    triggerHaptic(85);
    const targetId = taskToDelete.id;
    const targetText = taskToDelete.text;
    const updated = tasks.filter(t => t.id !== targetId);
    saveTasks(updated, 'delete', taskToDelete);
    setTaskToDelete(null);

    dispatchPushNotification(
      'Tarefa Excluída 🗑️',
      `O registro da tarefa foi cancelado permanentemente: "${targetText}"`
    );
  };

  const handleSetReminder = (id: string) => {
    triggerHaptic(35);
    if (!reminderTimeStr) return;

    const futureDate = new Date(Date.now() + parseInt(reminderTimeStr) * 1000);
    
    let updatedTask: Task | undefined;
    const updated = tasks.map(t => {
      if (t.id === id) {
        updatedTask = { ...t, reminderTime: futureDate.toISOString() };
        return updatedTask;
      }
      return t;
    });

    saveTasks(updated, 'upsert', updatedTask);
    
    dispatchPushNotification(
      'Lembrete Configurado! 📡',
      `Dispositivo de notificação emparelhado com êxito.`
    );
    setReminderTaskId(null);
    setReminderTimeStr('');
  };

  const handleToggleReminderSetup = (id: string) => {
    triggerHaptic(15);
    setReminderTaskId(prev => prev === id ? null : id);
  };

  const togglePushNotifications = () => {
    triggerHaptic(50);
    const nextState = !pushEnabled;
    setPushEnabled(nextState);
    localStorage.setItem('invis_push_enabled', nextState ? 'true' : 'false');

    if (nextState) {
      if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            dispatchPushNotification('Notificações Prontas 📡', 'O sistema INVIS Core está emparelhado ao seu dispositivo com sucesso.');
          } else {
            dispatchPushNotification('Notificações Prontas 📡', 'O sistema INVIS Core está emparelhado ao seu dispositivo com sucesso.');
          }
        });
      } else {
        dispatchPushNotification('Notificações Prontas 📡', 'O sistema INVIS Core está emparelhado ao seu dispositivo com sucesso.');
      }
    }
  };

  // Helper priority weight
  const priorityWeight = (p: 'low' | 'medium' | 'high') => {
    if (p === 'high') return 3;
    if (p === 'medium') return 2;
    return 1;
  };

  // Apply search query first
  const filteredTasks = tasks.filter(t => 
    t.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sorting
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'priority') {
      const diff = priorityWeight(b.priority) - priorityWeight(a.priority);
      if (diff !== 0) return diff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      // By Creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="w-full h-full flex flex-col bg-[#0b0e11] p-2 text-[#e0e0e0] font-sans overflow-y-auto no-scrollbar pb-3">
      
      {/* Task input form */}
      <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-1.5 bg-black/40 border border-white/5 p-1.5 rounded-xl mb-2 shrink-0">
        <input
          type="text"
          placeholder="Agendar protocolo / ação..."
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          className="flex-1 px-2.5 py-1.5 bg-[#050508] border border-white/5 rounded-lg text-neutral-200 text-[10.5px] outline-none focus:border-purple-500/50 font-sans"
        />

        <div className="flex gap-1.5 items-center font-mono">
          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value as any)}
            className="px-1.5 py-1.5 bg-[#050508] border border-white/5 rounded-lg text-[10px] text-neutral-400 outline-none cursor-pointer hover:border-white/10"
          >
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
          </select>

          <button
            type="submit"
            className="p-1.5 sm:px-3 rounded-lg bg-purple-600 text-white hover:bg-purple-500 text-[10.5px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 text-white font-black" />
            <span className="hidden sm:inline">Adicionar</span>
          </button>
        </div>
      </form>

      {/* Searching & Sorting Controls */}
      <div className="flex gap-1.5 mb-1.5 items-center shrink-0 font-mono">
        {/* Search Field */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1.5 w-3 h-3 text-neutral-500" />
          <input
            type="text"
            placeholder="Filtrar tarefas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7 pr-3 py-1 bg-black/30 border border-white/5 rounded-lg text-[10px] text-neutral-300 outline-none focus:border-purple-500/30 font-sans"
          />
        </div>

        {/* Sorting Buttons & Bell */}
        <div className="flex gap-0.5 bg-black/45 border border-white/5 p-0.5 rounded-lg shrink-0 items-center">
          <button
            onClick={() => { triggerHaptic(15); setSortBy('date'); }}
            className={`px-2 py-0.5 rounded text-[8.5px] font-mono font-bold uppercase transition-all cursor-pointer ${
              sortBy === 'date' 
                ? 'bg-purple-600 text-white' 
                : 'text-neutral-400 hover:text-white'
            }`}
            type="button"
          >
            Recent
          </button>
          <button
            onClick={() => { triggerHaptic(15); setSortBy('priority'); }}
            className={`px-2 py-0.5 rounded text-[8.5px] font-mono font-bold uppercase transition-all cursor-pointer ${
              sortBy === 'priority' 
                ? 'bg-purple-600 text-white' 
                : 'text-neutral-400 hover:text-white'
            }`}
            type="button"
          >
            Prio
          </button>
          <span className="w-[1px] h-3.5 bg-white/10 mx-1" />
          <button
            onClick={togglePushNotifications}
            className={`px-1.5 py-0.5 rounded text-[8.5px] transition-all uppercase cursor-pointer select-none font-mono flex items-center gap-0.5 ${
              pushEnabled 
                ? 'bg-purple-950/20 text-purple-400 font-black' 
                : 'text-neutral-500 hover:text-neutral-400'
            }`}
            title={pushEnabled ? "Desativar alertas" : "Ativar alertas"}
            type="button"
          >
            <Bell className="w-2.5 h-2.5" />
            <span>{pushEnabled ? 'Push' : 'Off'}</span>
          </button>
        </div>
      </div>

      {/* Priority Visual Legend Box */}
      <div className="p-1 mb-1.5 rounded-lg bg-black/30 border border-purple-500/10 flex items-center justify-between gap-1 shrink-0">
        <div className="flex items-center gap-1 pl-1">
          <Info className="w-3 h-3 text-purple-400 shrink-0" />
          <span className="text-[8px] uppercase text-neutral-400 font-mono">Legendas:</span>
        </div>

        <div className="flex flex-wrap gap-2 pr-1">
          {/* Legenda Alta */}
          <div className="flex items-center gap-1 text-[8px] font-mono hover:opacity-80 transition-opacity" title="Crítica: Sinalizador de risco ou bloqueio">
            <span className="text-red-500">⚠️</span>
            <span className="text-rose-400">Crítico</span>
          </div>
          {/* Legenda Médio */}
          <div className="flex items-center gap-1 text-[8px] font-mono hover:opacity-80 transition-opacity" title="Média: Monitorização de prazo preventivo">
            <span className="text-amber-500">⏳</span>
            <span className="text-amber-400">Prazo</span>
          </div>
          {/* Legenda Baixa */}
          <div className="flex items-center gap-1 text-[8px] font-mono hover:opacity-80 transition-opacity" title="Baixa: Fluxo contínuo sem entraves">
            <span className="text-cyan-400">●</span>
            <span className="text-cyan-400">Fluxo</span>
          </div>
        </div>
      </div>

      {/* Task List container loading modular TaskItem instances */}
      <div className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
        {sortedTasks.length === 0 ? (
          <div className="py-12 text-center text-neutral-600 space-y-2 border border-white/5 border-dashed rounded-2xl flex flex-col items-center select-none font-mono">
            <CheckCircle2 className="w-10 h-10 text-neutral-700 animate-pulse" />
            <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Nenhum protocolo correspondente.</p>
            <p className="text-[8px] text-neutral-600">Crie ou altere seus parâmetros de filtragem.</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {sortedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={handleToggleComplete}
                onStartEdit={handleStartEdit}
                onSaveEdit={handleSaveEdit}
                onDeleteRequest={handleDeleteRequest}
                isEditing={editingTaskId === task.id}
                editingText={editingText}
                setEditingText={setEditingText}
                isSettingReminder={reminderTaskId === task.id}
                reminderTimeStr={reminderTimeStr}
                setReminderTimeStr={setReminderTimeStr}
                onSetReminder={handleSetReminder}
                onToggleReminderSetup={handleToggleReminderSetup}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* MODAL Backed Absolute Confirmation to prevent accidental exclusions */}
      <AnimatePresence>
        {taskToDelete && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            {/* Blurry dark backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTaskToDelete(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* High-Contrast elegant dialog modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="relative w-full max-w-md bg-[#0d0d12] border border-[#ff3b30]/30 rounded-2xl p-5 shadow-[0_0_35px_rgba(255,59,48,0.18)]"
            >
              {/* Alert icon & titles */}
              <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                <div className="p-2 bg-rose-500/10 rounded-xl border border-rose-500/25 text-rose-500 animate-pulse">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="text-left font-mono">
                  <h4 className="text-xs font-black uppercase text-white tracking-widest">Confirmação de Exclusão</h4>
                  <p className="text-[8.5px] text-neutral-400 mt-0.5">Esta ação não pode ser desfeita na nossa base.</p>
                </div>
              </div>

              {/* Description about target */}
              <div className="my-4 py-3 px-3.5 bg-black/35 rounded-xl border border-white/5 text-left font-sans">
                <span className="text-[9px] font-mono text-neutral-500 uppercase block select-none">Protocolo operacional a ser limpo:</span>
                <p className="text-[11.5px] font-medium text-neutral-200 mt-1.5 leading-relaxed">{taskToDelete.text}</p>
                
                <div className="mt-3 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    taskToDelete.priority === 'high' ? 'bg-red-500 animate-ping' :
                    taskToDelete.priority === 'medium' ? 'bg-purple-500' : 'bg-cyan-500'
                  }`} />
                  <span className="text-[8.5px] font-mono uppercase text-neutral-400 font-bold">Prioridade: {taskToDelete.priority}</span>
                </div>
              </div>

              {/* Action layout */}
              <div className="flex gap-2.5 font-mono">
                <button
                  onClick={() => setTaskToDelete(null)}
                  className="flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-300 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                  type="button"
                >
                  Voltar / Manter
                </button>

                <button
                  onClick={handleConfirmDeleteAndDismiss}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_15px_rgba(220,38,38,0.25)] flex items-center justify-center gap-1.5 hover:shadow-[0_0_20px_rgba(220,38,38,0.45)]"
                  type="button"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Confirmar Exclusão</span>
                </button>
              </div>

              {/* Cross dismiss corner button */}
              <button
                onClick={() => setTaskToDelete(null)}
                className="absolute top-4 right-4 p-1 text-neutral-500 hover:text-white transition-colors"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
