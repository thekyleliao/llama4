import { createClient } from './server'
import { createClient as createBrowserClient } from './client'

// Server-side upload file to Supabase storage function
export async function uploadToSupabase(file: Blob, fileName: string, bucket: string = 'reports') {
  const supabase = await createClient()
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      contentType: 'image/jpeg',
      upsert: false
    })

  if (error) throw error
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName)
  
  return { data, publicUrl }
}

// Client-side upload file to Supabase storage function
export function uploadToSupabaseClient(file: Blob, fileName: string, bucket: string = 'reports') {
  const supabase = createBrowserClient()
  
  return supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      contentType: 'image/jpeg',
      upsert: false
    })
}

// Get image from Supabase storage (returns Blob)
export async function getImageFromSupabase(fileName: string, bucket: string = 'reports') {
  const supabase = await createClient()
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(fileName)

  if (error) throw error
  
  return data // This is a Blob
}

// Get public URL (no download needed)
export function getImageUrl(fileName: string, bucket: string = 'reports') {
  const supabase = createBrowserClient()
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName)
  
  return publicUrl
}

// List all files in bucket
export async function listImages(bucket: string = 'reports') {
  const supabase = await createClient()
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .list()

  if (error) throw error
  
  return data // Array of file objects
}