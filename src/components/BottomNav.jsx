import { NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";

const tabs = [
  { to: "/", label: "Home", end: true },
  { to: "/shop", label: "Categories" },
  { to: "/cart", label: "Cart", showBadge: true },
  { to: "/contact", label: "Track" },
  { to: "/account", label: "Account" },
];

export default function BottomNav() {
  const { totalItems } = useCart();

  return (
    <nav className="bottom-nav">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.end}
          className={({ isActive }) => `bottom-nav-item ${isActive ? "active" : ""}`}
        >
          <span>{t.label}</span>
          {t.showBadge && totalItems > 0 && <span className="bottom-nav-badge">{totalItems}</span>}
        </NavLink>
      ))}
    </nav>
  );
}
