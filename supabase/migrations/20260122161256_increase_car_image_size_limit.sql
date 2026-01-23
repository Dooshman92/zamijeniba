/*
  # Increase Car Images File Size Limit

  1. Changes
    - Update car-images bucket file size limit from 5MB to 10MB
  
  2. Important Notes
    - New limit: 10MB (10485760 bytes)
    - Allows users to upload higher quality car photos
*/

-- Update the file size limit for car-images bucket to 10MB
UPDATE storage.buckets
SET file_size_limit = 10485760
WHERE id = 'car-images';