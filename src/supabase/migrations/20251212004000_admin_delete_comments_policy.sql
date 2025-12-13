-- Allow admins to delete any comment
-- First, drop existing delete policy if exists
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
DROP POLICY IF EXISTS "Admins can delete any comment" ON comments;

-- Create policy for users to delete their own comments
CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create policy for admins to delete any comment
CREATE POLICY "Admins can delete any comment" ON comments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- Ensure RLS is enabled on comments table
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

