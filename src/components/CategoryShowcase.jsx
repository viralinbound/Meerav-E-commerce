import { Link } from "react-router-dom";
import MiniProductCard from "./MiniProductCard";
import { useCatalog } from "../context/CatalogContext";

const THEMES = [
  { bg: "linear-gradient(160deg, #6e1423, #4e0d18)", ribbon: "The Royal Treat" },
  { bg: "linear-gradient(160deg, #1f5c56, #123c38)", ribbon: "Handful of Happiness" },
  { bg: "linear-gradient(160deg, #0b132b, #1c2541)", ribbon: "Crispy & Traditional" },
  { bg: "linear-gradient(160deg, #c1552c, #8f3c1c)", ribbon: "Guilt-Free Crunch" },
  { bg: "linear-gradient(160deg, #7a5312, #4e3308)", ribbon: "Festive Favourites" },
];

export default function CategoryShowcase({ category, index, onAdd }) {
  const { productsByCategory } = useCatalog();
  const theme = THEMES[index % THEMES.length];
  const items = productsByCategory(category.id).slice(0, 4);

  if (items.length === 0) return null;

  return (
    <section className="category-band" style={{ background: theme.bg }}>
      <div className="container category-band-inner">
        <div className="hero-ribbon">{theme.ribbon}</div>
        <h2>{category.name}</h2>
        <p>{category.description}</p>

        <div className="category-band-row">
          {items.map((p) => (
            <MiniProductCard key={p.id} product={p} onAdd={onAdd} />
          ))}
        </div>

        <Link to={`/category/${category.id}`} className="btn btn-gold btn-lg category-band-explore">
          Explore {category.name}
        </Link>
      </div>
    </section>
  );
}
