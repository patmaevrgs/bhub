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
    console.log(`Starting upload to bucket: ${bucketName}, file: ${fileName}, contentType: ${contentType}`);
    console.log(`Supabase client initialized: ${!!supabase}`);
    
    // Check if supabase client is properly initialized
    if (!supabase || !supabase.storage) {
      console.error('Supabase client not properly initialized');
      throw new Error('Supabase client not properly initialized. Check your environment variables.');
    }

    // Ensure the bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    console.log('Available buckets:', buckets);
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      throw bucketsError;
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    if (!bucketExists) {
      console.log(`Bucket ${bucketName} doesn't exist, creating it...`);
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true
      });
      
      if (createError) {
        console.error(`Error creating bucket ${bucketName}:`, createError);
        throw createError;
      }
    }

    // Create a unique file name to avoid collisions
    const uniqueFileName = `${Date.now()}-${fileName.replace(/\s+/g, '_')}`;
    console.log(`Uploading with unique filename: ${uniqueFileName}`);
    
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
    
    console.log('Upload successful, data:', data);
    
    // Get public URL for the file
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(uniqueFileName);
      
    console.log('Generated public URL:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Error uploading file to Supabase:', error);
    console.error('Error details:', error.message);
    if (error.stack) console.error('Stack trace:', error.stack);
    
    // Check if it's an authentication error
    if (error.message && error.message.includes('auth')) {
      throw new Error('Authentication error with Supabase. Check your API keys.');
    }
    
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
    console.log(`Attempting to delete file from bucket: ${bucketName}, URL: ${fileUrl}`);
    
    // Check if supabase client is properly initialized
    if (!supabase || !supabase.storage) {
      console.error('Supabase client not properly initialized');
      throw new Error('Supabase client not properly initialized. Check your environment variables.');
    }
    
    // Extract file path from the URL
    const urlObj = new URL(fileUrl);
    const pathParts = urlObj.pathname.split('/');
    // The file name is typically the last part of the path
    // For Supabase URLs, we need to extract the actual filename from the path
    // Format is typically: /storage/v1/object/public/bucket-name/filename
    // We need just the filename part
    
    let fileName;
    // Look for the bucket name in the path and get everything after it
    const bucketIndex = pathParts.indexOf(bucketName);
    if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
      fileName = pathParts.slice(bucketIndex + 1).join('/');
    } else {
      // Fallback to just using the last part if bucket name not found
      fileName = pathParts[pathParts.length - 1];
    }
    
    console.log(`Extracted filename for deletion: ${fileName}`);
    
    // Delete the file
    const { data, error } = await supabase.storage
      .from(bucketName)
      .remove([fileName]);
      
    if (error) {
      console.error('Supabase delete error:', error);
      throw error;
    }
    
    console.log('File successfully deleted');
    return true;
  } catch (error) {
    console.error('Error deleting file from Supabase:', error);
    console.error('Error details:', error.message);
    // Return false but don't throw, as deletion failures shouldn't break the app
    return false;
  }
};