import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Menu, X, Heart, User } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useCatalog } from "../context/CatalogContext";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { totalItems } = useCart();
  const { ids: wishlistIds } = useWishlist();
  const { categories, coupons } = useCatalog();
  const { customer } = useAuth();
  const navigate = useNavigate();
  const topCoupon = coupons[0];

  const shopCategories = categories.filter((c) => c.id !== "all");

  function handleSearch(e) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    setMobileMenuOpen(false);
  }

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-maroon-800 text-cream-50 text-[11px]">
        <div className="container-max section-padding py-1.5 flex items-center justify-center gap-4 relative">
          <span className="text-center">
            {topCoupon ? (
              <>
                Use coupon <strong>{topCoupon.code}</strong> — {topCoupon.description || `${topCoupon.discountVal}${topCoupon.discountType === "percentage" ? "%" : "₹"} off`}
              </>
            ) : (
              "Fresh Bikaneri snacks, dispatched same-day from our Bikaner kitchen"
            )}
          </span>
          <a
            href="/admin.html"
            className="hidden sm:inline absolute right-4 text-cream-200 hover:text-saffron-300 transition-colors whitespace-nowrap"
          >
            Admin Login
          </a>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-cream-50 shadow-sm">
        <div className="container-max section-padding">
          <div className="flex items-center flex-nowrap py-1.5 gap-1 xl:gap-1.5">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-1 shrink-0" onClick={() => setMobileMenuOpen(false)}>
              <img src="/images/meerav_logo.png" alt="Meerav" className="w-7 h-7 rounded-full object-cover shrink-0" />
              <div className="text-left hidden xl:block">
                <h1 className="font-serif text-sm font-bold text-maroon-800 leading-none whitespace-nowrap">Meerav</h1>
                <p className="text-[7px] text-charcoal-500 tracking-widest uppercase whitespace-nowrap">Bikaneri Namkeens</p>
              </div>
            </Link>

            {/* Category Nav - inline, one line */}
            <nav className="hidden lg:flex items-center gap-0.5 shrink-0">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `px-1.5 py-1 text-[11px] xl:text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    isActive ? "text-maroon-700 bg-cream-100" : "text-charcoal-700 hover:text-maroon-700 hover:bg-cream-100"
                  }`
                }
              >
                Home
              </NavLink>
              {shopCategories.map((cat) => (
                <NavLink
                  key={cat.id}
                  to={`/category/${cat.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-1.5 py-1 text-[11px] xl:text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      isActive ? "text-maroon-700 bg-cream-100" : "text-charcoal-700 hover:text-maroon-700 hover:bg-cream-100"
                    }`
                  }
                >
                  {cat.name}
                </NavLink>
              ))}
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `px-1.5 py-1 text-[11px] xl:text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    isActive ? "text-maroon-700 bg-cream-100" : "text-charcoal-700 hover:text-maroon-700 hover:bg-cream-100"
                  }`
                }
              >
                Our Story
              </NavLink>
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `px-1.5 py-1 text-[11px] xl:text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    isActive ? "text-maroon-700 bg-cream-100" : "text-charcoal-700 hover:text-maroon-700 hover:bg-cream-100"
                  }`
                }
              >
                Contact
              </NavLink>
            </nav>

            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 min-w-0 max-w-[180px] xl:max-w-[220px]">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-3 pr-8 py-1 border-2 border-cream-300 rounded-full focus:border-saffron-400 focus:outline-none transition-colors text-[11px]"
                />
                <button
                  type="submit"
                  className="absolute right-0.5 top-1/2 -translate-y-1/2 w-6 h-6 bg-saffron-500 rounded-full flex items-center justify-center text-white hover:bg-saffron-600 transition-colors"
                >
                  <Search className="w-3 h-3" />
                </button>
              </div>
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-1 xl:gap-1.5 shrink-0 ml-auto">
              <NavLink
                to="/account"
                className="hidden lg:flex items-center gap-1 text-[11px] text-charcoal-600 hover:text-maroon-700 transition-colors whitespace-nowrap"
              >
                {customer?.avatar ? (
                  <img src={customer.avatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                ) : (
                  <User className="w-3 h-3" />
                )}
                {customer ? customer.name.split(" ")[0] : "Sign In"}
              </NavLink>

              <NavLink to="/wishlist" className="relative flex items-center text-charcoal-600 hover:text-maroon-700 transition-colors">
                <Heart className="w-4 h-4" />
                {wishlistIds.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-saffron-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {wishlistIds.length}
                  </span>
                )}
              </NavLink>

              <NavLink
                to="/cart"
                className="relative flex items-center gap-1 px-2 py-1 bg-maroon-700 text-cream-50 rounded-full hover:bg-maroon-800 transition-colors shrink-0"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px] font-medium whitespace-nowrap">Cart</span>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-saffron-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </NavLink>

              <button
                onClick={() => setMobileMenuOpen((o) => !o)}
                className="lg:hidden p-1 text-charcoal-700 shrink-0"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-cream-50 border-t border-cream-200">
            <div className="container-max section-padding py-4 space-y-1">
              <form onSubmit={handleSearch} className="mb-3">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-4 pr-12 py-2.5 border-2 border-cream-300 rounded-full focus:border-saffron-400 focus:outline-none text-sm"
                  />
                  <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 bg-saffron-500 rounded-full flex items-center justify-center text-white">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </form>
              <NavLink
                to="/"
                end
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-left px-3 py-2.5 text-sm font-medium text-charcoal-700 hover:bg-cream-100 rounded-md"
              >
                Home
              </NavLink>
              {shopCategories.map((cat) => (
                <NavLink
                  key={cat.id}
                  to={`/category/${cat.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left px-3 py-2.5 text-sm font-medium text-charcoal-700 hover:bg-cream-100 rounded-md"
                >
                  {cat.name}
                </NavLink>
              ))}
              <NavLink
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-left px-3 py-2.5 text-sm font-medium text-charcoal-700 hover:bg-cream-100 rounded-md"
              >
                Our Story
              </NavLink>
              <NavLink
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-left px-3 py-2.5 text-sm font-medium text-charcoal-700 hover:bg-cream-100 rounded-md"
              >
                Contact
              </NavLink>
              <div className="flex gap-2 pt-2 border-t border-cream-200 mt-2">
                <NavLink
                  to="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-charcoal-600 border border-cream-300 rounded-md"
                >
                  <Heart className="w-4 h-4" /> Wishlist
                </NavLink>
                <NavLink
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-charcoal-600 border border-cream-300 rounded-md"
                >
                  <User className="w-4 h-4" /> {customer ? "Account" : "Sign In"}
                </NavLink>
              </div>
              <a
                href="/admin.html"
                className="block text-center mt-2 pt-2 text-xs text-charcoal-400 hover:text-maroon-700"
              >
                Admin Login
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
