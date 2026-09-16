import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import Toast from "../components/Toast";
import { useCart } from "../context/CartContext";
import { useCatalog } from "../context/CatalogContext";
import JaaliDivider from "../components/JaaliDivider";

const SORTS = [
  { id: "popular", label: "Most Popular" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "rating", label: "Highest Rated" },
];

export default function Shop() {
  const { catId } = useParams();
  const activeCategory = catId || "all";
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [sort, setSort] = useState("popular");
  const { addItem } = useCart();
  const { categories, productsByCategory, getCategory, loading } = useCatalog();
  const [toast, setToast] = useState("");

  const category = getCategory(activeCategory);
  const categoryPills = useMemo(() => {
    const rest = categories.filter((c) => c.id !== "all");
    return [{ id: "all", name: "All Delicacies" }, ...rest];
  }, [categories]);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setQuery(q);
  }, [searchParams]);

  function handleAdd(product, variant, qty = 1) {
    addItem(product, variant, qty);
    setToast(`${product.name} added to cart`);
  }

  const filtered = useMemo(() => {
    let list = productsByCategory(activeCategory).filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );
    switch (sort) {
      case "price-asc":
        list = [...list].sort((a, b) => a.variants[0].price - b.variants[0].price);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.variants[0].price - a.variants[0].price);
        break;
      case "rating":
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
      default:
        list = [...list].sort((a, b) => b.reviewsCount - a.reviewsCount);
    }
    return list;
  }, [activeCategory, query, sort, productsByCategory]);

  if (loading) {
    return <div className="container section" style={{ textAlign: "center" }}>Loading fresh batches from the kitchen…</div>;
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <span className="hindi-accent hindi-accent-light">स्वादिष्ट व्यंजनों की दुकान</span>
          <div className="breadcrumb">Home / {category ? category.name : "Shop"}</div>
          <h1>{category ? category.name : "Shop All Delicacies"}</h1>
          {category && <p className="page-header-desc">{category.description}</p>}
        </div>
      </div>
      <JaaliDivider tone="light" />

      <div className="container section">
        <div className="category-strip">
          {categoryPills.map((c) => (
            <Link
              key={c.id}
              to={c.id === "all" ? "/shop" : `/category/${c.id}`}
              className={`category-pill ${activeCategory === c.id ? "active" : ""}`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        <div className="shop-toolbar">
          <span style={{ color: "#6b5643" }}>{filtered.length} products</span>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <input
              className="search-box"
              placeholder="Search for namkeen, sweets..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="product-grid">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={handleAdd} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No products found</h3>
            <p>Try a different category or search term.</p>
          </div>
        )}
      </div>

      {toast && <Toast message={toast} onDone={() => setToast("")} />}
    </>
  );
}
