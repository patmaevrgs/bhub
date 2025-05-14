// supabaseUpload.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export const uploadFile = async (bucketName, filePath, fileBuffer, contentType) => {
  const fileName = filePath.split('/').pop();
  
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, fileBuffer, {
      contentType,
      cacheControl: '3600',
      upsert: true
    });
    
  if (error) throw error;
  
  // Get public URL
  const { publicURL } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName);
    
  return publicURL;
};