import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState { 
  items: string[]; 
  addItem: (productId: string) => void; 
  removeItem: (productId: string) => void; 
  isInWishlist: (productId: string) => boolean; 
}

export const useWishlistStore = create<WishlistState>()(persist((set, get) => ({
  items: [],
  addItem: (id) => set(state => ({ items: [...new Set([...state.items, id])] })),
  removeItem: (id) => set(state => ({ items: state.items.filter(i => i !== id) })),
  isInWishlist: (id) => get().items.includes(id),
}), { name: 'storekit-wishlist' }));
