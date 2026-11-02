"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

// Carrito guardado en el navegador (localStorage).
// Cada ítem guarda una "foto" del producto (nombre, precio, portada) para
// poder mostrarse sin volver a consultar la base.

const STORAGE_KEY = "adapto-cart-v1";
const MAX_QUANTITY = 99;
const CartContext = createContext(null);

function readStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => item?.slug && item.quantity > 0) : [];
  } catch {
    return [];
  }
}

function writeStorage(items) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // modo privado o almacenamiento bloqueado: el carrito sigue andando en memoria
  }
}

const clamp = (value) => Math.max(1, Math.min(MAX_QUANTITY, Math.round(Number(value) || 1)));

export function toCartItem(product, subcategoryName) {
  return {
    slug: product.slug,
    name: product.name,
    price: product.price,
    image: product.previews?.[0]?.url || null,
    subcategoryName: subcategoryName || null
  };
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [bump, setBump] = useState(0);
  const toastTimer = useRef(null);

  useEffect(() => {
    setItems(readStorage());
    setReady(true);
    // Sincroniza entre pestañas
    const onStorage = (event) => event.key === STORAGE_KEY && setItems(readStorage());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (ready) writeStorage(items);
  }, [items, ready]);

  const showToast = useCallback((message) => {
    clearTimeout(toastTimer.current);
    setToast({ message, id: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const addItem = useCallback(
    (item, quantity = 1) => {
      const amount = clamp(quantity);
      setItems((current) => {
        const existing = current.find((entry) => entry.slug === item.slug);
        if (existing) {
          return current.map((entry) =>
            entry.slug === item.slug ? { ...entry, ...item, quantity: clamp(entry.quantity + amount) } : entry
          );
        }
        return [...current, { ...item, quantity: amount }];
      });
      setBump((value) => value + 1);
      showToast(amount > 1 ? `Agregaste ${amount} unidades al carrito` : "Agregado al carrito");
    },
    [showToast]
  );

  const setQuantity = useCallback((slug, quantity) => {
    setItems((current) => current.map((entry) => (entry.slug === slug ? { ...entry, quantity: clamp(quantity) } : entry)));
  }, []);

  const removeItem = useCallback((slug) => {
    setItems((current) => current.filter((entry) => entry.slug !== slug));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    return {
      items,
      count,
      total,
      ready,
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      addItem,
      setQuantity,
      removeItem,
      clear,
      toast,
      dismissToast: () => setToast(null),
      bump,
      maxQuantity: MAX_QUANTITY
    };
  }, [items, ready, isOpen, addItem, setQuantity, removeItem, clear, toast, bump]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return context;
}
