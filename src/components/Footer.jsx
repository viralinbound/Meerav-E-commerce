import { useState } from "react";
import { Link } from "react-router-dom";
import { useCatalog } from "../context/CatalogContext";
import { brand } from "../data/staticContent";

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  const { categories } = useCatalog();

  return (
    <footer className="footer">
      <div className="container footer-newsletter">
        <div>
          <h4>Get Offers &amp; Fresh-Batch Alerts</h4>
          <p>Drop your email for exclusive discounts and new launch updates.</p>
        </div>
        <form
          className="newsletter-form"
          onSubmit={(e) => {
            e.preventDefault();
            setSubscribed(true);
            e.target.reset();
          }}
        >
          <input type="email" placeholder="Enter your email" required />
          <button type="submit" className="btn btn-gold">
            {subscribed ? "Subscribed" : "Subscribe"}
          </button>
        </form>
      </div>

      <div className="container footer-grid">
        <div>
          <div className="footer-brand">
            <img src="/images/meerav_logo.png" alt={brand.name} className="brand-logo-img" />
            {brand.name}
          </div>
          <p className="footer-hindi">बीकानेर के दिल से</p>
          <p className="tag">
            Authentic royal Bikaneri namkeens, sweets, and roasted diet
            savories crafted daily in pure groundnut oil with zero palm oil.
          </p>
          <div className="social-row">
            <a href="#">Instagram</a>
            <a href="#">Facebook</a>
            <a href={`https://wa.me/${brand.phone.replace(/\D/g, "")}`}>WhatsApp</a>
          </div>
        </div>
        <div>
          <h4>Snack Collections</h4>
          <div className="footer-links">
            {categories.filter((c) => c.id !== "all").map((c) => (
              <Link key={c.id} to={`/category/${c.id}`}>{c.name}</Link>
            ))}
            <Link to="/about">About Us</Link>
          </div>
        </div>
        <div>
          <h4>Policies</h4>
          <div className="footer-links">
            <a href="#">Cancellation / Refund</a>
            <a href="#">Terms &amp; Conditions</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Shipping Policy</a>
          </div>
        </div>
        <div>
          <h4>Contact &amp; Support</h4>
          <div className="footer-links">
            <a href={`https://wa.me/${brand.phone.replace(/\D/g, "")}`}>WhatsApp Quick Order</a>
            <span>{brand.address}</span>
            <span>{brand.phone}</span>
            <span>{brand.email}</span>
          </div>
        </div>
      </div>

      <div className="footer-certs">
        <span>100% VEG</span>
        <span>ZERO PALM OIL</span>
        <span>FSSAI CERTIFIED</span>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} {brand.name} Namkeens &amp; Sweets. All rights reserved.
      </div>
    </footer>
  );
}
