import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, User, Product, Shape } from './types';
import { supabase } from './integrations/supabase/client';
import { useSupabaseAuth } from './hooks/useSupabaseAuth';

interface AppContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (cartId: string) => void;
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  user: User | null;
  setUser: (newUser: User | null) => void;
  currency: 'INR' | 'USD';
  isGiftAdvisorOpen: boolean;
  setIsGiftAdvisorOpen: React.Dispatch<React.SetStateAction<boolean>>;
  products: Product[];
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};

// Map Supabase product to frontend Product interface
const mapSupabaseProduct = (item: any): Product => {
  return {
    id: item.id,
    code: item.code || item.id,
    name: item.name,
    category: item.category || 'Uncategorized',
    sku: item.sku,
    description: item.description || '',
    base_price: Number(item.base_price) || 0,
    gst_price: item.gst_price ? Number(item.gst_price) : undefined,
    pdfPrice: Number(item.base_price) || 0, // backwards compatibility
    shape: item.shape || Shape.RECTANGLE,
    customShapeCost: item.custom_shape_cost ? Number(item.custom_shape_cost) : 0,
    custom_shape_cost: item.custom_shape_cost ? Number(item.custom_shape_cost) : 0,
    image: item.images?.[0] || 'https://via.placeholder.com/400',
    images: item.images || [],
    size: item.size,
    discount: 35, // default discount
    allowsExtraHeads: item.allows_extra_heads || false,
    allows_extra_heads: item.allows_extra_heads || false,
    variations: item.variations || [],
    stock: item.stock || 0,
    status: item.status || 'Active',
    is_personalized: item.is_personalized || false,
    rating: item.rating ? Number(item.rating) : 0,
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser } = useSupabaseAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currency] = useState<'INR' | 'USD'>('INR');
  const [isGiftAdvisorOpen, setIsGiftAdvisorOpen] = useState(false);

  const user: User | null = authUser ? {
    id: authUser.id,
    email: authUser.email!,
    name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email!.split('@')[0],
    display_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name,
    image: authUser.user_metadata?.avatar_url,
  } : null;

  // Load products from Supabase
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'Active');
      
      if (error) {
        console.error('Error loading products:', error);
        setLoading(false);
        return;
      }
      
      if (data) {
        const mappedProducts = data.map(mapSupabaseProduct);
        setProducts(mappedProducts);
      }
      setLoading(false);
    };

    loadProducts();
  }, []);

  // Load cart from Supabase when user logs in
  useEffect(() => {
    if (!authUser) {
      setCart([]);
      return;
    }

    const loadCart = async () => {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', authUser.id);
      
      if (error) {
        console.error('Error loading cart:', error);
        return;
      }
      
      if (data && products.length > 0) {
        const cartItems: CartItem[] = data.map(item => {
          const product = products.find(p => p.id === item.product_id);
          if (!product) return null;
          
          return {
            ...product,
            cartId: item.id,
            quantity: item.quantity || 1,
            customName: item.customization?.custom_name || '',
            customImage: item.customization?.custom_image,
            selectedVariations: item.customization?.selected_variations,
            extraHeads: item.customization?.extra_heads || 0,
            calculatedPrice: product.pdfPrice,
            originalPrice: product.pdfPrice * 2,
          };
        }).filter(Boolean) as CartItem[];
        setCart(cartItems);
      }
    };

    loadCart();
  }, [authUser, products]);

  // Load wishlist from Supabase when user logs in
  useEffect(() => {
    if (!authUser) {
      setWishlist([]);
      return;
    }

    const loadWishlist = async () => {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('product_id')
        .eq('user_id', authUser.id);
      
      if (error) {
        console.error('Error loading wishlist:', error);
        return;
      }
      
      if (data && products.length > 0) {
        const wishlistProducts = products.filter(p => 
          data.some(w => w.product_id === p.id)
        );
        setWishlist(wishlistProducts);
      }
    };

    loadWishlist();
  }, [authUser, products]);

  const addToCart = async (item: CartItem) => {
    if (!authUser) {
      console.error('User must be logged in to add to cart');
      return;
    }

    const { data, error } = await supabase
      .from('cart_items')
      .insert({
        user_id: authUser.id,
        product_id: item.id,
        quantity: item.quantity,
        customization: {
          custom_name: item.customName,
          custom_image: item.customImage,
          selected_variations: item.selectedVariations,
          extra_heads: item.extraHeads,
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding to cart:', error);
      return;
    }

    if (data) {
      setCart(prev => [...prev, { ...item, cartId: data.id }]);
    }
  };

  const removeFromCart = async (cartId: string) => {
    if (!authUser) return;

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartId);

    if (error) {
      console.error('Error removing from cart:', error);
      return;
    }

    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const toggleWishlist = async (product: Product) => {
    if (!authUser) {
      console.error('User must be logged in to manage wishlist');
      return;
    }

    const exists = wishlist.find(p => p.id === product.id);

    if (exists) {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', authUser.id)
        .eq('product_id', product.id);

      if (error) {
        console.error('Error removing from wishlist:', error);
        return;
      }

      setWishlist(prev => prev.filter(p => p.id !== product.id));
    } else {
      const { error } = await supabase
        .from('wishlist_items')
        .insert({
          user_id: authUser.id,
          product_id: product.id
        });

      if (error) {
        console.error('Error adding to wishlist:', error);
        return;
      }

      setWishlist(prev => [...prev, product]);
    }
  };

  const setUser = (newUser: User | null) => {
    console.warn('setUser is deprecated, use Supabase auth instead');
  };

  return (
    <AppContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      wishlist, 
      toggleWishlist, 
      user, 
      setUser, 
      currency, 
      isGiftAdvisorOpen, 
      setIsGiftAdvisorOpen, 
      products,
      loading 
    }}>
      {children}
    </AppContext.Provider>
  );
};
