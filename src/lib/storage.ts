import { supabase } from './supabase';

const BUCKET_NAME = 'car-images';

export async function initializeStorage() {
  return { success: true };
}

export async function uploadCarImage(file: File, userId: string): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { data: uploadData, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image:', error);
      alert(`Greška pri upload-u slike: ${error.message}`);
      return null;
    }

    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (error) {
    console.error('Unexpected error uploading image:', error);
    return null;
  }
}

export async function uploadMultipleCarImages(files: File[], userId: string): Promise<string[]> {
  const urls: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}_${i}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    try {
      const { data: uploadData, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading image:', error);
        continue;
      }

      const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      if (data.publicUrl) {
        urls.push(data.publicUrl);
      }
    } catch (error) {
      console.error('Unexpected error uploading image:', error);
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return urls;
}

export async function deleteCarImage(imageUrl: string) {
  const urlParts = imageUrl.split(`${BUCKET_NAME}/`);
  if (urlParts.length < 2) return;

  const filePath = urlParts[1];

  await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);
}

export async function getCarImageUrl(imagePath: string): Promise<string> {
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(imagePath);

  return data.publicUrl;
}
