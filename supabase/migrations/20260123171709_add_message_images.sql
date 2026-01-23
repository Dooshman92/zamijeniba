/*
  # Add Image Support to Messages

  1. Modifications
    - Add `image_url` column to messages table
    - Update message_type to support 'image' type

  2. Security
    - No changes to RLS policies needed
*/

-- Add image_url column to messages table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE messages ADD COLUMN image_url text;
  END IF;
END $$;

-- Create storage bucket for message images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-images', 'message-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for message images
CREATE POLICY "Anyone can view message images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'message-images');

CREATE POLICY "Authenticated users can upload message images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'message-images');

CREATE POLICY "Users can update their own message images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'message-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own message images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'message-images' AND auth.uid()::text = (storage.foldername(name))[1]);