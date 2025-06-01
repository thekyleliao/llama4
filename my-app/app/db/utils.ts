import { createClient as createBrowserClient } from './client'

// Client-side upload file to Supabase storage function
export async function uploadToSupabaseClient(file: Blob, fileName: string, bucket: string = 'reports') {
  const supabase = createBrowserClient()
  
  const contentType = file.type || 'image/jpeg'

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      contentType: contentType,
      upsert: false
    })

  if (error) {
    return { data: null, error }
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName)

  return { data, publicUrl, error: null }
}