import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function getProductImage(url: string | null | undefined, productId?: string): string {
  if (url && url.trim() !== "") return url;
  const seed = productId ? productId.slice(0, 8) : "default";
  return `https://picsum.photos/seed/${seed}/800/1000`;
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}
