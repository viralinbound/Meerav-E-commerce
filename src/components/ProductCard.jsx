import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import StarRating from "./StarRating";
import { useCatalog } from "../context/CatalogContext";
import { useWishlist } from "../context/WishlistContext";

export default function ProductCard({ product, onAdd }) {
  const [variantIdx, setVariantIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const { discountPercent } = useCatalog();
  const variant = product.variants[variantIdx];
  const off = discountPercent(variant);
  const savings = Math.max(0, (variant.originalPrice || variant.price) - variant.price);
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(product.id);
  const navigate = useNavigate();

  function expressBuy() {
    onAdd(product, variant, qty);
    navigate("/cart");
  }

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-thumb">
        {product.tag && <span className="product-badge">{product.tag}</span>}
        {off > 0 && <span className="off-badge">{off}% OFF</span>}
        <img src={product.image} alt={product.name} loading="lazy" />
      </Link>
      <button
        className={`wishlist-btn ${wishlisted ? "active" : ""}`}
        onClick={() => toggle(product.id)}
      >
        {wishlisted ? "Saved" : "Save"}
      </button>
      <div className="product-body">
        <span className="product-cat">{product.spiceLevel}</span>
        <Link to={`/product/${product.id}`}>
          <h3>{product.name}</h3>
        </Link>
        <StarRating rating={product.rating} reviewsCount={product.reviewsCount} />

        <div className="card-pack-row">
          {product.variants.map((v, idx) => (
            <button
              key={v.weight}
              className={`card-pack-pill ${idx === variantIdx ? "active" : ""}`}
              onClick={() => setVariantIdx(idx)}
            >
              {v.weight}
            </button>
          ))}
        </div>

        <div className="product-footer">
          <div>
            <div className="price">
              ₹{variant.price}
              {variant.originalPrice > variant.price && (
                <span className="strike">₹{variant.originalPrice}</span>
              )}
            </div>
            {savings > 0 && <div className="save-tag">Save ₹{savings}</div>}
          </div>
          <div className="qty-control qty-control-sm">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
            <span>{qty}</span>
            <button onClick={() => setQty((q) => q + 1)}>+</button>
          </div>
        </div>

        <div className="card-action-row">
          <Link to={`/product/${product.id}`} className="btn-details">
            Details
          </Link>
          <button className="add-btn" onClick={() => onAdd(product, variant, qty)}>
            Add to Cart
          </button>
        </div>
        <button className="express-buy-btn" onClick={expressBuy}>
          Express Buy
        </button>
      </div>
    </div>
  );
}
