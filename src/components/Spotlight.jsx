import { Link } from "react-router-dom";
import { useCatalog } from "../context/CatalogContext";

export default function Spotlight({ product }) {
  const { discountPercent } = useCatalog();
  if (!product) return null;

  const variant = product.variants[0];
  const off = discountPercent(variant);

  return (
    <section className="spotlight">
      <div className="spotlight-blob" />
      <div className="container spotlight-inner">
        <div className="spotlight-text">
          <div className="hero-ribbon hero-ribbon-dark">{product.tag || "Signature Pick"}</div>
          <h2>{product.name}</h2>
          <p>{product.description}</p>
          <div className="spotlight-price">
            ₹{variant.price}
            {variant.originalPrice > variant.price && (
              <>
                <span className="strike">₹{variant.originalPrice}</span>
                {off > 0 && <span className="off-pill">{off}% OFF</span>}
              </>
            )}
          </div>
          <Link to={`/product/${product.id}`} className="btn btn-dark btn-lg">
            Explore Product
          </Link>
        </div>
        <div className="spotlight-visual">
          <img src={product.image} alt={product.name} />
        </div>
      </div>
      <svg className="wave-divider wave-divider-flip" viewBox="0 0 1200 90" preserveAspectRatio="none">
        <path d="M0,40 C200,90 400,0 600,30 C800,60 1000,10 1200,45 L1200,90 L0,90 Z" fill="var(--cream)" />
      </svg>
    </section>
  );
}
