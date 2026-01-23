/*
  # Setup Car Images Storage Bucket

  1. Storage Bucket
    - `car-images` - For car listing photos

  2. Security Policies
    - Public read access for all car images
    - Authenticated users can upload images to their own folders
    - Users can delete their own car images

  3. Important Notes
    - Bucket is created with public access for easy image serving
    - File size limit: 5MB
    - Allowed formats: JPEG, PNG, WebP, GIF
*/

-- Create car-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'car-images',
  'car-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing car-images policies if they exist
DROP POLICY IF EXISTS "Anyone can view car images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload car images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own car images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own car images" ON storage.objects;

-- Storage policies for car-images bucket
CREATE POLICY "Anyone can view car images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'car-images');

CREATE POLICY "Authenticated users can upload car images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'car-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own car images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'car-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own car images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'car-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );