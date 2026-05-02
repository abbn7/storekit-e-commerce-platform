import { create } from "zustand";

export interface CompareProduct {
  id: string;
  slug: string;
  name: string;
  basePrice: number;
  compareAtPrice?: number | null;
  images: { url: string; alt?: string }[];
  variants: { id: string; size: string; color: string; colorHex: string; stock: number; price: number }[];
  isFeatured?: boolean;
  isNewArrival?: boolean;
}

const MAX = 3;

interface CompareState {
  items: CompareProduct[];
  isOpen: boolean;
  add: (product: CompareProduct) => void;
  remove: (id: string) => void;
  clear: () => void;
  isInCompare: (id: string) => boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useCompareStore = create<CompareState>((set, get) => ({
  items: [],
  isOpen: false,
  add: (product) =>
    set((s) => {
      if (s.items.length >= MAX || s.items.find((i) => i.id === product.id)) return s;
      return { items: [...s.items, product] };
    }),
  remove: (id) =>
    set((s) => ({ items: s.items.filter((i) => i.id !== id), isOpen: s.items.length <= 1 ? false : s.isOpen })),
  clear: () => set({ items: [], isOpen: false }),
  isInCompare: (id) => !!get().items.find((i) => i.id === id),
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}));
