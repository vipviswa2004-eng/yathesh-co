import { Product, Shape, VariationOption } from '../types';

// Helper to determine shape cost
export const getShapeCost = (shape: Shape | string) => {
  const normalizedShape = typeof shape === 'string' ? shape.toUpperCase() : shape;
  if (['RECTANGLE', 'SQUARE', 'ROUND', 'Rectangle', 'Square', 'Round'].includes(normalizedShape)) {
    return 400;
  }
  return 1000;
};

export const calculatePrice = (
  product: Product, 
  extraHeads: number = 0,
  selectedVariations: Record<string, VariationOption> = {}
) => {
  let shapeCost = 0;
  const shapeStr = typeof product.shape === 'string' ? product.shape.toUpperCase() : product.shape;
  
  if (shapeStr === 'CUSTOM' || shapeStr === 'Custom') {
      shapeCost = product.customShapeCost || product.custom_shape_cost || 0;
  } else {
      shapeCost = getShapeCost(product.shape);
  }
  
  const basePrice = product.pdfPrice || product.base_price || 0;
  const variationCost = Object.values(selectedVariations).reduce((acc, option) => acc + (option?.priceAdjustment || 0), 0);
  const adjustedBasePrice = basePrice + variationCost;
  const baseTotal = adjustedBasePrice + shapeCost;
  const doubledPrice = baseTotal * 2;
  const discountPercent = product.discount !== undefined ? product.discount : 35;
  const discountFactor = (100 - discountPercent) / 100;
  const discountPrice = doubledPrice * discountFactor;
  const headCost = extraHeads * 100;
  const finalPrice = Math.round(discountPrice + headCost);

  return {
    original: Math.round(doubledPrice),
    final: finalPrice,
    breakdown: {
      base: basePrice,
      shape: shapeCost,
      variations: variationCost,
      heads: headCost
    }
  };
};

// Empty array - products now come from Supabase
export const products: Product[] = [];
