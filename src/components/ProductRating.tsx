import React, { useState, useEffect } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useCart } from '../context';

interface ProductRatingProps {
  productId: string;
  showSubmit?: boolean;
}

interface RatingData {
  averageRating: number;
  totalRatings: number;
  userRating: number | null;
}

export const ProductRating: React.FC<ProductRatingProps> = ({ productId, showSubmit = true }) => {
  const { user } = useCart();
  const [ratingData, setRatingData] = useState<RatingData>({ averageRating: 0, totalRatings: 0, userRating: null });
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRatings();
  }, [productId, user?.id]);

  const fetchRatings = async () => {
    setLoading(true);
    
    // Fetch all ratings for this product
    const { data: ratings, error } = await supabase
      .from('product_ratings')
      .select('rating, user_id')
      .eq('product_id', productId);

    if (error) {
      console.error('Error fetching ratings:', error);
      setLoading(false);
      return;
    }

    if (ratings && ratings.length > 0) {
      const total = ratings.reduce((sum, r) => sum + r.rating, 0);
      const average = total / ratings.length;
      const userRating = user?.id ? ratings.find(r => r.user_id === user.id)?.rating || null : null;
      
      setRatingData({
        averageRating: Math.round(average * 10) / 10,
        totalRatings: ratings.length,
        userRating
      });
    } else {
      setRatingData({ averageRating: 0, totalRatings: 0, userRating: null });
    }
    
    setLoading(false);
  };

  const submitRating = async (rating: number) => {
    if (!user?.id) {
      alert('Please login to rate this product');
      return;
    }

    setIsSubmitting(true);

    // Upsert rating (insert or update if exists)
    const { error } = await supabase
      .from('product_ratings')
      .upsert({
        user_id: user.id,
        product_id: productId,
        rating,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,product_id'
      });

    if (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating');
    } else {
      // Update product's average rating
      await updateProductRating();
      await fetchRatings();
    }

    setIsSubmitting(false);
  };

  const updateProductRating = async () => {
    // Calculate new average and update product
    const { data: ratings } = await supabase
      .from('product_ratings')
      .select('rating')
      .eq('product_id', productId);

    if (ratings && ratings.length > 0) {
      const average = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
      
      await supabase
        .from('products')
        .update({ rating: Math.round(average * 10) / 10 })
        .eq('id', productId);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClass = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
    
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = interactive 
            ? star <= (hoverRating || ratingData.userRating || 0)
            : star <= rating;
          
          return (
            <button
              key={star}
              type="button"
              disabled={!interactive || isSubmitting}
              onMouseEnter={() => interactive && setHoverRating(star)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              onClick={() => interactive && submitRating(star)}
              className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} disabled:cursor-not-allowed`}
            >
              <Star
                className={`${sizeClass} ${filled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} transition-colors`}
              />
            </button>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        <span className="text-sm text-gray-400">Loading ratings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Average Rating Display */}
      <div className="flex items-center gap-2">
        {renderStars(ratingData.averageRating)}
        <span className="text-sm font-medium text-gray-700">
          {ratingData.averageRating > 0 ? ratingData.averageRating.toFixed(1) : 'No ratings'}
        </span>
        <span className="text-xs text-gray-500">
          ({ratingData.totalRatings} {ratingData.totalRatings === 1 ? 'review' : 'reviews'})
        </span>
      </div>

      {/* User Rating Input */}
      {showSubmit && user && (
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600 mb-2">
            {ratingData.userRating ? 'Your rating (click to change):' : 'Rate this product:'}
          </p>
          <div className="flex items-center gap-2">
            {renderStars(0, true, 'lg')}
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
          </div>
        </div>
      )}

      {/* Login prompt */}
      {showSubmit && !user && (
        <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          Please login to rate this product
        </p>
      )}
    </div>
  );
};
