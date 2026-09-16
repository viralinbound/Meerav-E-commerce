import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";

export default function MiniProductCard({ product, onAdd }) {
  const variant = product.variants[0];
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  return (
    <div className="mini-card">
      <Link to={`/product/${product.id}`} className="mini-card-thumb">
        <img src={product.image} alt={product.name} loading="lazy" />
      </Link>
      <div className="mini-card-body">
        <Link to={`/product/${product.id}`} className="mini-card-name">
          {product.name}
        </Link>
        <div className="mini-card-price">
          ₹{variant.price}
          {variant.originalPrice > variant.price && (
            <span className="strike">₹{variant.originalPrice}</span>
          )}
        </div>
        <button className="mini-card-add" onClick={() => onAdd(product, variant)}>
          Add to Cart
        </button>
        <button
          className={`mini-card-wish ${wishlisted ? "active" : ""}`}
          onClick={() => toggle(product.id)}
        >
          {wishlisted ? "Wishlisted" : "Add to Wish List"}
        </button>
      </div>
    </div>
  );
}
