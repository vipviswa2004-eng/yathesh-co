import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, User, Product } from './types';
import { products as localProducts } from './data/products';

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [user, setUserState] = useState<User | null>(null);
  const [products] = useState<Product[]>(localProducts);
  const [currency] = useState<'INR' | 'USD'>('INR');
  const [isGiftAdvisorOpen, setIsGiftAdvisorOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
    
    const savedWish = localStorage.getItem('wishlist');
    if (savedWish) {
      try {
        setWishlist(JSON.parse(savedWish));
      } catch (e) {
        console.error('Failed to parse wishlist', e);
      }
    }

    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUserState(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse user', e);
      }
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Save wishlist to localStorage
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Save user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
  };

  const addToCart = (item: CartItem) => {
    setCart(prev => [...prev, item]);
  };

  const removeFromCart = (cartId: string) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const toggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      }
      return [...prev, product];
    });
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
      products 
    }}>
      {children}
    </AppContext.Provider>
  );
};
