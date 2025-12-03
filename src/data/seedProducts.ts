import { supabase } from '../integrations/supabase/client';

// Sample products to seed
export const sampleProducts = [
  {
    name: 'Viswa 3D Crystal Portrait',
    code: '10011',
    sku: 'CRY-1031',
    description: 'High-quality 3D laser engraved crystal. Additional image price ₹180 per image. Perfect for gifting on special occasions.',
    base_price: 700,
    gst_price: 760,
    category: '3D & 2D Crystal',
    images: ['https://images.unsplash.com/photo-1518770660439-4636190af475?w=400'],
    shape: 'Rectangle',
    size: '60x60x60',
    allows_extra_heads: true,
    custom_shape_cost: 0,
    stock: 50,
    status: 'Active',
    is_personalized: true,
    rating: 4.5
  },
  {
    name: 'Heart Shape Crystal',
    code: '10012',
    sku: 'CRY-1032',
    description: 'Beautiful heart-shaped crystal with 3D engraving. Perfect for anniversaries and love celebrations.',
    base_price: 850,
    gst_price: 920,
    category: '3D & 2D Crystal',
    images: ['https://images.unsplash.com/photo-1518770660439-4636190af475?w=400'],
    shape: 'Heart',
    size: '80x80x30',
    allows_extra_heads: true,
    custom_shape_cost: 200,
    stock: 30,
    status: 'Active',
    is_personalized: true,
    rating: 4.8
  },
  {
    name: 'Wooden Photo Frame',
    code: '10013',
    sku: 'WD-2001',
    description: 'Premium wooden photo frame with customizable engraving. Natural finish with elegant design.',
    base_price: 450,
    gst_price: 490,
    category: 'Wood Frames',
    images: ['https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=400'],
    shape: 'Rectangle',
    size: '8x10 inch',
    allows_extra_heads: false,
    custom_shape_cost: 0,
    stock: 100,
    status: 'Active',
    is_personalized: true,
    rating: 4.2
  },
  {
    name: 'LED Photo Lamp',
    code: '10014',
    sku: 'LED-3001',
    description: 'Custom LED lamp with your photo. Perfect night light with warm glow. USB powered.',
    base_price: 599,
    gst_price: 650,
    category: 'LED Products',
    images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'],
    shape: 'Round',
    size: '15cm diameter',
    allows_extra_heads: true,
    custom_shape_cost: 0,
    stock: 75,
    status: 'Active',
    is_personalized: true,
    rating: 4.6
  },
  {
    name: 'Acrylic Photo Stand',
    code: '10015',
    sku: 'ACR-4001',
    description: 'Modern acrylic photo stand with UV printing. Crystal clear finish for stunning display.',
    base_price: 350,
    gst_price: 380,
    category: 'Acrylic Products',
    images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'],
    shape: 'Square',
    size: '6x6 inch',
    allows_extra_heads: false,
    custom_shape_cost: 0,
    stock: 120,
    status: 'Active',
    is_personalized: true,
    rating: 4.0
  },
  {
    name: 'Corporate Crystal Award',
    code: '10016',
    sku: 'CRY-5001',
    description: 'Premium crystal award for corporate recognition. Custom 3D engraving with company logo.',
    base_price: 1200,
    gst_price: 1300,
    category: 'Corporate Gifts',
    images: ['https://images.unsplash.com/photo-1518770660439-4636190af475?w=400'],
    shape: 'Custom',
    size: '100x80x40',
    allows_extra_heads: false,
    custom_shape_cost: 500,
    stock: 25,
    status: 'Active',
    is_personalized: true,
    rating: 4.9
  }
];

export const seedProducts = async () => {
  // First check if products already exist
  const { data: existing, error: checkError } = await supabase
    .from('products')
    .select('id')
    .limit(1);

  if (checkError) {
    console.error('Error checking products:', checkError);
    return { success: false, error: checkError.message };
  }

  if (existing && existing.length > 0) {
    return { success: true, message: 'Products already seeded' };
  }

  // Insert sample products
  const { data, error } = await supabase
    .from('products')
    .insert(sampleProducts)
    .select();

  if (error) {
    console.error('Error seeding products:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data, message: `Seeded ${data?.length || 0} products` };
};

// Function to seed categories
export const seedCategories = async () => {
  const categories = [
    { name: '3D & 2D Crystal', description: 'High-quality laser engraved crystal products' },
    { name: 'Wood Frames', description: 'Premium wooden photo frames and engravings' },
    { name: 'LED Products', description: 'Custom LED lamps and light products' },
    { name: 'Acrylic Products', description: 'Modern acrylic photo stands and displays' },
    { name: 'Corporate Gifts', description: 'Professional awards and corporate recognition items' },
  ];

  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .limit(1);

  if (existing && existing.length > 0) {
    return { success: true, message: 'Categories already seeded' };
  }

  const { error } = await supabase.from('categories').insert(categories);
  
  if (error) {
    console.error('Error seeding categories:', error);
    return { success: false, error: error.message };
  }

  return { success: true, message: 'Categories seeded' };
};
