import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useCatalog } from "../context/CatalogContext";
import ProductCard from "../components/ProductCard";
import Toast from "../components/Toast";
import { useState } from "react";

export default function Wishlist() {
  const { ids } = useWishlist();
  const { addItem } = useCart();
  const { products, loading } = useCatalog();
  const [toast, setToast] = useState("");
  const items = products.filter((p) => ids.includes(p.id));

  if (loading) {
    return <div className="container section" style={{ textAlign: "center" }}>Loading fresh batches from the kitchen…</div>;
  }

  function handleAdd(product, variant, qty = 1) {
    addItem(product, variant, qty);
    setToast(`${product.name} added to cart`);
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <span className="hindi-accent hindi-accent-light">आपकी पसंद</span>
          <div className="breadcrumb">Home / Wishlist</div>
          <h1>Your Wishlist</h1>
        </div>
      </div>

      <div className="container section">
        {items.length === 0 ? (
          <div className="empty-state">
            <h2>Your wishlist is empty</h2>
            <p>Tap "Save" on any product to add it here.</p>
            <Link to="/shop" className="btn btn-gold">Start Shopping</Link>
          </div>
        ) : (
          <div className="product-grid">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={handleAdd} />
            ))}
          </div>
        )}
      </div>

      {toast && <Toast message={toast} onDone={() => setToast("")} />}
    </>
  );
}
