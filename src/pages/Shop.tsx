
import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { calculatePrice } from '../data/products';
import { useCart } from '../context';
import { Star, Heart, Search, Filter, ChevronDown, SlidersHorizontal, Gift, Loader2 } from 'lucide-react';

const OCCASIONS = [
    "Birthday",
    "Anniversary",
    "Love",
    "Wedding",
    "Kids",
    "Corporate"
];

export const Shop: React.FC = () => {
  const { currency, wishlist, toggleWishlist, products, loading } = useCart();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [sortBy, setSortBy] = useState('popularity');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const categories = useMemo(() => {
      return Array.from(new Set(products.map(p => p.category)));
  }, []);

  const formatPrice = (price: number) => {
    return currency === 'INR' 
      ? `₹${price.toLocaleString('en-IN')}` 
      : `$${(price * 0.012).toFixed(2)}`;
  };
  
  const isInWishlist = (id: string) => wishlist.some(p => p.id === id);

  const filteredProducts = useMemo(() => {
      return products.filter(product => {
          const prices = calculatePrice(product);
          const query = initialQuery.toLowerCase().trim();
          const matchesSearch = !query || product.name.toLowerCase().includes(query) || product.category.toLowerCase().includes(query) || (product.sku && product.sku.toLowerCase().includes(query));
          const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
          const matchesPrice = prices.final >= priceRange[0] && prices.final <= priceRange[1];
          const matchesOccasion = selectedOccasions.length === 0 || selectedOccasions.some(occ => {
              const keyword = occ.toLowerCase();
              return product.name.toLowerCase().includes(keyword) || product.category.toLowerCase().includes(keyword) || product.description.toLowerCase().includes(keyword);
          });
          return matchesSearch && matchesCategory && matchesPrice && matchesOccasion;
      }).sort((a, b) => {
          const priceA = calculatePrice(a).final;
          const priceB = calculatePrice(b).final;
          switch(sortBy) {
              case 'price_low': return priceA - priceB;
              case 'price_high': return priceB - priceA;
              case 'newest': return parseInt(b.id) - parseInt(a.id); 
              default: return 0; 
          }
      });
  }, [initialQuery, selectedCategories, selectedOccasions, priceRange, sortBy]);

  const toggleCategory = (cat: string) => {
      setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const toggleOccasion = (occ: string) => {
      setSelectedOccasions(prev => prev.includes(occ) ? prev.filter(o => o !== occ) : [...prev, occ]);
  };

  const handleWishlistToggle = (e: React.MouseEvent, product: any) => {
      e.preventDefault();
      e.stopPropagation();
      toggleWishlist(product);
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Shop All Gifts</h1>
                {initialQuery && (
                    <p className="text-sm text-gray-500 mt-1">
                        Showing results for "<span className="font-bold text-primary">{initialQuery}</span>"
                    </p>
                )}
            </div>
            
            <div className="flex items-center gap-3">
                <button onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)} className="md:hidden flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium">
                    <Filter className="w-4 h-4" /> Filters
                </button>
                
                <div className="relative group">
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-4 pr-10 rounded-lg leading-tight focus:outline-none focus:border-primary cursor-pointer text-sm">
                        <option value="popularity">Sort by Popularity</option>
                        <option value="newest">Newest Arrivals</option>
                        <option value="price_low">Price: Low to High</option>
                        <option value="price_high">Price: High to Low</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"><ChevronDown className="w-4 h-4" /></div>
                </div>
            </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className={`md:w-64 bg-white p-6 rounded-xl border border-gray-200 h-fit ${mobileFiltersOpen ? 'block' : 'hidden md:block'}`}>
                <div className="flex items-center gap-2 mb-6 pb-4 border-b">
                    <SlidersHorizontal className="w-5 h-5 text-primary" />
                    <span className="font-bold text-lg">Filters</span>
                </div>

                {/* Categories */}
                <div className="mb-8">
                    <h3 className="font-bold text-sm text-gray-900 mb-3 uppercase tracking-wide flex items-center gap-2">Categories</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                        {categories.map(cat => (
                            <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedCategories.includes(cat) ? 'bg-primary border-primary' : 'bg-white border-gray-300 group-hover:border-primary'}`}>
                                    {selectedCategories.includes(cat) && <div className="w-2 h-2 bg-white rounded-sm" />}
                                </div>
                                <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => toggleCategory(cat)} className="hidden" />
                                <span className={`text-sm ${selectedCategories.includes(cat) ? 'text-primary font-medium' : 'text-gray-600'}`}>{cat}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Occasions */}
                <div className="mb-8">
                    <h3 className="font-bold text-sm text-gray-900 mb-3 uppercase tracking-wide flex items-center gap-2">Occasion <Gift className="w-3 h-3 text-accent" /></h3>
                    <div className="space-y-2">
                        {OCCASIONS.map(occ => (
                            <label key={occ} className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedOccasions.includes(occ) ? 'bg-accent border-accent' : 'bg-white border-gray-300 group-hover:border-accent'}`}>
                                    {selectedOccasions.includes(occ) && <div className="w-2 h-2 bg-white rounded-sm" />}
                                </div>
                                <input type="checkbox" checked={selectedOccasions.includes(occ)} onChange={() => toggleOccasion(occ)} className="hidden" />
                                <span className={`text-sm ${selectedOccasions.includes(occ) ? 'text-accent font-medium' : 'text-gray-600'}`}>{occ}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Price Range */}
                <div>
                    <h3 className="font-bold text-sm text-gray-900 mb-3 uppercase tracking-wide">Price Range</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <span>₹0</span>
                        <input type="range" min="0" max="10000" step="100" value={priceRange[1]} onChange={(e) => setPriceRange([0, parseInt(e.target.value)])} className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" />
                        <span>₹{priceRange[1]}</span>
                    </div>
                </div>

                <button onClick={() => { setSelectedCategories([]); setSelectedOccasions([]); setPriceRange([0, 10000]); }} className="w-full mt-6 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Reset All Filters</button>
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
                {filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-96 bg-white rounded-xl border border-gray-200 text-center p-8">
                        <Search className="w-12 h-12 text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900">No products found</h3>
                        <p className="text-gray-500 mt-2">Try adjusting your search or filters to find what you're looking for.</p>
                        <button onClick={() => { setSelectedCategories([]); setSelectedOccasions([]); setPriceRange([0, 10000]); }} className="mt-6 text-primary font-bold hover:underline">Clear all filters</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {filteredProducts.map(product => {
                            const prices = calculatePrice(product);
                            return (
                                <div key={product.id} className="relative group">
                                    <Link 
                                        to={`/product/${product.id}`}
                                        className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                                    >
                                        <div className="relative aspect-[4/5] bg-gray-50 p-4 overflow-hidden">
                                            <img 
                                                src={product.image} 
                                                alt={product.name} 
                                                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" 
                                                loading="lazy" 
                                            />
                                            {product.discount && (
                                                <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
                                                    -{product.discount}%
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="p-3 flex flex-col flex-1">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{product.category}</p>
                                            <h3 className="text-sm font-bold text-gray-800 line-clamp-2 mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
                                            <div className="flex items-center gap-1 mb-2">
                                                <div className="flex text-yellow-400">{[...Array(5)].map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-current" />)}</div>
                                                <span className="text-[10px] text-gray-400">(42)</span>
                                            </div>
                                            <div className="mt-auto pt-2 border-t border-gray-50 flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-400 line-through">{formatPrice(prices.original)}</span>
                                                    <span className="text-base font-bold text-gray-900">{formatPrice(prices.final)}</span>
                                                </div>
                                                {product.stock && product.stock < 10 && (
                                                    <span className="text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded font-medium">Only {product.stock} left</span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                    
                                    {/* Wishlist Button - Positioned Absolutely Over the Link */}
                                    <button 
                                        onClick={(e) => handleWishlistToggle(e, product)}
                                        className={`absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md transition-all transform hover:scale-110 z-20 ${isInWishlist(product.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                                    >
                                        <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
