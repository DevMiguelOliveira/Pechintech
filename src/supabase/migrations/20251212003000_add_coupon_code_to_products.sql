-- Add coupon_code column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS coupon_code TEXT DEFAULT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN products.coupon_code IS 'Optional discount coupon code for the product';

