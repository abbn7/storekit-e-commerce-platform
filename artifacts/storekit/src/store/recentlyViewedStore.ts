import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface RecentProduct {
  id: string;
  slug: string;
  name: string;
  basePrice: number;
  compareAtPrice?: number;
  images?: { url: string; alt?: string; isPrimary?: boolean; sortOrder?: number }[];
  variants?: { size: string; color: string; colorHex?: string }[];
  isNewArrival?: boolean;
  isFeatured?: boolean;
  viewedAt: number;
}

interface RecentlyViewedState {
  items: RecentProduct[];
  addItem: (product: RecentProduct) => void;
  clear: () => void;
}

const MAX_ITEMS = 8;

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product) =>
        set((state) => {
          const filtered = state.items.filter((i) => i.id !== product.id);
          const updated = [{ ...product, viewedAt: Date.now() }, ...filtered].slice(0, MAX_ITEMS);
          return { items: updated };
        }),
      clear: () => set({ items: [] }),
    }),
    { name: "sk-recently-viewed" }
  )
);
