import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Sparkles, LogIn, LogOut, ShieldCheck, UserPlus, Search, Clock, ArrowUpRight, Gift, Heart } from 'lucide-react';
import { useCart } from '../context';
import { Product, ADMIN_EMAILS } from '../types';
import { supabase } from '../integrations/supabase/client';

export const Navbar: React.FC = () => {
  const { cart, wishlist, user, setUser, setIsGiftAdvisorOpen, products } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
      try {
          const savedSearches = localStorage.getItem('recentSearches');
          if (savedSearches) {
              const parsed = JSON.parse(savedSearches);
              if (Array.isArray(parsed)) setRecentSearches(parsed);
          }
      } catch (e) { setRecentSearches([]); }
  }, []);

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          const target = event.target as Node;
          const outsideDesktop = desktopSearchRef.current && !desktopSearchRef.current.contains(target);
          const outsideMobile = mobileSearchRef.current && !mobileSearchRef.current.contains(target);
          if (outsideDesktop && outsideMobile) setShowSuggestions(false);
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
      if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const filtered = products.filter(p => 
              p.name.toLowerCase().includes(query) || 
              p.category.toLowerCase().includes(query) ||
              (p.sku && p.sku.toLowerCase().includes(query))
          ).slice(0, 6);
          setSuggestions(filtered);
          setShowSuggestions(true);
      } else {
          setSuggestions([]);
          setShowSuggestions(true);
      }
  }, [searchQuery, products]);

  const saveRecentSearch = (term: string) => {
      if (!term.trim()) return;
      const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoginModalOpen(false); // Close modal before redirect

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          scopes: 'email profile',
        }
      });

      if (error) {
        console.error('Google login error:', error);
        alert(`Login failed: ${error.message}`);
        setIsLoginModalOpen(true); // Reopen modal on error
        return;
      }

      if (data?.url) {
        // Redirect will happen automatically
        console.log('Redirecting to Google OAuth...');
      }
    } catch (err) {
      console.error('Unexpected error during Google login:', err);
      alert('An unexpected error occurred. Please try again.');
      setIsLoginModalOpen(true);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    const email = emailInput.trim().toLowerCase();
    
    // Simple password for demo - in production, use proper auth
    const password = 'demo123';
    
    if (authMode === 'register') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        console.error('Sign up error:', error);
        alert(error.message);
        return;
      }
      
      alert('Please check your email to confirm your account!');
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Sign in error:', error);
        alert(error.message);
        return;
      }
    }
    
    setIsLoginModalOpen(false);
    setEmailInput('');
  };

  const handleLogout = async () => { 
    await supabase.auth.signOut();
    setIsLoginModalOpen(false); 
  };
  const openLoginModal = () => { setIsMenuOpen(false); setIsLoginModalOpen(true); setAuthMode('login'); setEmailInput(''); };
  const toggleAuthMode = () => { setAuthMode(prev => prev === 'login' ? 'register' : 'login'); setEmailInput(''); };
  
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement> | { key: string }) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim());
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (productId: string) => { navigate(`/product/${productId}`); setSearchQuery(''); setShowSuggestions(false); setIsMenuOpen(false); };
  const handleRecentSearchClick = (term: string) => { setSearchQuery(term); saveRecentSearch(term); navigate(`/products?q=${encodeURIComponent(term)}`); setShowSuggestions(false); };
  const clearRecentSearches = (e: React.MouseEvent) => { e.stopPropagation(); setRecentSearches([]); localStorage.removeItem('recentSearches'); };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 hover:text-primary md:hidden" title="Open menu"><Menu className="h-6 w-6" /></button>
              <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                <div><span className="font-bold text-lg md:text-xl tracking-tight text-gray-900 leading-none block">SIGN GALAXY</span><span className="text-[10px] text-gray-500 tracking-widest uppercase hidden md:block">Yathes Personalized Gifts</span></div>
              </Link>
            </div>

            <div className="hidden md:flex flex-1 mx-8 items-center justify-center" ref={desktopSearchRef}>
                <div className="relative w-full max-w-lg">
                    <input type="text" placeholder="Search for gifts..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearch} onFocus={() => setShowSuggestions(true)} />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    {showSuggestions && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in-down">
                            {suggestions.length > 0 && (
                              <div className="py-2">
                                <p className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                  Top Suggestions
                                </p>
                                {suggestions.map(product => (
                                  <div
                                    key={product.id}
                                    onClick={() => handleSuggestionClick(product.id)}
                                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                                  >
                                    <img
                                      src={product.image}
                                      alt={product.name}
                                      className="w-10 h-10 rounded-md object-cover border border-gray-200"
                                    />
                                    <div>
                                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                        {product.name}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {product.category}
                                      </p>
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 text-gray-300" />
                                  </div>
                                ))}
                              </div>
                            )}
                            {searchQuery === '' && recentSearches.length > 0 && (
                              <div className="py-2 border-t border-gray-100">
                                <div className="flex justify-between items-center px-4 py-2">
                                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Recent Searches
                                  </p>
                                  <button
                                    onClick={clearRecentSearches}
                                    className="text-[10px] text-red-500 hover:underline font-bold"
                                  >
                                    Clear
                                  </button>
                                </div>
                                {recentSearches.map((term, idx) => (
                                  <div
                                    key={idx}
                                    onClick={() => handleRecentSearchClick(term)}
                                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors text-sm text-gray-700"
                                  >
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    {term}
                                  </div>
                                ))}
                              </div>
                            )}
                            {searchQuery !== '' && (
                              <div
                                onClick={() => handleSearch({ key: 'Enter' } as React.KeyboardEvent<HTMLInputElement>)}
                                className="bg-gray-50 px-4 py-3 text-center text-sm text-primary font-bold cursor-pointer hover:bg-gray-100 border-t border-gray-100"
                              >
                                View all results for "{searchQuery}"
                              </div>
                            )}
                            {searchQuery !== '' && suggestions.length === 0 && (
                              <div className="p-4 text-center text-gray-500 text-sm">
                                No products found matching "{searchQuery}"
                              </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center space-x-4 md:space-x-8">
              <div className="hidden md:flex items-center space-x-6">
                  <Link to="/" className="text-gray-700 hover:text-primary font-medium">Home</Link>
                  <Link to="/products" className="text-gray-700 hover:text-primary font-medium">Shop</Link>
                  {user?.isAdmin && <Link to="/admin" className="text-red-600 hover:text-red-800 font-medium">Admin</Link>}
              </div>
              <div className="flex items-center space-x-3">
                <button onClick={() => setIsGiftAdvisorOpen(true)} className="text-gray-600 hover:text-accent p-1 hidden md:block" title="Gift Genie"><Gift className="h-6 w-6" /></button>
                <Link to="/wishlist" className="relative text-gray-600 hover:text-red-500 p-1 hidden md:block">
                    <Heart className="h-6 w-6" />
                    {wishlist.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center animate-bounce">{wishlist.length}</span>}
                </Link>
                <button type="button" onClick={openLoginModal} className="text-gray-600 hover:text-primary flex items-center gap-2 transition-colors">
                  {user ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs md:text-sm font-bold text-primary max-w-[80px] truncate hidden md:block">
                        {user.email.split('@')[0]}
                      </span>
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-primary font-bold">
                        {user.email.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <User className="h-6 w-6" />
                      <span className="text-sm font-medium hidden md:block">Login</span>
                    </div>
                  )}
                </button>
                <Link to="/cart" className="relative text-gray-600 hover:text-primary p-1">
                  <ShoppingCart className="h-6 w-6" />
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center animate-bounce">
                      {cart.reduce((acc, item) => acc + item.quantity, 0)}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
             <div className="fixed inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)}></div>
             <div className="relative w-3/4 max-w-xs bg-white h-full shadow-xl flex flex-col animate-slide-in-left">
                <div className="p-4 bg-primary text-white flex justify-between items-center">
                  <span className="font-bold text-lg">Menu</span>
                  <button onClick={() => setIsMenuOpen(false)} title="Close menu">
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="p-4 border-b border-gray-100 relative" ref={mobileSearchRef}>
                   <div className="relative">
                        <input type="text" placeholder="Search gifts..." className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearch} onFocus={() => setShowSuggestions(true)} />
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                    {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
                        <div className="absolute left-4 right-4 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-64 overflow-y-auto">
                           {suggestions.map(product => (
                                <div
                                  key={product.id}
                                  onClick={() => handleSuggestionClick(product.id)}
                                  className="flex items-center gap-3 px-3 py-2 border-b border-gray-50 last:border-0"
                                >
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-8 h-8 rounded object-cover"
                                  />
                                  <p className="text-sm text-gray-800 truncate">
                                    {product.name}
                                  </p>
                                </div>
                            ))}
                            {searchQuery === '' && recentSearches.map((term, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => handleRecentSearchClick(term)}
                                  className="flex items-center gap-3 px-3 py-2 border-b border-gray-50 text-sm text-gray-600"
                                >
                                  <Clock className="w-3 h-3 text-gray-400" />
                                  {term}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex-1 overflow-y-auto py-4 space-y-2">
                    <Link to="/" onClick={() => setIsMenuOpen(false)} className="block px-6 py-3 text-gray-700 hover:bg-gray-50 font-medium">Home</Link>
                    <Link to="/products" onClick={() => setIsMenuOpen(false)} className="block px-6 py-3 text-gray-700 hover:bg-gray-50 font-medium">Shop All</Link>
                    <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="block px-6 py-3 text-gray-700 hover:bg-gray-50 font-medium">My Cart ({cart.length})</Link>
                    <Link
                      to="/wishlist"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-6 py-3 text-gray-700 hover:bg-gray-50 font-medium flex items-center gap-2"
                    >
                      My Wishlist
                      {wishlist.length > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full">
                          {wishlist.length}
                        </span>
                      )}
                    </Link>
                    <button
                      onClick={() => { setIsGiftAdvisorOpen(true); setIsMenuOpen(false); }}
                      className="w-full text-left px-6 py-3 text-accent font-medium flex items-center gap-2"
                    >
                      <Gift className="w-5 h-5" />
                      Gift Genie
                    </button>
                    {user?.isAdmin && <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block px-6 py-3 text-red-600 bg-red-50 font-medium">Admin Panel</Link>}
                    <div className="border-t border-gray-100 mt-4 pt-4 px-6">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-2">Account</p>
                      <button
                        type="button"
                        onClick={openLoginModal}
                        className="w-full text-left py-2 text-primary font-bold"
                      >
                        {user ? `Logout (${user.email.split('@')[0]})` : 'Login / Register'}
                      </button>
                    </div>
                </div>
             </div>
          </div>
        )}

        {/* Login Modal */}
        {isLoginModalOpen && (
            <div className="fixed inset-0 z-[60] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
              <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsLoginModalOpen(false)}></div>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start justify-center">
                            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                <div className="flex justify-between items-center mb-4">
                                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                    {user ? 'User Profile' : (authMode === 'login' ? 'Welcome Back' : 'Create Account')}
                                  </h3>
                                  <button
                                    onClick={() => setIsLoginModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                    title="Close modal"
                                  >
                                    <X className="h-5 w-5" />
                                  </button>
                                </div>
                                {user ? (
                                  <div className="text-center py-4">
                                    <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                      <User className="h-8 w-8 text-primary" />
                                    </div>
                                    <p className="text-gray-900 font-medium text-lg">{user.email}</p>
                                    {user.isAdmin && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-2">
                                        <ShieldCheck className="w-3 h-3 mr-1" />
                                        Administrator
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <form onSubmit={handleLoginSubmit} className="mt-2">
                                    <p className="text-sm text-gray-500 mb-4">
                                      {authMode === 'login'
                                        ? "Enter your email address to sign in."
                                        : "Enter your email address to register a new account."
                                      }
                                    </p>
                                    <div>
                                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 text-left">
                                        Email Address
                                      </label>
                                      <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                          <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                          type="email"
                                          name="email"
                                          id="email"
                                          required
                                          className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border"
                                          placeholder="you@example.com"
                                          value={emailInput}
                                          onChange={(e) => setEmailInput(e.target.value)}
                                          autoFocus
                                        />
                                      </div>
                                    </div>
                                    <div className="mt-5">
                                      <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:text-sm"
                                      >
                                        {authMode === 'login' ? <LogIn className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                                        {authMode === 'login' ? 'Sign In' : 'Register'}
                                      </button>
                                    </div>
                                    
                                    <div className="relative my-4">
                                      <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300"></div>
                                      </div>
                                      <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white text-gray-500">Or continue with</span>
                                      </div>
                                    </div>
                                    
                                    <button
                                      type="button"
                                      onClick={handleGoogleLogin}
                                      className="w-full inline-flex justify-center items-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:text-sm"
                                    >
                                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                      </svg>
                                      Sign in with Google
                                    </button>
                                    
                                    <div className="mt-4 text-center">
                                      <button
                                        type="button"
                                        onClick={toggleAuthMode}
                                        className="text-sm text-primary hover:text-purple-800 font-medium hover:underline focus:outline-none"
                                      >
                                        {authMode === 'login'
                                          ? "Don't have an account? Register"
                                          : "Already have an account? Sign In"
                                        }
                                      </button>
                                    </div>
                                  </form>
                                )}
                            </div>
                        </div>
                    </div>
                    {user && (
                      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </button>
                        <button
                          type="button"
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                          onClick={() => setIsLoginModalOpen(false)}
                        >
                          Close
                        </button>
                      </div>
                    )}
                </div>
              </div>
            </div>
      )}
    </nav>
  </>
  );
}