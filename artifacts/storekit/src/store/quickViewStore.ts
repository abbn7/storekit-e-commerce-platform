import { create } from "zustand";

export interface QuickViewProduct {
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

interface QuickViewState {
  product: QuickViewProduct | null;
  open: (product: QuickViewProduct) => void;
  close: () => void;
}

export const useQuickViewStore = create<QuickViewState>((set) => ({
  product: null,
  open: (product) => set({ product }),
  close: () => set({ product: null }),
}));
