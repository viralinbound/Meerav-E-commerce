import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import StarRating from "../components/StarRating";
import Toast from "../components/Toast";
import { useCart } from "../context/CartContext";
import { useCatalog } from "../context/CatalogContext";

export default function ProductDetail() {
  const { id } = useParams();
  const { getProduct, relatedProducts, discountPercent, getCategory, loading } = useCatalog();
  const product = getProduct(id);
  const { addItem } = useCart();
  const [variantIdx, setVariantIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState("");
  const [pincode, setPincode] = useState("");
  const [deliveryMsg, setDeliveryMsg] = useState("");
  const [nutritionOpen, setNutritionOpen] = useState(false);

  if (loading) {
    return <div className="container section" style={{ textAlign: "center" }}>Loading fresh batches from the kitchen…</div>;
  }

  if (!product) {
    return (
      <div className="container section">
        <h2>Product not found</h2>
        <Link to="/shop" className="btn btn-gold">Back to Shop</Link>
      </div>
    );
  }

  const variant = product.variants[variantIdx];
  const off = discountPercent(variant);
  const related = relatedProducts(product, 4);
  const category = getCategory(product.category);

  function handleAdd() {
    addItem(product, variant, qty);
    setToast(`${qty} × ${product.name} (${variant.weight}) added to cart`);
  }

  function checkDelivery(e) {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode)) {
      setDeliveryMsg("Please enter a valid 6-digit pincode.");
      return;
    }
    setDeliveryMsg(`Delivers to ${pincode} in 2-4 business days.`);
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <span className="hindi-accent hindi-accent-light">असली बीकानेरी स्वाद</span>
          <div className="breadcrumb">
            <Link to="/">Home</Link> / <Link to={`/category/${product.category}`}>{category?.name}</Link> / {product.name}
          </div>
          <h1>{product.name}</h1>
        </div>
      </div>

      <div className="container section">
        <div className="detail-grid">
          <div className="detail-visual">
            <img src={product.image} alt={product.name} />
            {product.tag && <span className="product-badge detail-badge">{product.tag}</span>}
          </div>
          <div className="detail-info">
            <span className="product-cat">{product.spiceLevel}</span>
            <h1>{product.name}</h1>
            <StarRating rating={product.rating} reviewsCount={product.reviewsCount} size="lg" />
            <p style={{ color: "#6b5643" }}>{product.description}</p>

            <div className="stock-line">
              Availability: <strong>{product.inStock ? "In Stock" : "Out of Stock"}</strong>
            </div>

            <div className="detail-price">
              ₹{variant.price}
              {variant.originalPrice > variant.price && (
                <>
                  <span className="strike">₹{variant.originalPrice}</span>
                  <span className="off-pill">{off}% OFF</span>
                </>
              )}
            </div>

            <div className="dietary-tags">
              {(product.dietary || []).map((d) => (
                <span key={d} className="dietary-tag">{d}</span>
              ))}
            </div>

            <div className="variant-row">
              {product.variants.map((v, idx) => (
                <button
                  key={v.weight}
                  className={`variant-pill ${idx === variantIdx ? "active" : ""}`}
                  onClick={() => setVariantIdx(idx)}
                >
                  {v.weight}
                  <small>₹{v.price}</small>
                </button>
              ))}
            </div>

            <div className="qty-row">
              <div className="qty-control">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty((q) => q + 1)}>+</button>
              </div>
              <button className="btn btn-gold" onClick={handleAdd}>
                Add to Cart
              </button>
            </div>

            <form className="delivery-check" onSubmit={checkDelivery}>
              <label>Check Delivery</label>
              <div className="delivery-check-row">
                <input
                  type="text"
                  placeholder="Enter Pincode"
                  value={pincode}
                  maxLength={6}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                />
                <button type="submit" className="btn btn-gold">Check</button>
              </div>
              {deliveryMsg && <p className="delivery-msg">{deliveryMsg}</p>}
            </form>

            <div className="ingredients-box">
              <h4>Ingredients</h4>
              <p>{product.ingredients}</p>
            </div>

            <div className={`faq-item nutrition-accordion ${nutritionOpen ? "open" : ""}`}>
              <button className="faq-question" onClick={() => setNutritionOpen((o) => !o)}>
                Nutrition Facts
                <span>{nutritionOpen ? "−" : "+"}</span>
              </button>
              {nutritionOpen && (
                <div className="nutrition-grid">
                  <div><strong>{product.nutrition?.energy || "—"}</strong><span>Energy</span></div>
                  <div><strong>{product.nutrition?.fat || "—"}</strong><span>Fat</span></div>
                  <div><strong>{product.nutrition?.carbs || "—"}</strong><span>Carbs</span></div>
                  <div><strong>{product.nutrition?.protein || "—"}</strong><span>Protein</span></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="container section" style={{ paddingTop: 0 }}>
          <div className="section-head" style={{ textAlign: "left", margin: "0 0 24px" }}>
            <h2>You Might Also Like</h2>
          </div>
          <div className="product-grid">
            {related.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onAdd={(prod, v, q = 1) => {
                  addItem(prod, v, q);
                  setToast(`${prod.name} added to cart`);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onDone={() => setToast("")} />}
    </>
  );
}
