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

// Client-side download file from Supabase storage function
export async function getFilesFromSupabase(bucket: string = 'reports') {
  const supabase = createBrowserClient()
  
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list('', {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' }
      })

    if (error) {
      console.error('Error fetching files:', error)
      return []
    }

    // Filter out non-image files and hidden files
    const validFiles = (data || []).filter(file => {
      // Skip hidden files and empty folder placeholders
      if (file.name.startsWith('.') || file.name.includes('emptyFolderPlaceholder')) {
        return false
      }

      // Check if file is an image by extension
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
      const hasImageExtension = imageExtensions.some(ext => 
        file.name.toLowerCase().endsWith(ext)
      )

      return hasImageExtension
    })

    return validFiles
  } catch (error) {
    console.error('Unexpected error fetching files:', error)
    return []
  }
}

// Get the Monday of the week for a given date
export function getMondayOfWeek(date: Date): Date {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(date.setDate(diff));
}

// Format date for display
export function formatWeekTitle(mondayDate: Date): string {
  const options: Intl.DateTimeFormatOptions = { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  };
  return `Week of ${mondayDate.toLocaleDateString('en-US', options)}`;
}