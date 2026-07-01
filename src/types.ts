export type UserTier = 'FREE' | 'VIP1' | 'VIP2' | 'SUPORTE' | 'ADM';

export type AgeGroup = 'Kids' | 'Teen' | 'Adult' | 'Senior' | null;

export interface UserProfile {
  id: string;
  fullName: string;
  nickname: string;
  email: string;
  phone: string;
  ddi: string;
  birthDate: string;
  age: number;
  tier: UserTier;
  ageGroup: AgeGroup;
  isActive: boolean;
  termsAccepted: boolean;
  ipAcceptance?: string;
  timestampAcceptance?: string;
  biometricsActive: boolean;
  focusModeActive?: boolean;
}

export interface WalletState {
  icGold: number;   // Minerada / Sacável
  icSilver: number; // Comprada / Prata (is_stamped = true)
  pendingAffiliateBalance: number;
}

export interface Transaction {
  id: string;
  type: 'Gain' | 'Spend' | 'Bonus';
  amount: string;
  desc: string;
  date: string;
}

export type BlockType = 'media' | 'social' | 'games' | 'library' | 'monitoring' | 'tasks';

export interface DashboardBlock {
  id: string;
  type: BlockType;
  title: string;
  pinned: boolean;
  minimized?: boolean;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  tags: string[];
  coverUrl: string;
  minTier: UserTier;
  requiresItem?: string;
  content: string[]; // Capítulos
  isNeural: boolean;
  isGhostwriter?: boolean;
}

export interface Movie {
  id: string;
  title: string;
  year: number;
  posterUrl: string;
  backdropUrl?: string;
  overview: string;
  videoUrl: string; // YouTube embed URL
  type: 'filme' | 'serie' | 'trailer';
  status: boolean;
  platform?: 'netflix' | 'disney' | 'hbo' | 'prime' | 'globoplay';
  category?: string;
  rating?: number;
  isFavorite?: boolean;
  continueProgress?: number;
  totalDuration?: string;
  likes?: number;
  trendDays?: number;
  actors?: string[];
  director?: string;
  production?: string;
  streamUrl?: string;
  audioLanguages?: string[];
}

export interface InventoryItem {
  id: string;
  itemId: string;
  title: string;
  type: 'moldura' | 'tempo_leitura' | 'vantagem' | 'presente';
  details?: string;
  isStamped: boolean;
  isUsed: boolean;
  acquiredAt: string;
  expiresAt?: string;
}
