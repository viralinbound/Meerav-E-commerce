import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useCatalog } from "../context/CatalogContext";
import { useAuth } from "../context/AuthContext";
import { brand } from "../data/staticContent";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
    </svg>
  );
}

function HeartIcon({ filled }) {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <path d="M12 20.5s-7.5-4.6-10-9.3C.4 7.8 2 4 5.6 4c2 0 3.5 1 4.4 2.4.9-1.4 2.4-2.4 4.4-2.4C18 4 19.6 7.8 18 11.2c-2.5 4.7-6 9.3-6 9.3Z" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8h12l-1 12H7L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { totalItems } = useCart();
  const { ids: wishlistIds } = useWishlist();
  const { categories, coupons } = useCatalog();
  const { customer } = useAuth();
  const navigate = useNavigate();
  const topCoupon = coupons[0];

  const links = [
    { to: "/", label: "Home" },
    { to: "/about", label: "Our Story" },
    { to: "/contact", label: "Contact" },
  ];

  function handleSearch(e) {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    navigate(`/shop?q=${encodeURIComponent(searchTerm.trim())}`);
    setOpen(false);
  }

  return (
    <header className="navbar">
      <div className="topbar">
        <div className="topbar-inner">
          {topCoupon ? (
            <span>
              Use coupon <strong>{topCoupon.code}</strong> — {topCoupon.description || `${topCoupon.discountVal}${topCoupon.discountType === "percentage" ? "%" : "₹"} off`}
            </span>
          ) : (
            <span>Fresh Bikaneri snacks, dispatched same-day from our Bikaner kitchen</span>
          )}
          <div className="topbar-links">
            <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer">WhatsApp Order</a>
            <a href="/admin.html">Admin Portal</a>
          </div>
        </div>
      </div>

      <div className="navbar-main">
        <Link to="/" className="brand-lockup" onClick={() => setOpen(false)}>
          <span className="brand-logo-badge">
            <img src="/images/meerav_logo.png" alt={brand.name} />
          </span>
          <span className="brand-lockup-text">
            <strong>{brand.name} NAMKEENS &amp; SWEETS</strong>
            <small>Fried Fresh in Bikaner, Since 1983</small>
          </span>
        </Link>

        <form className="navbar-search-bar" onSubmit={handleSearch}>
          <SearchIcon />
          <input
            type="text"
            placeholder="Search Aloo Bhujia, Ratlami Sev, Mathri, Makhana..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>

        <div className="navbar-actions">
          <NavLink to="/account" className="navbar-account-btn" onClick={() => setOpen(false)}>
            {customer?.avatar ? (
              <img src={customer.avatar} alt="" className="navbar-account-avatar" />
            ) : (
              <UserIcon />
            )}
            <span>{customer ? customer.name.split(" ")[0] : "Sign In"}</span>
          </NavLink>

          <NavLink to="/wishlist" className="navbar-icon-btn" onClick={() => setOpen(false)}>
            <HeartIcon />
            {wishlistIds.length > 0 && <span className="cart-badge">{wishlistIds.length}</span>}
          </NavLink>

          <NavLink to="/cart" className="navbar-cart-btn" onClick={() => setOpen(false)}>
            <BagIcon />
            <span>Cart</span>
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </NavLink>

          <button className="menu-toggle" onClick={() => setOpen((o) => !o)}>
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      <nav className={`navbar-subnav ${open ? "open" : ""}`}>
        <div
          className="nav-cat-dropdown"
          onMouseEnter={() => setCatOpen(true)}
          onMouseLeave={() => setCatOpen(false)}
        >
          <NavLink to="/shop" className={({ isActive }) => (isActive ? "active nav-caret" : "nav-caret")}>
            Shop All
          </NavLink>
          <div className={`cat-dropdown-panel ${catOpen ? "show" : ""}`}>
            {categories
              .filter((c) => c.id !== "all")
              .map((c) => (
                <Link key={c.id} to={`/category/${c.id}`} onClick={() => { setOpen(false); setCatOpen(false); }}>
                  <img src={c.image} alt="" />
                  <span>
                    <strong>{c.name}</strong>
                    <small>{c.description}</small>
                  </span>
                </Link>
              ))}
          </div>
        </div>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === "/"}
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={() => setOpen(false)}
          >
            {l.label}
          </NavLink>
        ))}
      </nav>

    </header>
  );
}
