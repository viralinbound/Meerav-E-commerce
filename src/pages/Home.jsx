import { useNavigate } from "react-router-dom";
import Hero from "../components/Hero";
import BrandStory from "../components/BrandStory";
import BestSellers from "../components/BestSellers";
import HomeProductGrid from "../components/HomeProductGrid";
import HeritageSection from "../components/HeritageSection";
import GiftShowcase from "../components/GiftShowcase";
import { Testimonials, KitchenStories, InstagramFeed, FAQSection } from "../components/Sections";
import { useCatalog } from "../context/CatalogContext";

export default function Home() {
  const navigate = useNavigate();
  const { loading, error } = useCatalog();

  if (loading) {
    return (
      <div className="container-max section-padding py-24 text-center text-charcoal-500">
        Loading fresh batches from the kitchen…
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-max section-padding py-24 text-center text-charcoal-500">
        Couldn't load live data from Supabase: {error}
      </div>
    );
  }

  function scrollToProducts() {
    const el = document.getElementById("products");
    if (el) el.scrollIntoView({ behavior: "smooth" });
    else navigate("/shop");
  }

  return (
    <>
      <Hero />
      <BrandStory />
      <BestSellers onViewAll={scrollToProducts} />
      <HomeProductGrid />
      <HeritageSection />
      <GiftShowcase />
      <Testimonials />
      <KitchenStories />
      <InstagramFeed />
      <FAQSection />
    </>
  );
}
