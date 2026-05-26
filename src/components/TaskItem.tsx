import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trash2, 
  Edit3, 
  Clock, 
  Check, 
  AlertTriangle, 
  Zap, 
  HelpCircle, 
  Sparkles,
  Calendar,
  AlertOctagon,
  Bell
} from 'lucide-react';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  reminderTime?: string;
}

interface TaskItemProps {
  task: Task;
  // Handlers
  onToggleComplete: (id: string) => void;
  onStartEdit: (task: Task) => void;
  onSaveEdit: (id: string) => void;
  onDeleteRequest: (id: string) => void;
  // Editing states passed from parent so parent coordinates
  isEditing: boolean;
  editingText: string;
  setEditingText: (text: string) => void;
  // Reminder states
  isSettingReminder: boolean;
  reminderTimeStr: string;
  setReminderTimeStr: (str: string) => void;
  onSetReminder: (id: string) => void;
  onToggleReminderSetup: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onStartEdit,
  onSaveEdit,
  onDeleteRequest,
  isEditing,
  editingText,
  setEditingText,
  isSettingReminder,
  reminderTimeStr,
  setReminderTimeStr,
  onSetReminder,
  onToggleReminderSetup
}) => {
  // Helper to render priority visual indicators
  const renderPriorityBadge = () => {
    switch (task.priority) {
      case 'high':
        return (
          <div className="flex items-center gap-1.5 bg-red-500/25 border-2 border-red-500 text-red-100 font-sans font-black px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider select-none shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.4)] animate-pulse" title="Alta Criticidade">
            <AlertOctagon className="w-3 h-3 text-red-400 shrink-0 stroke-[2.5px]" />
            <span>Crítica</span>
          </div>
        );
      case 'medium':
        return (
          <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/50 text-amber-200 font-sans font-bold px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider select-none shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.2)]" title="Média Criticidade">
            <Zap className="w-3 h-3 text-amber-400 shrink-0 fill-amber-400 stroke-[1.5px]" />
            <span>Média</span>
          </div>
        );
      case 'low':
      default:
        return (
          <div className="flex items-center gap-1.5 bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 font-sans font-medium px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider select-none shrink-0" title="Baixa Criticidade">
            <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
            <span>Baixa</span>
          </div>
        );
    }
  };

  // Helper to render the small status indicator requested by the user
  const renderStatusIndicator = () => {
    if (task.completed) {
      return (
        <div 
          className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 shrink-0 hover:scale-110 transition-all cursor-help"
          title="Status: Finalizado Sem Impedimentos"
        >
          <span className="text-[9px] font-bold font-mono">✓</span>
        </div>
      );
    }

    switch (task.priority) {
      case 'high':
        return (
          <div 
            className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500/10 border border-red-500/50 text-red-500 animate-pulse shrink-0 hover:scale-110 transition-all cursor-help"
            title="SINALIZADOR CRÍTICO: Bloqueios ou Elevada Severidade"
          >
            <span className="text-[10px] font-black font-mono">⚠️</span>
          </div>
        );
      case 'medium':
        return (
          <div 
            className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/50 text-amber-500 shrink-0 hover:scale-110 transition-all cursor-help"
            title="SINALIZADOR ATENÇÃO: Monitoramento de Prazo Corrente"
          >
            <span className="text-[10px] font-black font-mono">⏳</span>
          </div>
        );
      case 'low':
      default:
        return (
          <div 
            className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 shrink-0 animate-pulse hover:scale-110 transition-all cursor-help"
            title="SINALIZADOR ESTÁVEL: Fluxo ativo sem gargalos"
          >
            <span className="text-[7.5px] font-black">●</span>
          </div>
        );
    }
  };

  const formattedDate = () => {
    try {
      const d = new Date(task.createdAt);
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ' - ' + d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -15 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className={`relative p-2.5 rounded-xl border flex flex-col gap-1.5 relative overflow-hidden transition-all duration-300 ${
        task.completed 
          ? 'bg-neutral-950/45 border-white/5 opacity-60 backdrop-blur-sm shadow-inner' 
          : task.priority === 'high'
            ? 'bg-red-500/5 border-red-500/20 text-neutral-200 hover:border-red-500/35 hover:bg-red-500/8'
            : task.priority === 'medium'
              ? 'bg-amber-500/5 border-amber-500/15 text-neutral-200 hover:border-amber-500/30 hover:bg-amber-500/8'
              : 'bg-cyan-500/3 border-cyan-500/10 text-neutral-200 hover:border-cyan-500/25 hover:bg-cyan-500/5'
      }`}
    >
      {/* Decorative vertical bar aligned to priority rank */}
      <div className={`absolute top-0 bottom-0 left-0 w-1 ${
        task.priority === 'high' ? 'bg-red-500' :
        task.priority === 'medium' ? 'bg-purple-500' : 'bg-cyan-500'
      }`} />

      <div className="flex items-start sm:items-center gap-3 w-full">
        {/* Hand-crafted custom checkbox with physical spring effect */}
        <button
          onClick={() => onToggleComplete(task.id)}
          className="p-1 rounded text-neutral-500 hover:text-white cursor-pointer select-none transition-transform active:scale-90 mt-0.5 sm:mt-0"
          type="button"
        >
          {task.completed ? (
            <motion.div 
              initial={{ scale: 0.6, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
              className="w-5 h-5 rounded-md bg-[#00FF80]/15 border border-[#00FF80] flex items-center justify-center shadow-[0_0_8px_rgba(0,255,128,0.25)]"
            >
              <Check className="w-3.5 h-3.5 text-[#00FF80] font-black stroke-[3px]" />
            </motion.div>
          ) : (
            <div className="w-5 h-5 rounded-md border border-neutral-600 hover:border-neutral-400 flex items-center justify-center transition-colors">
              {/* Colored priority Dot inside center when unchecked */}
              <div className={`w-1.5 h-1.5 rounded-full ${
                task.priority === 'high' ? 'bg-red-500' :
                task.priority === 'medium' ? 'bg-purple-500' : 'bg-cyan-500'
              }`} />
            </div>
          )}
        </button>

        {/* Small operational status indicator circle / icon requested by the user */}
        {renderStatusIndicator()}

        {/* Text of Task / Edit text field */}
        {isEditing ? (
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              className="flex-1 px-2.5 py-1.5 bg-[#050508] border border-purple-500/40 rounded text-xs text-white outline-none focus:ring-1 focus:ring-purple-500/40"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSaveEdit(task.id);
              }}
            />
            <button
              onClick={() => onSaveEdit(task.id)}
              className="px-2.5 py-1 text-[10px] font-black text-[#00FF80] uppercase hover:bg-[#00FF80]/5 rounded tracking-wider bg-black/40 border border-emerald-500/10 cursor-pointer"
              type="button"
            >
              Salvar
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col text-left">
            <span 
              className={`text-[11.5px] leading-relaxed font-sans transition-all duration-300 ${
                task.completed 
                  ? 'line-through text-neutral-500 italic opacity-75' 
                  : 'font-medium'
              }`}
              style={{
                // Subtle blur effect on task text for completed items
                filter: task.completed ? 'blur(1px)' : 'none'
              }}
            >
              {task.text}
            </span>
            <span className="text-[8px] text-neutral-500 font-mono mt-1 flex items-center gap-1 select-none flex-wrap">
              <Calendar className="w-2.5 h-2.5 shrink-0" />
              <span>Criado: {formattedDate()}</span>
              {!task.completed && (
                <>
                  <span className="text-white/10 mx-1">|</span>
                  <button
                    onClick={() => onToggleReminderSetup(task.id)}
                    className={`flex items-center gap-1 text-[8.5px] font-bold tracking-wider uppercase font-mono px-1 rounded hover:bg-amber-500/15 transition-all cursor-pointer ${
                      task.reminderTime 
                        ? 'text-amber-400 animate-pulse bg-amber-950/30 border border-amber-500/30 px-1.5' 
                        : 'text-neutral-500 hover:text-amber-400'
                    }`}
                    title="Definir lembrete via push"
                    type="button"
                  >
                    <Bell className="w-2.5 h-2.5" />
                    <span>{task.reminderTime ? 'Alerta Ativo' : 'Definir Lembrete Push'}</span>
                  </button>
                </>
              )}
            </span>
          </div>
        )}

        {/* Priority Badge */}
        {renderPriorityBadge()}

        {/* Secondary controls delete/edit/reminders */}
        <div className="flex items-center gap-1 shrink-0 ml-1">
          {/* Reminder Scheduler Button */}
          {!task.completed && (
            <button
              onClick={() => onToggleReminderSetup(task.id)}
              className={`p-1.5 rounded transition-all hover:bg-white/5 cursor-pointer ${task.reminderTime ? 'text-amber-400 font-extrabold' : 'text-neutral-500 hover:text-white'}`}
              title="Agendar lembrete via push"
              type="button"
            >
              <Clock className={`w-3.5 h-3.5 ${task.reminderTime ? 'animate-pulse text-amber-400' : ''}`} />
            </button>
          )}

          <button
            onClick={() => onStartEdit(task)}
            className="p-1 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
            title="Editar Tarefa"
            type="button"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onDeleteRequest(task.id)}
            className="p-1 text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer"
            title="Excluir Tarefa"
            type="button"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Reminder setup embedded view panel */}
      <AnimatePresence>
        {isSettingReminder && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-amber-500/10 pt-2 pb-1 flex flex-col gap-2 bg-amber-950/10 px-2 rounded-lg mt-1"
          >
            <div className="flex justify-between items-center select-none">
              <label className="text-amber-400 text-[8.5px] uppercase font-bold tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-500" />
                <span>Programar alerta periódico redundante:</span>
              </label>
              {task.reminderTime && (
                <span className="text-[7.5px] text-green-400 uppercase font-mono">Agendamento Ativo</span>
              )}
            </div>

            <div className="flex gap-2 items-center">
              <select
                value={reminderTimeStr}
                onChange={(e) => setReminderTimeStr(e.target.value)}
                className="px-2 py-1 bg-[#050508] border border-white/5 rounded text-[10px] text-neutral-300 outline-none flex-1 font-mono cursor-pointer"
              >
                <option value="">Selecione...</option>
                <option value="5">Em 5 segundos (Teste Rápido)</option>
                <option value="15">Em 15 segundos</option>
                <option value="60">Em 1 minuto</option>
                <option value="300">Em 5 minutos</option>
                <option value="1800">Em 30 minutos</option>
                <option value="3600">Em 1 hora</option>
              </select>

              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => onToggleReminderSetup(task.id)}
                  className="p-1 px-2.5 bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white text-[9px] uppercase rounded font-bold cursor-pointer"
                  type="button"
                >
                  Fechar
                </button>
                <button
                  onClick={() => onSetReminder(task.id)}
                  disabled={!reminderTimeStr}
                  className="px-2.5 py-1 bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-40 text-[9px] font-black uppercase rounded shadow-[0_0_8px_rgba(245,158,11,0.25)] cursor-pointer"
                  type="button"
                >
                  Ativar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
