import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

function lineId(productId, weight) {
  return `${productId}__${weight}`;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem("meerav_cart_v2");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("meerav_cart_v2", JSON.stringify(items));
    } catch {
      /* ignore storage errors */
    }
  }, [items]);

  function addItem(product, variant, qty = 1) {
    const id = lineId(product.id, variant.weight);
    setItems((prev) => {
      const existing = prev.find((i) => i.lineId === id);
      if (existing) {
        return prev.map((i) => (i.lineId === id ? { ...i, qty: i.qty + qty } : i));
      }
      return [
        ...prev,
        {
          lineId: id,
          productId: product.id,
          name: product.name,
          image: product.image,
          category: product.category,
          weight: variant.weight,
          price: variant.price,
          originalPrice: variant.originalPrice,
          qty,
        },
      ];
    });
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((i) => i.lineId !== id));
  }

  function updateQty(id, qty) {
    if (qty <= 0) return removeItem(id);
    setItems((prev) => prev.map((i) => (i.lineId === id ? { ...i, qty } : i)));
  }

  function clearCart() {
    setItems([]);
  }

  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.qty * i.price, 0);
  const totalSavings = items.reduce(
    (sum, i) => sum + i.qty * Math.max(0, (i.originalPrice || i.price) - i.price),
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        totalItems,
        totalPrice,
        totalSavings,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
