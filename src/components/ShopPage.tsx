import { ArrowLeft } from 'lucide-react';
import type { Product } from '@/data/products';
import { ProductGrid } from '@/components/ProductGrid';

interface ShopPageProps {
  selectedCategory: string | null;
  searchQuery: string;
  onCategoryChange: (catId: string | null) => void;
  onProductClick: (product: Product) => void;
  onBackHome: () => void;
}

export function ShopPage({ selectedCategory, searchQuery, onCategoryChange, onProductClick, onBackHome }: ShopPageProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-cream-200 bg-cream-50">
        <div className="container-max section-padding py-4">
          <button
            onClick={onBackHome}
            className="inline-flex items-center gap-2 text-sm font-medium text-charcoal-600 hover:text-maroon-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </div>

      <ProductGrid
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        onCategoryChange={onCategoryChange}
        onProductClick={onProductClick}
      />
    </div>
  );
}
