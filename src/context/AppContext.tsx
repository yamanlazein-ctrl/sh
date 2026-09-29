"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: number;
  title: string;
  price: number;
  priceSyp?: number;
  quantity: number;
  coverImage?: string;
  format: "physical" | "digital";
}

export interface ActiveAudio {
  title: string;
  author: string;
  url: string;
  category?: string;
  duration?: string;
}

interface AppContextType {
  // Audio state
  activeAudio: ActiveAudio | null;
  isPlaying: boolean;
  playAudio: (audio: ActiveAudio) => void;
  togglePlay: () => void;
  closeAudio: () => void;

  // Cart state
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartTotalCount: number;
  cartTotalPriceUsd: number;
  cartTotalPriceSyp: number;

  // Search Modal state
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  searchInitialQuery: string;
  openSearchWithQuery: (q: string) => void;

  // Currency state
  currency: "SYP" | "USD" | "SAR";
  setCurrency: (c: "SYP" | "USD" | "SAR") => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Audio
  const [activeAudio, setActiveAudio] = useState<ActiveAudio | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [currency, setCurrency] = useState<"SYP" | "USD" | "SAR">("SYP");

  // Search
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchInitialQuery, setSearchInitialQuery] = useState<string>("");

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("sabuni_cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error("Failed to load cart from storage", e);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("sabuni_cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart", e);
    }
  }, [cart]);

  const playAudio = (audio: ActiveAudio) => {
    setActiveAudio(audio);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const closeAudio = () => {
    setActiveAudio(null);
    setIsPlaying(false);
  };

  const addToCart = (item: Omit<CartItem, "quantity">, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.format === item.format);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id && i.format === item.format
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { ...item, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const openSearchWithQuery = (q: string) => {
    setSearchInitialQuery(q);
    setIsSearchOpen(true);
  };

  const cartTotalCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const cartTotalPriceUsd = cart.reduce(
    (acc, item) => acc + (item.price || 0) * item.quantity,
    0
  );

  const cartTotalPriceSyp = cart.reduce(
    (acc, item) => acc + (item.priceSyp || (item.price || 0) * 13000) * item.quantity,
    0
  );

  return (
    <AppContext.Provider
      value={{
        activeAudio,
        isPlaying,
        playAudio,
        togglePlay,
        closeAudio,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        cartTotalCount,
        cartTotalPriceUsd,
        cartTotalPriceSyp,
        isSearchOpen,
        setIsSearchOpen,
        searchInitialQuery,
        openSearchWithQuery,
        currency,
        setCurrency,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
