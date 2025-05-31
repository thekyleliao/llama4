// my-app/app/api/vision/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { LlamaAPIClient } from 'llama-api-client';
import { Message } from 'llama-api-client/resources/chat';

// Ensures the route is re-evaluated on every request.
export const dynamic = 'force-dynamic';

const LLAMA_API_MODEL = 'Llama-4-Maverick-17B-128E-Instruct-FP8'; // Define model centrally

// Initialize the LlamaAPIClient.
const llamaapi = new LlamaAPIClient();

// --- Helper Function ---
async function fileToDataUrl(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString('base64');
  const mimeType = file.type || 'image/jpeg'; // Default to jpeg if type is not provided
  return `data:${mimeType};base64,${base64}`;
}

// --- GET Handler ---
const defaultMessagesForGET: Message[] = [
  {
    role: 'user',
    content: [
      { type: 'text', text: 'Describe this image.' },
      {
        type: 'image_url',
        image_url: { url: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png' },
      },
    ],
  },
];

export async function GET(request: NextRequest) {
  try {
    const messages = defaultMessagesForGET; // Using predefined messages for GET
    const completion = await llamaapi.chat.completions.create({
      model: LLAMA_API_MODEL,
      messages: messages,
    });
    return NextResponse.json(completion);
  } catch (error) {
    console.error('GET /api/vision Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to fetch vision completion via GET.', details: errorMessage }, { status: 500 });
  }
}

// --- POST Handler ---
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('imageFile') as File | null;
    const prompt = formData.get('prompt') as string | null;

    // Validate inputs
    if (!imageFile) {
      return NextResponse.json({ error: 'Image file ("imageFile") is required in form data.' }, { status: 400 });
    }
    if (!prompt) {
      return NextResponse.json({ error: 'Text prompt ("prompt") is required in form data.' }, { status: 400 });
    }

    // Process image and construct messages
    const imageDataUrl = await fileToDataUrl(imageFile);
    const messages: Message[] = [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageDataUrl } },
        ],
      },
    ];

    // Call LlamaAPI
    const completion = await llamaapi.chat.completions.create({
      model: LLAMA_API_MODEL,
      messages: messages,
    });

    return NextResponse.json(completion);
  } catch (error) {
    console.error('POST /api/vision Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    // Differentiate between client-side input errors (already handled) and server-side issues
    return NextResponse.json({ error: 'Failed to process vision request via POST.', details: errorMessage }, { status: 500 });
  }
}