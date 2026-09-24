import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import type { Product } from '@/data/products';

export interface CartItem {
  lineId: string;
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

// A product can be added at different pack sizes (variants) — key cart lines
// by product + weight so a 200g and a 500g pack of the same item stay as
// separate lines instead of merging into one at the wrong price.
function lineIdFor(product: Product) {
  return `${product.id}::${product.weight}`;
}

type CartAction =
  | { type: 'ADD'; product: Product; quantity?: number }
  | { type: 'REMOVE'; lineId: string }
  | { type: 'UPDATE_QTY'; lineId: string; quantity: number }
  | { type: 'CLEAR' }
  | { type: 'TOGGLE_DRAWER' }
  | { type: 'OPEN_DRAWER' }
  | { type: 'CLOSE_DRAWER' };

const STORAGE_KEY = 'meerav-cart';

function loadState(): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { items: parsed.items ?? [], isOpen: false };
    }
  } catch {
    // ignore
  }
  return { items: [], isOpen: false };
}

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const lineId = lineIdFor(action.product);
      const existing = state.items.find((i) => i.lineId === lineId);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.lineId === lineId ? { ...i, quantity: i.quantity + (action.quantity ?? 1) } : i
          ),
          isOpen: true,
        };
      }
      return {
        ...state,
        items: [...state.items, { lineId, product: action.product, quantity: action.quantity ?? 1 }],
        isOpen: true,
      };
    }
    case 'REMOVE':
      return { ...state, items: state.items.filter((i) => i.lineId !== action.lineId) };
    case 'UPDATE_QTY':
      if (action.quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.lineId !== action.lineId) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.lineId === action.lineId ? { ...i, quantity: action.quantity } : i
        ),
      };
    case 'CLEAR':
      return { items: [], isOpen: false };
    case 'TOGGLE_DRAWER':
      return { ...state, isOpen: !state.isOpen };
    case 'OPEN_DRAWER':
      return { ...state, isOpen: true };
    case 'CLOSE_DRAWER':
      return { ...state, isOpen: false };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  itemCount: number;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  toggleDrawer: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: state.items }));
    } catch {
      // ignore
    }
  }, [state.items]);

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const deliveryCharge = 0;
  const total = subtotal + deliveryCharge;

  const value: CartContextValue = {
    items: state.items,
    isOpen: state.isOpen,
    itemCount,
    subtotal,
    deliveryCharge,
    total,
    addToCart: (product, quantity) => dispatch({ type: 'ADD', product, quantity }),
    removeFromCart: (lineId) => dispatch({ type: 'REMOVE', lineId }),
    updateQuantity: (lineId, quantity) => dispatch({ type: 'UPDATE_QTY', lineId, quantity }),
    clearCart: () => dispatch({ type: 'CLEAR' }),
    toggleDrawer: () => dispatch({ type: 'TOGGLE_DRAWER' }),
    openDrawer: () => dispatch({ type: 'OPEN_DRAWER' }),
    closeDrawer: () => dispatch({ type: 'CLOSE_DRAWER' }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
