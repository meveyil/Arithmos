import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Car,
  CircleDot,
  Coffee,
  CreditCard,
  Heart,
  Home,
  Plane,
  ShoppingCart,
  Smartphone,
  Tag,
  Utensils,
  Wallet,
} from "lucide-react";

export const TRANSACTION_ICON_KEYS = [
  "Tag",
  "Wallet",
  "Briefcase",
  "Utensils",
  "Car",
  "Home",
  "ShoppingCart",
  "Coffee",
  "Plane",
  "Heart",
  "Smartphone",
  "CreditCard",
  "CircleDot",
] as const;

export type TransactionIconKey = (typeof TRANSACTION_ICON_KEYS)[number];

const MAP: Record<string, LucideIcon> = {
  Tag,
  Wallet,
  Briefcase,
  Utensils,
  Car,
  Home,
  ShoppingCart,
  Coffee,
  Plane,
  Heart,
  Smartphone,
  CreditCard,
  CircleDot,
};

export function getTransactionIconComponent(name: string): LucideIcon {
  return MAP[name] ?? CircleDot;
}
