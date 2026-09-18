import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import type { Product } from '@/data/products';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: 'ADD'; product: Product; quantity?: number }
  | { type: 'REMOVE'; productId: string }
  | { type: 'UPDATE_QTY'; productId: string; quantity: number }
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
      const existing = state.items.find((i) => i.product.id === action.product.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.product.id === action.product.id
              ? { ...i, quantity: i.quantity + (action.quantity ?? 1) }
              : i
          ),
          isOpen: true,
        };
      }
      return {
        ...state,
        items: [...state.items, { product: action.product, quantity: action.quantity ?? 1 }],
        isOpen: true,
      };
    }
    case 'REMOVE':
      return { ...state, items: state.items.filter((i) => i.product.id !== action.productId) };
    case 'UPDATE_QTY':
      if (action.quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.product.id !== action.productId) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.product.id === action.productId ? { ...i, quantity: action.quantity } : i
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
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleDrawer: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const FREE_DELIVERY_THRESHOLD = 500;
const DELIVERY_CHARGE = 60;

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
  const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_CHARGE;
  const total = subtotal + deliveryCharge;

  const value: CartContextValue = {
    items: state.items,
    isOpen: state.isOpen,
    itemCount,
    subtotal,
    deliveryCharge,
    total,
    addToCart: (product, quantity) => dispatch({ type: 'ADD', product, quantity }),
    removeFromCart: (productId) => dispatch({ type: 'REMOVE', productId }),
    updateQuantity: (productId, quantity) => dispatch({ type: 'UPDATE_QTY', productId, quantity }),
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
