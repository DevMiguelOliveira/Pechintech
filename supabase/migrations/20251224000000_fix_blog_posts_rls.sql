-- Fix RLS policies for blog_posts to ensure public read access works correctly
-- The issue is that "Admins can manage blog posts" uses FOR ALL which can conflict with SELECT

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can manage blog posts" ON blog_posts;

-- Recreate SELECT policy for public read access (most permissive, should be first)
CREATE POLICY "Anyone can read published blog posts"
  ON blog_posts
  FOR SELECT
  TO anon, authenticated
  USING (published = TRUE);

-- Separate policies for admin operations (INSERT, UPDATE, DELETE)
CREATE POLICY "Admins can insert blog posts"
  ON blog_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update blog posts"
  ON blog_posts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete blog posts"
  ON blog_posts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Add image_url column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN image_url TEXT;
  END IF;
END $$;

