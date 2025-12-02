import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { calculatePrice } from '../data/products';
import { useCart } from '../context';
import { VariationOption } from '../types';
import { Camera, Type, Wand2, Plus, Minus, ShoppingCart, Zap, Loader2, CheckCircle, RefreshCcw, Sparkles, Share2, Heart, ArrowLeft, Facebook, Twitter, MessageCircle } from 'lucide-react';
import { generateSwapPreview } from '../services/gemini';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, currency, wishlist, toggleWishlist, products, loading } = useCart();
  
  const product = products.find(p => p.id === id || p.code === id);
  const [customName, setCustomName] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [extraHeads, setExtraHeads] = useState(0);
  
  const [isFaceSwapRequested, setIsFaceSwapRequested] = useState(false);
  const [aiPreviewUrl, setAiPreviewUrl] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [selectedVariations, setSelectedVariations] = useState<Record<string, VariationOption>>({});
  const [displayImage, setDisplayImage] = useState<string>('');

  useEffect(() => {
    if (product) {
        if (product.variations) {
            const defaults: Record<string, VariationOption> = {};
            product.variations.forEach(v => {
                if (v.options.length > 0) {
                    defaults[v.id] = v.options[0];
                }
            });
            setSelectedVariations(defaults);
        }
        setDisplayImage(product.image);
    }
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) return <div className="p-10 text-center text-gray-500">Product not found</div>;

  const prices = calculatePrice(product, extraHeads, selectedVariations);
  const isInWishlist = wishlist.some(p => p.id === product.id);
  const formatPrice = (price: number) => { return currency === 'INR' ? `₹${price.toLocaleString('en-IN')}` : `$${(price * 0.012).toFixed(2)}`; };
  const shareUrl = window.location.href;
  const shareText = `Check out ${product.name} on Yathes Sign Galaxy!`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: product.name, text: shareText, url: shareUrl }); } catch (err) { console.log('Error sharing', err); }
    } else { navigator.clipboard.writeText(shareUrl); alert("Link copied to clipboard!"); }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { const reader = new FileReader(); reader.onloadend = () => { setUploadedImage(reader.result as string); setAiPreviewUrl(null); }; reader.readAsDataURL(file); }
  };

  const handleVariationChange = (variationId: string, option: VariationOption) => {
      setSelectedVariations(prev => ({ ...prev, [variationId]: option }));
      if (option.image) { setDisplayImage(option.image); } else { setDisplayImage(product.image); }
  };

  const handleGeneratePreview = async () => {
      if (!uploadedImage || !product) return;
      setIsGeneratingPreview(true); setPreviewError(false);
      const preview = await generateSwapPreview(displayImage, uploadedImage);
      if (preview) { setAiPreviewUrl(preview); } else { setPreviewError(true); }
      setIsGeneratingPreview(false);
  };

  const handleAddToCart = (redirect: boolean) => {
    addToCart({ ...product, cartId: Date.now().toString(), customName, customImage: uploadedImage, calculatedPrice: prices.final, originalPrice: prices.original, quantity: 1, extraHeads, selectedVariations });
    if (redirect) { navigate(`/cart${redirect ? '?buyNow=true' : ''}`); } else { alert("Item added to your cart!"); }
  };

  const handleWishlistToggle = () => {
      toggleWishlist(product);
      const isAdded = !isInWishlist;
      alert(isAdded ? "Added to Wishlist ❤️" : "Removed from Wishlist 💔");
  };

  return (
    <div className="bg-white min-h-screen pb-24 md:pb-12">
        <div className="md:hidden fixed top-0 left-0 right-0 bg-white z-40 px-4 h-14 flex items-center justify-between border-b shadow-sm">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600" title="Go Back"><ArrowLeft className="w-6 h-6" /></button>
            <span className="font-bold text-gray-800 truncate max-w-[200px]">{product.name}</span>
            <div className="flex gap-2">
                <button onClick={handleNativeShare} className="p-2 text-gray-600" title="Share Product"><Share2 className="w-5 h-5" /></button>
                <button onClick={() => navigate('/cart')} className="p-2 text-gray-600" title="Go to Cart"><ShoppingCart className="w-5 h-5" /></button>
            </div>
        </div>
      <div className="max-w-7xl mx-auto pt-16 md:pt-8 px-0 md:px-4 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
            <div className="bg-gray-50 md:rounded-2xl overflow-hidden border-b md:border-0 border-gray-200">
                <div className="aspect-square relative flex items-center justify-center p-4">
                    <img src={aiPreviewUrl || (uploadedImage && !isFaceSwapRequested ? uploadedImage : displayImage)} alt={product.name} className={`max-w-full max-h-full object-contain transition-all duration-500 ${isGeneratingPreview ? 'scale-105 blur-sm opacity-50' : 'scale-100 opacity-100'}`} />
                    <button
                        onClick={handleWishlistToggle}
                        className={`absolute top-4 right-4 p-2 rounded-full shadow-md transition-colors z-10 ${isInWishlist ? 'bg-red-50 text-red-500' : 'bg-white text-gray-400 hover:text-red-500'}`}
                        title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                        <Heart className={`w-6 h-6 ${isInWishlist ? 'fill-current' : ''}`} />
                    </button>
                    {isGeneratingPreview && (<div className="absolute inset-0 flex items-center justify-center z-20"><div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-purple-100"><Loader2 className="w-5 h-5 animate-spin text-primary" /><span className="text-sm font-bold text-gray-800">Magic at work...</span></div></div>)}
                    {aiPreviewUrl && (<div className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold z-10"><Wand2 className="w-3 h-3" /> AI Preview</div>)}
                    {aiPreviewUrl && (<button onClick={() => setAiPreviewUrl(null)} className="absolute bottom-4 right-4 bg-white/90 text-gray-700 px-3 py-1.5 rounded-full shadow-md z-10 text-xs font-bold flex items-center gap-1 border"><RefreshCcw className="w-3 h-3" /> Reset</button>)}
                    {isFaceSwapRequested && uploadedImage && (<div className="absolute bottom-4 left-4 w-16 h-16 bg-white p-1 rounded-lg shadow-lg border border-purple-100 z-10"><img src={uploadedImage} alt="Face" className="w-full h-full object-cover rounded" /></div>)}
                </div>
            </div>
            <div className="p-4 md:p-0 md:mt-0">
                <div className="border-b border-gray-100 pb-4 mb-4">
                    <div className="flex justify-between items-start">
                        <div><p className="text-xs text-gray-500 uppercase tracking-wider font-bold">{product.category}</p><h1 className="text-xl md:text-3xl font-bold text-gray-900 mt-1 leading-tight">{product.name}</h1></div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-3">
                        <p className="text-3xl font-bold text-gray-900">{formatPrice(prices.final)}</p><p className="text-sm text-gray-500 line-through">{formatPrice(prices.original)}</p><span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded">{product.discount || 35}% OFF</span>
                    </div>
                    <div className="flex items-center gap-3 mt-4">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Share:</span>
                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"><Facebook className="w-4 h-4" /></a>
                        <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-sky-50 text-sky-500 rounded-full hover:bg-sky-100 transition-colors"><Twitter className="w-4 h-4" /></a>
                        <a href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors"><MessageCircle className="w-4 h-4" /></a>
                    </div>
                </div>
                <div className="space-y-6">
                    {product.variations?.map((v) => (<div key={v.id}><h3 className="text-sm font-medium text-gray-900 mb-2">{v.name}</h3><div className="flex flex-wrap gap-2">{v.options.map((opt) => (<button key={opt.id} onClick={() => handleVariationChange(v.id, opt)} className={`px-3 py-2 text-sm rounded-md border transition-all flex items-center gap-2 ${selectedVariations[v.id]?.id === opt.id ? 'border-primary bg-purple-50 text-primary ring-1 ring-primary' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>{opt.image && <img src={opt.image} className="w-6 h-6 rounded object-cover" alt="" />}<div className="flex flex-col items-start leading-none"><span className="font-medium">{opt.label}</span>{opt.description && <span className="text-[10px] text-gray-400 mt-0.5">{opt.description}</span>}</div></button>))}</div></div>))}
                    {product.allowsExtraHeads && (<div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex justify-between items-center"><label className="text-sm font-medium text-blue-900">Extra Persons <span className="text-xs text-blue-600 block">(+₹100/head)</span></label><div className="flex items-center gap-3 bg-white rounded-md border border-blue-200 px-2 py-1"><button onClick={() => setExtraHeads(Math.max(0, extraHeads - 1))} disabled={extraHeads === 0} className="text-gray-500 disabled:opacity-30"><Minus className="w-4 h-4" /></button><span className="font-bold w-4 text-center">{extraHeads}</span><button onClick={() => setExtraHeads(extraHeads + 1)} className="text-blue-600"><Plus className="w-4 h-4" /></button></div></div>)}
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Custom Text</label><div className="relative"><Type className="absolute left-3 top-3 h-5 w-5 text-gray-400" /><input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Happy Birthday!" className="pl-10 w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary py-2.5 border" /></div></div>
                    <div className={`rounded-xl border transition-all p-4 ${isFaceSwapRequested ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-200'}`}><label className="flex items-center gap-3 cursor-pointer mb-4"><div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isFaceSwapRequested ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}><input type="checkbox" checked={isFaceSwapRequested} onChange={(e) => setIsFaceSwapRequested(e.target.checked)} className="hidden" />{isFaceSwapRequested && <CheckCircle className="w-3.5 h-3.5 text-white" />}</div><span className="font-bold text-sm flex items-center gap-1"><Sparkles className="w-4 h-4 text-accent" /> AI Face Swap</span></label>{(isFaceSwapRequested || !isFaceSwapRequested) && (<div className="space-y-3"><label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 border-gray-300"><div className="flex flex-col items-center pt-2 pb-3">{uploadedImage ? <p className="text-xs font-semibold text-green-600">Image Selected ✓</p> : <Camera className="w-6 h-6 text-gray-400" />}<p className="text-xs text-gray-500">{uploadedImage ? 'Tap to change' : 'Upload Photo'}</p></div><input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} /></label>{isFaceSwapRequested && (<button onClick={handleGeneratePreview} disabled={!uploadedImage || isGeneratingPreview} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold py-2.5 rounded-lg shadow-sm disabled:opacity-50 flex items-center justify-center gap-2">{isGeneratingPreview ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />} Generate Preview</button>)}</div>)}</div>
                    <div className="pt-4 text-sm text-gray-500 leading-relaxed border-t border-gray-100"><h4 className="font-bold text-gray-900 mb-1">Description</h4>{product.description}</div>
                </div>
            </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-50 md:hidden safe-area-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]"><div className="flex gap-3"><button onClick={() => handleAddToCart(false)} className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-lg text-sm">Add to Cart</button><button onClick={() => handleAddToCart(true)} className="flex-1 bg-yellow-500 text-white font-bold py-3 rounded-lg text-sm shadow-sm">Buy Now</button></div></div>
      {/* Explicit Add to Wishlist button (Desktop) */}
      <div className="hidden md:flex flex-col gap-3 mt-8 max-w-7xl mx-auto px-8 pb-12">
            <div className="flex gap-4">
                <button onClick={() => handleAddToCart(false)} className="flex-1 bg-white border-2 border-primary text-primary py-4 rounded-xl font-bold hover:bg-purple-50 transition-colors">Add to Cart</button>
                <button onClick={() => handleAddToCart(true)} className="flex-1 bg-primary text-white py-4 rounded-xl font-bold hover:bg-purple-800 shadow-lg transition-all">Buy Now - {formatPrice(prices.final)}</button>
            </div>
            
      </div>
    </div>
  );
};