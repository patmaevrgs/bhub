import { supabase } from './config.js';

/**
 * Upload a file to Supabase Storage
 * @param {string} bucketName - The name of the storage bucket ('uploads', 'reports', etc.)
 * @param {string} fileName - The name for the file
 * @param {Buffer} fileBuffer - The file data as a Buffer
 * @param {string} contentType - The MIME type of the file
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
export const uploadFile = async (bucketName, fileName, fileBuffer, contentType) => {
  try {
    // Create a unique file name to avoid collisions
    const uniqueFileName = `${Date.now()}-${fileName.replace(/\s+/g, '_')}`;
    
    // Upload the file to Supabase
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(uniqueFileName, fileBuffer, {
        contentType,
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }
    
    // Get public URL for the file
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(uniqueFileName);
      
    return publicUrl;
  } catch (error) {
    console.error('Error uploading file to Supabase:', error);
    throw error;
  }
};

/**
 * Delete a file from Supabase Storage
 * @param {string} bucketName - The name of the storage bucket 
 * @param {string} fileUrl - The full public URL of the file
 * @returns {Promise<boolean>} - Success status
 */
export const deleteFile = async (bucketName, fileUrl) => {
  try {
    // Extract file path from the URL
    const urlObj = new URL(fileUrl);
    const pathParts = urlObj.pathname.split('/');
    const fileName = pathParts[pathParts.length - 1];
    
    // Delete the file
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([fileName]);
      
    if (error) {
      console.error('Supabase delete error:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting file from Supabase:', error);
    // Return false but don't throw, as deletion failures shouldn't break the app
    return false;
  }
};