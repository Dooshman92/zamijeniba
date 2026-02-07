/*
  # Setup Advertisement Images Storage

  1. Storage
    - Create `advertisement-images` bucket for storing advertisement banners
    - Public read access for everyone
    - Only admins can upload/delete images
    - Max file size: 5MB
    - Allowed types: images only (jpg, jpeg, png, gif, webp)

  2. Security
    - Public bucket for reading advertisement images
    - Admin-only write access
    - Size limit enforced (5MB)
*/

-- Create storage bucket for advertisement images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'advertisement-images',
  'advertisement-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to advertisement images
CREATE POLICY "Public can view advertisement images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'advertisement-images');

-- Only admins can upload advertisement images
CREATE POLICY "Admins can upload advertisement images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'advertisement-images' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Only admins can update advertisement images
CREATE POLICY "Admins can update advertisement images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'advertisement-images' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Only admins can delete advertisement images
CREATE POLICY "Admins can delete advertisement images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'advertisement-images' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );