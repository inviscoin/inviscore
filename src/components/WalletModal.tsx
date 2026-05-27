import React, { useState } from 'react';
import { useInvis, DICTIONARY } from '../context/InvisContext';
import { useTranslation } from '../hooks/useTranslation';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Landmark, ArrowRight, History, X, Copy, Check, ShieldAlert, ArrowLeftRight, HeartHandshake } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenShop?: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, onOpenShop }) => {
  const { 
    wallet, setWallet, transactions, addTransaction, language, currentUser, setSystemStatus 
  } = useInvis();

  const [mode, setMode] = useState<'card' | 'convert' | 'donate'>('card');
  const [copiedKey, setCopiedKey] = useState(false);
  const [pixNameInput, setPixNameInput] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [amlValidationError, setAmlValidationError] = useState('');

  if (!isOpen) return null;

  const { currentTexts } = useTranslation();

  // Dual-Wallet values
  const conversionRate = 2500; // 2500ic = R$ 1.00
  const fiatEquivalent = wallet.icGold / conversionRate;
  const satisfiesMinimum = fiatEquivalent >= 20.00;

  const copyPixKey = () => {
    navigator.clipboard.writeText('invis.suporte@gmail.com');
    setCopiedKey(true);
    if (navigator.vibrate) navigator.vibrate(50);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleWithdrawalRequest = () => {
    if (!satisfiesMinimum) {
      alert('Limite mínimo de R$ 20,00 não atendido.');
      return;
    }

    setAmlValidationError('');

    // Strict Nominal Matching AML Check: recipient must literally match registered Full Name
    if (!pixNameInput.trim()) {
      setAmlValidationError('Digite o nome do titular da chave PIX.');
      return;
    }

    const regName = currentUser?.fullName || '';
    if (pixNameInput.trim().toUpperCase() !== regName.toUpperCase()) {
      // Divergent AML blocking trigger
      setAmlValidationError('Divergência de titularidade. O saque deve ser obrigatoriamente para uma conta própria regulamentada (Nominal Matching AML Guard).');
      addTransaction({
        type: 'Spend',
        amount: '0.0000',
        desc: 'Bloqueio de Saque: Tentativa de lavagem detectada'
      });
      return;
    }

    // Success flow: deduct exact balance
    const penaltyDeduction = wallet.icGold;
    setWallet(prev => ({ ...prev, icGold: 0 }));
    setWithdrawSuccess(true);
    setSystemStatus('Saque Efetuado');

    addTransaction({
      type: 'Spend',
      amount: `-${penaltyDeduction.toFixed(4)}`,
      desc: `Saque Realizado: R$ ${fiatEquivalent.toFixed(2)} transferido via PIX`
    });
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/90 font-sans p-4 backdrop-blur-md cursor-pointer"
    >
      
      {/* Container Card with Cyan Glowing border */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md glass-container border border-cyan-500/30 p-6 flex flex-col relative rounded-[32px] overflow-hidden bg-[#0b0e11]/95 text-white shadow-[0_0_40px_rgba(0,200,255,0.2)] cursor-default"
      >
        
        {/* Header section */}
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-cyan-400">
            <CreditCard className="w-5 h-5 animate-pulse" />
            <h2 className="font-mono text-xs tracking-[0.25em] uppercase font-black">{currentTexts.wallet_title}</h2>
          </div>
          <button 
            onClick={() => { onClose(); setMode('card'); setWithdrawSuccess(false); setPixNameInput(''); setAmlValidationError(''); }} 
            className="p-2 rounded-full hover:bg-neutral-800 transition-all text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <AnimatePresence mode="wait">
          {mode === 'card' && (
            /* MAIN CREDIT CARD INTERFACE VIEW */
            <motion.div
              key="main-card-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col space-y-6"
            >
              {/* O CARTÃO INVIS (Identidade Visual Premium) */}
              <div 
                className="w-full h-48 rounded-2xl p-5 relative overflow-hidden select-none"
                style={{
                  background: 'linear-gradient(135deg, #121212 0%, #1a1a2e 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4)'
                }}
              >
                {/* Shiny Golden Microchip */}
                <div 
                  className="w-11 h-9 rounded-md relative mb-6"
                  style={{
                    background: 'linear-gradient(135deg, #ffd700, #d4af37)',
                    border: '1.5px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <div className="absolute inset-1 border-[0.5px] border-black/30 rounded" />
                </div>

                <div className="absolute top-5 right-5 text-[10px] tracking-widest font-mono font-black italic opacity-35 text-[#00c8ff]">
                  INVIS SINCRO
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase">
                    {currentUser?.tier || 'FREE'} ACC / @{currentUser?.nickname || 'Guest'}
                  </p>
                  <p className="text-2xl font-black font-mono text-[#00c8ff] tracking-wider">
                    {wallet.icGold.toFixed(4)} <span className="text-xs uppercase font-medium opacity-65 text-neutral-400">ic</span>
                  </p>
                </div>

                <div className="absolute bottom-5 right-5 text-right font-mono text-[10px]">
                  <p className="text-neutral-500 font-bold uppercase">SALDO PRATA</p>
                  <p className="text-neutral-300 font-bold">{wallet.icSilver.toFixed(2)} ic</p>
                </div>
              </div>

              {/* TRANSACTIONS LIST SECTION (HISTORY) */}
              <div className="flex flex-col flex-1 max-h-48">
                <div className="flex items-center gap-1.5 mb-2 font-mono text-[10px] text-neutral-500 font-black uppercase">
                  <History className="w-3.5 h-3.5" />
                  <span>Últimas Transações (Livro-Razão)</span>
                </div>

                {/* List body container with mask */}
                <div className="overflow-y-auto no-scrollbar space-y-2 flex-1 max-h-40 pr-1">
                  {transactions.map((tx) => (
                    <div 
                      key={tx.id} 
                      className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-sm ${
                          tx.type === 'Spend' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {tx.type === 'Spend' ? '↓' : '↑'}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-neutral-200">{tx.desc}</p>
                          <p className="text-[10px] text-neutral-500 font-mono">{tx.date}</p>
                        </div>
                      </div>
                      <span className={`font-mono text-xs font-bold leading-none ${
                        tx.type === 'Spend' ? 'text-red-400' : 'text-emerald-400'
                      }`}>
                        {tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons triggers */}
              <div className="flex flex-col gap-3">
                <div className="flex gap-4">
                  <button
                    onClick={() => setMode('convert')}
                    className="flex-1 py-3.5 border border-cyan-400 text-cyan-400 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-cyan-400/10 cursor-pointer"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                    <span>CONVERTER</span>
                  </button>

                  <button
                    onClick={() => setMode('donate')}
                    className="flex-1 py-3.5 border border-[#8a2be2] text-[#8a2be2] rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-purple-950/10 cursor-pointer"
                  >
                    <HeartHandshake className="w-4 h-4" />
                    <span>CONTRIBUIR</span>
                  </button>
                </div>

                {onOpenShop && (
                  <button
                    onClick={() => {
                      if (navigator.vibrate) navigator.vibrate(25);
                      onClose();
                      onOpenShop();
                      setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('invis_open_inventory'));
                      }, 150);
                    }}
                    className="w-full py-3 bg-fuchsia-950/20 hover:bg-fuchsia-900/35 border border-fuchsia-500/20 text-fuchsia-400 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <span>🎁 DOAR ITENS DO INVENTÁRIO</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {mode === 'convert' && (
            /* WITHDRAW FIAT CONVERTER VIEW WITH AML MATCH */
            <motion.div
              key="convert-view"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex flex-col space-y-5"
            >
              <div className="text-center py-4 bg-black/40 rounded-2xl border border-white/5">
                <h3 className="text-xs font-mono tracking-widest text-[#00FF80] uppercase mb-4">Paridade Fiduciária</h3>
                <p className="text-4xl font-extrabold text-[#00FF80]">R$ {fiatEquivalent.toFixed(2)}</p>
                <p className="text-[10px] text-neutral-500 font-mono mt-1">TAXA: {conversionRate} ic = R$ 1,00</p>
              </div>

              <div className="p-4 rounded-xl bg-[#ff4d4d]/10 border border-[#ff4d4d]/30 text-start flex gap-3 text-xs leading-relaxed">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-red-400 uppercase font-mono tracking-wider">Regulamento de Segurança AML</h4>
                  <p className="text-neutral-300 mt-1">O nome completo registrado no sistema deve coincidir idênticamente com o titular do PIX destinatário para liberação dos saldos.</p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {withdrawSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl border border-[#00FF80]/20 bg-emerald-950/20 text-center flex flex-col items-center space-y-2 py-8"
                  >
                    <Check className="w-12 h-12 text-[#00FF80] animate-bounce" />
                    <p className="text-sm font-black text-[#00FF80] uppercase tracking-wider">SOLICITAÇÃO DEPOSITADA</p>
                    <p className="text-xs text-neutral-400">R$ {fiatEquivalent.toFixed(2)} foi processado e transferido para a sua chave!</p>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {amlValidationError && (
                      <p className="text-[10px] font-mono text-red-400 text-center uppercase">⚠ {amlValidationError}</p>
                    )}

                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest pl-1">Titular da Chave PIX</label>
                      <input
                        type="text"
                        placeholder="Nome Completo do Titular"
                        value={pixNameInput}
                        onChange={(e) => setPixNameInput(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-xl border border-cyan-500/20 bg-black/25 text-center text-sm outline-none font-sans"
                      />
                    </div>

                    <button
                      disabled={!satisfiesMinimum || !pixNameInput.trim()}
                      onClick={handleWithdrawalRequest}
                      className="w-full py-4 rounded-xl bg-[#00FF80] disabled:bg-neutral-800 disabled:text-neutral-500 text-black font-black uppercase text-xs tracking-wider shadow-[0_0_15px_rgba(0,255,128,0.2)] cursor-pointer"
                    >
                      SOLICITAR SAQUE
                    </button>
                    <p className="text-[9px] text-neutral-500 text-center">{currentTexts.fiat_min_withdraw}</p>
                  </div>
                )}
              </AnimatePresence>

              <button
                onClick={() => { setMode('card'); setWithdrawSuccess(false); setPixNameInput(''); setAmlValidationError(''); }}
                className="w-full py-3.5 border border-white/5 rounded-xl bg-black/40 text-neutral-400 text-xs font-bold uppercase transition-all tracking-wider hover:text-white cursor-pointer"
              >
                {currentTexts.btn_back}
              </button>
            </motion.div>
          )}

          {mode === 'donate' && (
            /* CONTRIBUTE PIX SCREEN VIEW */
            <motion.div
              key="donate-view"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="flex flex-col space-y-4 text-center"
            >
              <HeartHandshake className="w-12 h-12 text-[#8a2be2] mx-auto animate-pulse" />
              <p className="text-xs text-neutral-400 px-2 leading-relaxed">{currentTexts.donate_msg}</p>

              <div className="p-4 rounded-2xl bg-black/30 border border-white/5 select-all flex flex-col items-center gap-2">
                <code className="text-xs text-neutral-300 font-mono tracking-wide">invis.suporte@gmail.com</code>
                <button
                  onClick={copyPixKey}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 mt-1 cursor-pointer w-full ${
                    copiedKey ? 'bg-[#00FF80] text-black shadow-[0_0_10px_#00FF80]' : 'bg-[#8a2be2] text-white hover:opacity-90'
                  }`}
                >
                  {copiedKey ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>COPIADO</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>COPIAR CHAVE PIX</span>
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={() => setMode('card')}
                className="w-full py-3.5 border border-white/5 rounded-xl bg-black/40 text-neutral-400 text-xs font-bold uppercase transition-all tracking-wider hover:text-white cursor-pointer"
              >
                {currentTexts.btn_back}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
