import React, { useState } from 'react';
import { useInvis } from '../context/InvisContext';
import { INVI_CATALOG_ITEMS } from '../context/InvisContext';
import { InventoryItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Store, ShoppingBag, Award, Tag, Sparkles, Send, Coins, ShieldCheck, X, Heart, ExternalLink } from 'lucide-react';

const SvgItemGenerator: React.FC<{ itemId: string; name: string; category: string }> = ({ itemId, name, category }) => {
  let shapeSVG = null;
  let stroke = "#D4AF37";
  let glow = "rgba(212,175,55,0.4)";

  if (category.toLowerCase().includes('moldura')) {
    stroke = "#00c8ff";
    glow = "rgba(0,200,255,0.4)";
    shapeSVG = (
      <g>
        <rect x="25" y="25" width="30" height="30" rx="4" fill="none" stroke={stroke} strokeWidth="3" />
        <circle cx="40" cy="40" r="12" fill="none" stroke="#FF00FF" strokeWidth="1" strokeDasharray="2 2" />
      </g>
    );
  } else if (category.toLowerCase().includes('presente')) {
    stroke = "#f472b6";
    glow = "rgba(244,114,182,0.4)";
    shapeSVG = (
      <g>
        <path d="M40 20 L45 28 L35 28 Z" fill={stroke} />
        <rect x="30" y="28" width="20" height="22" rx="2" fill="none" stroke={stroke} strokeWidth="2" />
        <line x1="40" y1="28" x2="40" y2="50" stroke="#FF00FF" strokeWidth="1.5" />
        <line x1="30" y1="39" x2="50" y2="39" stroke="#FF00FF" strokeWidth="1.5" />
      </g>
    );
  } else if (category.toLowerCase().includes('jogos')) {
    stroke = "#00FF80";
    glow = "rgba(0,255,128,0.4)";
    shapeSVG = (
      <g>
        <rect x="26" y="32" width="28" height="16" rx="3" fill="none" stroke={stroke} strokeWidth="2.5" />
        <circle cx="33" cy="40" r="2" fill={stroke} />
        <circle cx="47" cy="38" r="1.5" fill="#FF00FF" />
        <circle cx="47" cy="42" r="1.5" fill="#FF00FF" />
      </g>
    );
  } else {
    stroke = "#D4AF37";
    glow = "rgba(212,175,55,0.4)";
    shapeSVG = (
      <g>
        <circle cx="40" cy="40" r="18" fill="none" stroke={stroke} strokeWidth="2" />
        <path d="M35 30 L48 40 L35 50 Z" fill={stroke} />
      </g>
    );
  }

  return (
    <svg 
      width="54" 
      height="54" 
      viewBox="0 0 80 80" 
      className="shrink-0 rounded-xl bg-black/50 border border-white/5 shadow-inner"
      style={{ filter: `drop-shadow(0 0 4px ${glow})` }}
    >
      <defs>
        <linearGradient id="svgGlowGrid" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#111" />
          <stop offset="100%" stopColor="#222" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" rx="10" fill="url(#svgGlowGrid)" />
      <line x1="10" y1="10" x2="20" y2="10" stroke="white" strokeOpacity="0.05" strokeWidth="1" />
      <line x1="10" y1="10" x2="10" y2="20" stroke="white" strokeOpacity="0.05" strokeWidth="1" />
      <line x1="70" y1="70" x2="60" y2="70" stroke="white" strokeOpacity="0.05" strokeWidth="1" />
      <line x1="70" y1="70" x2="70" y2="60" stroke="white" strokeOpacity="0.05" strokeWidth="1" />
      {shapeSVG}
    </svg>
  );
};

const EXTERNAL_PRODUCTS = [
  { id: 'ext1', name: 'Kindle Paperwhite 16GB (Leitor Editorial)', source: 'Amazon', price: 'R$ 799,00', conversion: '19.975 ic Gold', imageUrl: '📚', tag: 'Melhor Preço', link: 'https://amazon.com.br' },
  { id: 'ext2', name: 'Teclado Mecânico RGB Pro Stealth', source: 'Shopee', price: 'R$ 159,00', conversion: '3.975 ic Gold', imageUrl: '⌨️', tag: 'Frete Grátis e Rápido', link: 'https://shopee.com.br' },
  { id: 'ext3', name: 'Mouse Gamer Wireless Ultra Pro', source: 'Mercado Livre', price: 'R$ 289,00', conversion: '7.225 ic Gold', imageUrl: '🖱️', tag: 'Entrega Full', link: 'https://mercadolivre.com.br' },
  { id: 'ext4', name: 'Caderno Digital Inteligente Smart', source: 'Amazon', price: 'R$ 180,00', conversion: '4.500 ic Gold', imageUrl: '📝', tag: 'Em Destaque IA', link: 'https://amazon.com.br' }
];

const ACHADINHOS_PRODUCTS = [
  { id: 'ach1', name: 'Mini Projetor Portátil Neon Cinematic', price: 'R$ 349,00', conversion: '8.725 ic Gold', tag_promo: 'Mais barato nos últimos 30 dias', tag_shipping: 'Frete Grátis', tag_trending: 'Hot Item INVIS', link: 'https://shopee.com.br', icon: '📹' },
  { id: 'ach2', name: 'Fone Headset Bluetooth ANC Silent', price: 'R$ 199,00', conversion: '4.975 ic Gold', tag_promo: 'Cupom de 20% Incluso', tag_shipping: 'Entrega FULL', tag_trending: 'Recomendação Algorítmica', link: 'https://amazon.com.br', icon: '🎧' },
  { id: 'ach3', name: 'Carregador Magnético Duplo 45W', price: 'R$ 99,00', conversion: '2.475 ic Gold', tag_promo: 'Oportunidade Histórica', tag_shipping: 'Frete Grátis', tag_trending: 'Mais Desejado VIP', link: 'https://mercadolivre.com.br', icon: '🔌' },
  { id: 'ach4', name: 'Suporte de Alumínio Ergonômico Pro', price: 'R$ 79,00', conversion: '1.975 ic Gold', tag_promo: 'Super Desconto Semana', tag_shipping: 'Frete Grátis', tag_trending: 'Útil & Funcional', link: 'https://amazon.com.br', icon: '💻' }
];

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({ isOpen, onClose }) => {
  const { 
    currentUser, 
    wallet, 
    buyItem, 
    inventory, 
    useInventoryItem, 
    sellInventoryItem, 
    donateInventoryItem,
    showToast,
    language 
  } = useInvis();

  const [activeTab, setActiveTab] = useState<'catalog' | 'externo' | 'achadinhos' | 'inventory'>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [recipientName, setRecipientName] = useState<string>('');
  const [donateItemId, setDonateItemId] = useState<string | null>(null);
  const [payWithSilver, setPayWithSilver] = useState<boolean>(false);

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('invis_shop_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleWishlist = (id: string, name: string) => {
    let next: string[];
    if (wishlist.includes(id)) {
      next = wishlist.filter(item => item !== id);
      showToast(`Item "${name}" removido de Favoritos.`, 'info');
    } else {
      next = [...wishlist, id];
      showToast(`Item "${name}" salvo em sua lista de desejos!`, 'success');
    }
    setWishlist(next);
    localStorage.setItem('invis_shop_wishlist', JSON.stringify(next));
  };

  React.useEffect(() => {
    const handleTriggerInventory = () => {
      setActiveTab('inventory');
    };
    window.addEventListener('invis_open_inventory', handleTriggerInventory);
    return () => window.removeEventListener('invis_open_inventory', handleTriggerInventory);
  }, []);

  if (!isOpen) return null;

  // Filter catalog categories
  const categories = [
    { id: 'all', name: 'Todos os Itens' },
    { id: 'Multiplex', name: 'Salas & Multiplex' },
    { id: 'Moldura', name: 'Molduras' },
    { id: 'Presente', name: 'Presentes' }
  ];

  const filteredCatalog = INVI_CATALOG_ITEMS.filter(item => {
    if (selectedCategory === 'all') return true;
    return item.category.toLowerCase().includes(selectedCategory.toLowerCase()) || 
           item.name.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  const handlePurchase = (item: typeof INVI_CATALOG_ITEMS[0]) => {
    if (navigator.vibrate) navigator.vibrate(30);
    const result = buyItem(item, payWithSilver);
    if (result.success) {
      alert(`Sucesso! Você adquiriu: ${item.name}. O item foi sincronizado ao seu inventário.`);
    } else {
      alert(`Falha na Compra: ${result.error}`);
    }
  };

  const handleUseItem = (item: InventoryItem) => {
    if (navigator.vibrate) navigator.vibrate(20);
    useInventoryItem(item.id);
    alert(`Item "${item.title}" foi equipado/sincronizado com sucesso!`);
  };

  const handleSellItem = (item: InventoryItem) => {
    if (navigator.vibrate) navigator.vibrate(40);
    if (window.confirm(`Tem certeza que deseja vender "${item.title}"? Isso aplicará uma penalidade de 5% de queima.`)) {
      sellInventoryItem(item.id);
    }
  };

  const handleDonateTrigger = (itemId: string) => {
    setDonateItemId(itemId);
    setRecipientName('');
  };

  const handleSendDonation = () => {
    if (!donateItemId) return;
    if (!recipientName.trim()) {
      alert('Por favor, informe o apelido do destinatário.');
      return;
    }
    const result = donateInventoryItem(donateItemId, recipientName.trim());
    if (result.success) {
      alert(`Sucesso! Presente enviado para @${recipientName}.`);
      setDonateItemId(null);
    } else {
      alert(`Falha no envio: ${result.error}`);
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/90 p-3 sm:p-4 font-sans backdrop-blur-md cursor-pointer"
    >
      <motion.div 
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        className="w-full max-w-4xl h-[90vh] rounded-[32px] bg-[#0b0e11] border border-[#D4AF37]/30 flex flex-col overflow-hidden relative shadow-[0_0_50px_rgba(212,175,55,0.15)] cursor-default"
      >
        {/* Glowing header vector line */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 via-[#D4AF37] to-fuchsia-400" />

        {/* Header segment */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <Store className="w-5 h-5 text-[#D4AF37] animate-pulse" />
            <div>
              <span className="font-mono text-[9px] tracking-[0.2em] font-black uppercase text-neutral-400">
                MERCADO INVIS
              </span>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                INVIShop & Inventário
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Balance panel details */}
            <div className="hidden sm:flex items-center gap-3 text-xs">
              <div className="px-3 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-500/20 flex items-center gap-1.5 font-mono text-yellow-400 text-[10px] font-bold">
                <Coins className="w-3 h-3" />
                <span>GOLD: {wallet.icGold.toFixed(4)} ic</span>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-500/20 flex items-center gap-1.5 font-mono text-cyan-400 text-[10px] font-bold">
                <Award className="w-3 h-3" />
                <span>SILVER: {wallet.icSilver.toFixed(2)} ic</span>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-2 sm:p-2.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab switcher bar */}
        <div className="flex border-b border-white/5 px-6 py-2 bg-black/20 shrink-0 gap-4 overflow-x-auto no-scrollbar text-xs">
          <button
            onClick={() => { setActiveTab('catalog'); setDonateItemId(null); }}
            className={`py-2.5 font-mono font-black uppercase tracking-wider transition-all relative shrink-0 cursor-pointer ${
              activeTab === 'catalog' ? 'text-[#D4AF37]' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>Catálogo Oficial</span>
            {activeTab === 'catalog' && (
              <motion.div layoutId="shop_tab_glow" className="absolute bottom-0 left-0 w-full h-1 bg-[#D4AF37] rounded-full" />
            )}
          </button>

          <button
            onClick={() => { setActiveTab('externo'); setDonateItemId(null); }}
            className={`py-2.5 font-mono font-black uppercase tracking-wider transition-all relative shrink-0 cursor-pointer ${
              activeTab === 'externo' ? 'text-[#FF00FF]' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>Mercado Externo</span>
            {activeTab === 'externo' && (
              <motion.div layoutId="shop_tab_glow" className="absolute bottom-0 left-0 w-full h-1 bg-[#FF00FF] rounded-full" />
            )}
          </button>

          <button
            onClick={() => { setActiveTab('achadinhos'); setDonateItemId(null); }}
            className={`py-2.5 font-mono font-black uppercase tracking-wider transition-all relative shrink-0 cursor-pointer ${
              activeTab === 'achadinhos' ? 'text-amber-400' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>Achadinhos</span>
            {activeTab === 'achadinhos' && (
              <motion.div layoutId="shop_tab_glow" className="absolute bottom-0 left-0 w-full h-1 bg-amber-400" />
            )}
          </button>

          <button
            onClick={() => { setActiveTab('inventory'); setDonateItemId(null); }}
            className={`py-2.5 font-mono font-black uppercase tracking-wider transition-all relative shrink-0 cursor-pointer ${
              activeTab === 'inventory' ? 'text-[#00c8ff]' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>Meu Inventário ({inventory.length})</span>
            {activeTab === 'inventory' && (
              <motion.div layoutId="shop_tab_glow" className="absolute bottom-0 left-0 w-full h-1 bg-[#00c8ff] rounded-full" />
            )}
          </button>
        </div>

        {/* Inner Content Scroller */}
        <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'catalog' ? (
              /* TAB 1: CATALOG OF ITEMS */
              <motion.div
                key="catalog_tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 text-left"
              >
                {/* Category tags row */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 shrink-0">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 py-2 mt-1 rounded-xl font-mono text-[9px] font-black uppercase tracking-wide transition-all border cursor-pointer shrink-0 ${
                        selectedCategory === cat.id
                          ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37]'
                          : 'bg-black/20 border-white/5 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                {/* Sub title / Currency control toggle */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div className="space-y-0.5">
                    <p className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] font-extrabold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Estilo de Moeda de Pagamento
                    </p>
                    <p className="text-[10.5px] text-neutral-400">Moedas de Prata (Silver) são adquiridas e garantem selos Stamped permanentes.</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold">Usar Prata (Silver)?</span>
                    <button
                      onClick={() => setPayWithSilver(!payWithSilver)}
                      className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${payWithSilver ? 'bg-cyan-500' : 'bg-neutral-800'}`}
                    >
                      <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${payWithSilver ? 'translate-x-6' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Grid items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCatalog.map((item) => {
                    const balance = payWithSilver ? wallet.icSilver : wallet.icGold;
                    const canAfford = balance >= item.priceIC;

                    return (
                      <div 
                        key={item.id}
                        className="p-5 rounded-2xl bg-black/40 border border-white/5 hover:border-[#D4AF37]/30 transition-all flex flex-col justify-between h-52 relative overflow-hidden group"
                      >
                        {/* Glowing background hint */}
                        <div className="absolute right-[-10px] top-[-10px] w-20 h-20 bg-yellow-500/5 rounded-full filter blur-xl group-hover:scale-125 transition-transform" />

                        <div className="flex gap-4">
                          <SvgItemGenerator itemId={item.id} name={item.name} category={item.category} />
                          
                          <div className="space-y-1 flex-1 text-left">
                            <div className="flex justify-between items-start">
                              <span className="text-[8.5px] font-mono text-[#D4AF37] tracking-widest font-black uppercase">
                                {item.category}
                              </span>
                              <span className="text-[8.5px] font-mono text-neutral-500">
                                Cód: #{item.id}
                              </span>
                            </div>

                            <h4 className="text-white text-xs font-black uppercase tracking-wider line-clamp-1">{item.name}</h4>
                            <p className="text-[10px] text-neutral-400 leading-normal line-clamp-2">{item.description}</p>
                            
                            <div className="flex flex-wrap gap-2 text-[9px] font-mono text-neutral-500 pt-1">
                              {item.duration && <span>🕒 {item.duration}</span>}
                              {item.capacity && <span>👥 {item.capacity}</span>}
                              {item.minTier !== 'FREE' && <span>⚡ Requer {item.minTier}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                          <div className="text-left font-mono">
                            <span className="text-xs font-black text-white">{item.priceIC} ic</span>
                            <span className="text-[9px] text-neutral-500 ml-2 block sm:inline">~ R$ {item.priceFiat.toFixed(2)}</span>
                          </div>

                          <button
                            onClick={() => handlePurchase(item)}
                            className="px-4 py-2 rounded-xl text-[9px] font-mono font-black uppercase tracking-wider cursor-pointer transition-all active:scale-95 bg-[#D4AF37] text-black hover:bg-yellow-400"
                          >
                            Comprar Itens
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : activeTab === 'externo' ? (
              /* TAB 3: MERCADO EXTERNO (FEED DE MARKETPLACE DA WEB CONVERTIDO PARA O ECOSSISTEMA INVIS) */
              <motion.div
                key="externo_tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 text-left"
              >
                {wishlist.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-black/20 border border-red-500/15">
                    <p className="text-[8px] uppercase tracking-wider text-red-400 font-mono font-bold flex items-center gap-1">
                      ❤️ Lista de Desejos / Favorito Ativo ({wishlist.length})
                    </p>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pt-2">
                      {wishlist.map(favId => {
                        const allProds = [...EXTERNAL_PRODUCTS, ...ACHADINHOS_PRODUCTS];
                        const matched = allProds.find(p => p.id === favId);
                        if (!matched) return null;
                        return (
                          <div key={favId} className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/5 flex items-center gap-2 shrink-0">
                            <span className="text-xs">{(matched as any).imageUrl || (matched as any).icon || '🛍️'}</span>
                            <span className="text-[10px] text-neutral-300 font-medium line-clamp-1 max-w-[120px]">{matched.name}</span>
                            <button onClick={() => toggleWishlist(favId, matched.name)} className="text-[9px] text-red-400 font-bold hover:text-white px-1">✕</button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-fuchsia-950/10 border border-fuchsia-500/20 text-xs">
                  <p className="text-[10px] uppercase font-mono tracking-widest text-[#FF00FF] font-extrabold flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 animate-pulse text-[#FF00FF]" /> FEED DE IMPORTAÇÃO PARALELA (MERCADO EXTERNO)
                  </p>
                  <p className="text-[10.5px] text-neutral-400 mt-1">
                    Produtos reais importados de grandes varejistas da Web. Seus preços fiduciários são convertidos dinamicamente para o padrão INVIS Gold. Toque no coração para favoritar o item em sua lista de desejos persistente.
                  </p>
                </div>

                {/* Grid of external products */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {EXTERNAL_PRODUCTS.map((prod) => {
                    const isLiked = wishlist.includes(prod.id);
                    return (
                      <div
                        key={prod.id}
                        className="p-5 rounded-2xl bg-[#110e14]/80 border border-fuchsia-500/10 hover:border-fuchsia-400/40 transition-all flex flex-col justify-between h-52 relative overflow-hidden group"
                      >
                        <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-fuchsia-500/5 rounded-full filter blur-xl group-hover:scale-125 transition-transform" />
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[8px] font-mono text-fuchsia-400 font-extrabold uppercase tracking-widest bg-fuchsia-950/40 px-2 py-0.5 rounded border border-fuchsia-500/20">
                              {prod.source} Import
                            </span>
                            
                            {/* Toggle Heart button (wishlist click or long touch) */}
                            <button
                              onClick={() => toggleWishlist(prod.id, prod.name)}
                              className={`p-2 rounded-xl transition-all cursor-pointer active:scale-90 ${
                                isLiked 
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                                  : 'bg-black/40 text-neutral-500 border border-white/5 hover:text-red-400 hover:border-red-500/20'
                              }`}
                              title="Salvar na Lista de Desejos"
                            >
                              <Heart className="w-3.5 h-3.5 fill-current" />
                            </button>
                          </div>

                          <div className="flex gap-3.5">
                            <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center text-2xl shrink-0">
                              {prod.imageUrl}
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-white text-xs font-black uppercase tracking-wider line-clamp-1">{prod.name}</h4>
                              <p className="text-[9px] font-mono text-fuchsia-400/80 font-black tracking-widest">{prod.tag}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-2">
                          <div className="text-left font-mono">
                            <span className="text-[9px] text-neutral-500 block uppercase font-bold tracking-widest">Equivalente</span>
                            <span className="text-xs font-black text-white">{prod.conversion}</span>
                            <span className="text-[9px] text-neutral-400 ml-2">({prod.price})</span>
                          </div>

                          <a
                            href={prod.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-xl text-[9.5px] font-mono font-black uppercase tracking-wider bg-fuchsia-600 text-white hover:bg-fuchsia-500 transition-all flex items-center gap-1 cursor-pointer align-middle"
                          >
                            <span>Ir para Loja</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : activeTab === 'achadinhos' ? (
              /* TAB 4: ACHADINHOS (CURADORIA DE REDE SOCIAL COM TAGS DE DESTAQUE E CUPOM) */
              <motion.div
                key="achadinhos_tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 text-left"
              >
                {wishlist.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-black/20 border border-red-500/15">
                    <p className="text-[8px] uppercase tracking-wider text-red-400 font-mono font-bold flex items-center gap-1">
                      ❤️ Lista de Desejos / Favorito Ativo ({wishlist.length})
                    </p>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pt-2">
                      {wishlist.map(favId => {
                        const allProds = [...EXTERNAL_PRODUCTS, ...ACHADINHOS_PRODUCTS];
                        const matched = allProds.find(p => p.id === favId);
                        if (!matched) return null;
                        return (
                          <div key={favId} className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/5 flex items-center gap-2 shrink-0">
                            <span className="text-xs">{(matched as any).imageUrl || (matched as any).icon || '🛍️'}</span>
                            <span className="text-[10px] text-neutral-300 font-medium line-clamp-1 max-w-[120px]">{matched.name}</span>
                            <button onClick={() => toggleWishlist(favId, matched.name)} className="text-[9px] text-red-400 font-bold hover:text-white px-1">✕</button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-amber-950/10 border border-amber-500/20 text-xs">
                  <p className="text-[10px] uppercase font-mono tracking-widest text-[#FFaa00] font-extrabold flex items-center gap-1.5">
                    <Award className="w-4 h-4 animate-bounce text-amber-400" /> CURADORIA REGULADA (ACHADINHOS INVIS)
                  </p>
                  <p className="text-[10.5px] text-neutral-400 mt-1">
                    Garimpos de ofertas em redes sociais filtrados por nossa IA. Inclui cupons de desconto integrados para uso fiduciário. Toque no coração para favoritar o achado.
                  </p>
                </div>

                {/* Grid of Achadinhos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ACHADINHOS_PRODUCTS.map((prod) => {
                    const isLiked = wishlist.includes(prod.id);
                    return (
                      <div
                        key={prod.id}
                        className="p-5 rounded-2xl bg-[#14110e]/80 border border-amber-500/10 hover:border-amber-400/40 transition-all flex flex-col justify-between h-56 relative overflow-hidden group"
                      >
                        <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-amber-500/5 rounded-full filter blur-xl group-hover:scale-125 transition-transform" />
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex gap-1.5 flex-wrap">
                              <span className="text-[8px] font-mono font-bold uppercase tracking-wider bg-amber-950/40 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/15">
                                {prod.tag_trending}
                              </span>
                              <span className="text-[8px] font-mono font-bold uppercase tracking-wider bg-orange-950/40 text-orange-400 px-1.5 py-0.5 rounded border border-orange-500/15">
                                {prod.tag_shipping}
                              </span>
                            </div>
                            
                            <button
                              onClick={() => toggleWishlist(prod.id, prod.name)}
                              className={`p-2 rounded-xl transition-all cursor-pointer active:scale-90 ${
                                isLiked 
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                                  : 'bg-black/40 text-neutral-500 border border-white/5 hover:text-red-400 hover:border-red-500/20'
                              }`}
                              title="Salvar na Lista de Desejos"
                            >
                              <Heart className="w-3.5 h-3.5 fill-current" />
                            </button>
                          </div>

                          <div className="flex gap-3.5">
                            <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center text-2xl shrink-0">
                              {prod.icon}
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-white text-xs font-black uppercase tracking-wider line-clamp-1">{prod.name}</h4>
                              <p className="text-[8px] font-mono text-emerald-400">{prod.tag_promo}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-2">
                          <div className="text-left font-mono">
                            <span className="text-[9px] text-neutral-500 block uppercase font-bold tracking-widest">Valor do Achado</span>
                            <span className="text-xs font-black text-white">{prod.conversion}</span>
                            <span className="text-[9px] text-neutral-400 ml-2">({prod.price})</span>
                          </div>

                          <div className="flex flex-col gap-1 text-right">
                            <button
                              onClick={() => {
                                showToast("Código 'INVIS20' copiado para área de transferência! Redirecionando...", "success");
                                if (navigator.vibrate) navigator.vibrate(20);
                                setTimeout(() => {
                                  window.open(prod.link, "_blank");
                                }, 800);
                              }}
                              className="px-3.5 py-1.5 rounded-xl text-[9px] font-mono font-black uppercase tracking-wider bg-amber-500 text-black hover:bg-amber-400 transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <span>Pegar Cupom</span>
                              <Tag className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              /* TAB 2: USER INVENTORY */
              <motion.div
                key="inventory_tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 text-left"
              >
                {/* Donate overlay portal */}
                <AnimatePresence>
                  {donateItemId && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-5 rounded-2xl bg-fuchsia-950/20 border border-fuchsia-500/30 space-y-4"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-mono text-xs font-black text-fuchsia-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Send className="w-3.5 h-3.5 animate-bounce" /> Presentear um Membro amigo
                        </span>
                        <button onClick={() => setDonateItemId(null)} className="text-neutral-400 hover:text-white px-2 py-0.5">✕ Cancelar</button>
                      </div>

                      <div className="space-y-3">
                        <div className="flex gap-3 text-xs flex-col sm:flex-row relative">
                          <input
                            type="text"
                            placeholder="Buscar ou digitar Usuário (ex: neo_invis)"
                            value={recipientName}
                            onChange={(e) => setRecipientName(e.target.value)}
                            className="flex-1 px-4 py-2 bg-neutral-900 border border-fuchsia-500/20 rounded-xl text-white outline-none focus:border-fuchsia-500"
                          />
                          <button
                            onClick={handleSendDonation}
                            className="px-6 py-2 rounded-xl bg-fuchsia-500 text-white font-black uppercase tracking-wider hover:bg-fuchsia-400 transition-all cursor-pointer shadow-[0_0_10px_rgba(255,0,255,0.2)]"
                          >
                            Enviar Presente
                          </button>
                        </div>

                        {/* Suggestions List Box */}
                        <div className="space-y-1.5 text-left">
                          <p className="text-[9px] uppercase tracking-wider text-fuchsia-400 font-mono font-bold">Destinatários Recomendados / Online:</p>
                          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar">
                            {[
                              { nickname: 'johndoe', name: 'John Smith (Fundador)' },
                              { nickname: 'elena_rostova', name: 'Elena Rostova (Analista)' },
                              { nickname: 'takashi_sato', name: 'Takashi Sato (Core Engineer)' },
                              { nickname: 'morpheus', name: 'Morpheus (Capitão)' },
                              { nickname: 'neo_invis', name: 'Neo (O Escolhido)' },
                              { nickname: 'trinity_matrix', name: 'Trinity (Oficial)' },
                              { nickname: 'cyber_sam', name: 'Cyber Sam (Trader)' }
                            ]
                              .filter(r => 
                                !recipientName.trim() || 
                                r.nickname.toLowerCase().includes(recipientName.toLowerCase()) || 
                                r.name.toLowerCase().includes(recipientName.toLowerCase())
                              )
                              .map(recipient => (
                                <button
                                  key={recipient.nickname}
                                  onClick={() => {
                                    setRecipientName(recipient.nickname);
                                    if (navigator.vibrate) navigator.vibrate(12);
                                  }}
                                  className={`px-2.5 py-1.5 rounded-xl border transition-all text-[10px] font-mono cursor-pointer flex items-center gap-1.5 uppercase ${
                                    recipientName === recipient.nickname
                                      ? 'bg-fuchsia-500 border-fuchsia-400 text-white font-bold'
                                      : 'bg-black/30 border-white/5 text-neutral-400 hover:text-white hover:border-fuchsia-500/30'
                                  }`}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                                  <span>@{recipient.nickname}</span>
                                  <span className="text-[8px] text-neutral-500 lowercase">({recipient.name})</span>
                                </button>
                              ))
                            }
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {inventory.length === 0 ? (
                  <div className="py-16 text-center text-neutral-500 space-y-3">
                    <ShoppingBag className="w-12 h-12 text-neutral-600 mx-auto" />
                    <p className="text-xs font-mono uppercase tracking-widest">Nenhum item em seu inventário cibernético.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {inventory.map((item) => (
                      <div 
                        key={item.id}
                        className="p-5 rounded-2xl bg-black/40 border border-white/5 hover:border-cyan-500/20 transition-all flex flex-col justify-between h-48 relative overflow-hidden"
                      >
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[8.5px] font-mono text-[#00c8ff] tracking-widest font-black uppercase">
                              {item.type}
                            </span>
                            {item.isStamped && (
                              <span className="px-1.5 py-0.5 rounded bg-cyan-950/40 text-[#00c8ff] border border-cyan-500/20 font-mono text-[8.5px] font-bold">
                                STAMPED CERTIFIED
                              </span>
                            )}
                          </div>

                          <h4 className="text-white text-xs font-black uppercase tracking-wider pt-1">{item.title}</h4>
                          <p className="text-[10px] text-neutral-400 font-mono">Adquirido às: {new Date(item.acquiredAt).toLocaleDateString()}</p>
                          <p className="text-[10.5px] text-neutral-400 leading-normal pt-1 flex items-center gap-1">
                            {item.isUsed ? (
                              <span className="text-emerald-400 font-bold flex items-center gap-1">✓ Equitado e Ativado</span>
                            ) : (
                              <span className="text-yellow-500">Pronto para ativação</span>
                            )}
                          </p>
                        </div>

                        <div className="flex gap-2.5 pt-4 border-t border-white/5">
                          {/* Equip / Use */}
                          <button
                            disabled={item.isUsed}
                            onClick={() => handleUseItem(item)}
                            className="flex-1 py-2 rounded-xl text-[9px] font-mono font-black uppercase tracking-wider cursor-pointer bg-cyan-500 text-black hover:bg-cyan-400 disabled:opacity-50"
                          >
                            Ativar Item
                          </button>

                          {/* Donate button */}
                          <button
                            onClick={() => handleDonateTrigger(item.id)}
                            className="flex-1 py-2 rounded-xl text-[9px] font-mono font-black uppercase tracking-wider cursor-pointer bg-black/60 border border-white/5 hover:border-fuchsia-500/50 text-[#FF00FF]"
                          >
                            Presentear
                          </button>

                          {/* Sell button */}
                          {!item.isStamped && (
                            <button
                              onClick={() => handleSellItem(item)}
                              className="flex-1 py-2 rounded-xl text-[9px] font-mono font-black uppercase tracking-wider cursor-pointer bg-red-950/20 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white"
                            >
                              Vender (Reembolsar)
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer compliant segment */}
        <div className="px-6 py-4 border-t border-white/5 bg-black/40 text-center shrink-0">
          <p className="text-[8px] font-mono tracking-wider text-neutral-500 uppercase">
            REGULADO POR CIRCUIT BREAKER DO PROTOCOLO INVIS CORE v1.0.42
          </p>
        </div>
      </motion.div>
    </div>
  );
};
