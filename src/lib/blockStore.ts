import { create } from 'zustand';

export interface Block {
  id: string;
  type: string;
  title: string;
  minimized?: boolean;
  pinned?: boolean;
}

interface BlockState {
  blocks: Block[];
  addBlock: (block: Block) => void;
  removeBlock: (id: string) => void;
  minimizeBlock: (id: string) => void;
  restoreBlock: (id: string) => void;
}

export const useBlockStore = create<BlockState>((set) => ({
  blocks: [],
  addBlock: (block) => set((state) => ({ blocks: [...state.blocks, block] })),
  removeBlock: (id) => set((state) => ({ blocks: state.blocks.filter((b) => b.id !== id) })),
  minimizeBlock: (id) => set((state) => ({
    blocks: state.blocks.map((b) => (b.id === id ? { ...b, minimized: true } : b))
  })),
  restoreBlock: (id) => set((state) => ({
    blocks: state.blocks.map((b) => (b.id === id ? { ...b, minimized: false } : b))
  }))
}));
