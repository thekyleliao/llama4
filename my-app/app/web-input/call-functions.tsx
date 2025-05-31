// Text API output interface
export interface TextAPIResponse {
  user_prompt: string;
  response: any;
}

// Vision API output interface
export interface VisionAPIResponse {
  completion_message?: {
    content: string;
  };
}

// API error interface
export interface APIError {
  error: string;
  details?: string;
}

// Text API Call Function
export async function callTextAPI(
  userPrompt: string,
  systemPrompt?: string,
  jsonSchema?: {
    name: string;
    description?: string;
    schema: Record<string, any>;
  },
): Promise<TextAPIResponse> {
  const response = await fetch('/api/text', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_prompt: userPrompt,
      system_prompt: systemPrompt || 'You are a helpful assistant.',
      json_schema_definition: jsonSchema,
    }),
  });

  if (!response.ok) {
    const error: APIError = await response.json();
    throw new Error(error.details || error.error || 'Failed to call text API');
  }

  return response.json();
}

// Vision API Call Function
export async function callVisionAPI(
  imageFile: File,
  prompt: string
): Promise<VisionAPIResponse> {
  const formData = new FormData();
  formData.append('imageFile', imageFile);
  formData.append('prompt', prompt);

  const response = await fetch('/api/vision', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error: APIError = await response.json();
    throw new Error(error.details || error.error || 'Failed to call vision API');
  }

  return response.json();
}

// Helper function to capture video frame as File
export function captureVideoFrame(videoElement: HTMLVideoElement): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    context.drawImage(videoElement, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
        resolve(file);
      }
    }, 'image/jpeg');
  });
}