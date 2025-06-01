// my-app/app/api/vision/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { LlamaAPIClient } from 'llama-api-client';
import { Message } from 'llama-api-client/resources/chat';
import { getFilesFromSupabase } from '@/app/db/utils';

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
    role: 'system',
    content: 'Format the response according to the provided JSON format',
  },
  {
    role: 'user',
    content: [
      {
        type: 'text',
        text: 'These three images show homework assignments marked by a teacher. The errors are marked in red by the teacher. Find recurring themes in errors and suggest concrete follow up questions. Write two reports for the parent, one in Spanish and one in English. Sign as your teacher Mr John Doe. In reports refer to images as homework assigments.',
      },
      {
        type: 'image_url',
        image_url: {
          url: 'https://raw.githubusercontent.com/thekyleliao/llama4/refs/heads/main/my-app/public/page1.jpg'
        },
      },
      {
        type: 'image_url',
        image_url: {
          url: 'https://raw.githubusercontent.com/thekyleliao/llama4/refs/heads/main/my-app/public/page2.jpg'
        },
      },
      {
        type: 'image_url',
        image_url: {
          url: 'https://raw.githubusercontent.com/thekyleliao/llama4/refs/heads/main/my-app/public/page3.jpg'
        },
      },
    ],
  },
];

export async function GET(request: NextRequest) {
  try {
    const messages = defaultMessagesForGET;
    const completion = await llamaapi.chat.completions.create({
      model: LLAMA_API_MODEL,
      messages: messages,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'HomeworkAnalysis',
          schema: {
            type: 'object',
            properties: {
              report_in_spanish: {
                type: 'string',
                description: 'report for parents in Spanish',
              },
              report_in_english: {
                type: 'string',
                description: 'report for teacher in English'
              },
              follow_up_questions: {
                type: 'string',
                description: 'follow up questions for student to improve their understanding'
              }
            },
            required: ['report_in_spanish', 'report_in_english', 'follow_up_questions']
          }
        }
      }
    });

    const content = completion?.completion_message?.content;

    if (content && typeof content === 'object' && 'text' in content && typeof content.text === 'string') {
      // --- MODIFICATION START ---
      // Trust the LLM's output string (content.text) to be the exact JSON response body.
      // Send this string directly with the application/json content type.
      // This avoids parsing the string into a JavaScript object and then re-serializing it.
      return new Response(content.text, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      // --- MODIFICATION END ---
    } else {
      console.error('Unexpected Llama API response structure:', completion);
      return NextResponse.json({
        error: 'Unexpected response structure from Llama API when expecting JSON string.',
        details: 'The completion_message.content.text field was not found or was not a string as expected.'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('GET /api/vision Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to fetch vision completion via GET.', details: errorMessage }, { status: 500 });
  }
}

// --- POST Handler ---
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      language,
      grade,
      teacher_name,
      parent_name,
      child_name,
      document_type,
      document_purpose
    } = body;

    // Get files from Supabase
    const files = await getFilesFromSupabase();
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files found in Supabase storage.' }, { status: 404 });
    }

    // Construct the prompt with form data
    const prompt = `These images show ${document_type} assignments marked by a teacher. 
    The errors are marked in red by the teacher. 
    Find recurring themes in errors and suggest concrete follow up questions in ${language}. 
    Write two reports for the parent, one in ${language} and one in English. 
    Sign as your teacher ${teacher_name}. 
    In reports refer to images as ${document_type} assignments.
    
    Additional Information:
    | Grade: ${grade}
    | Teacher Name: ${teacher_name}
    | Parent Name: ${parent_name}
    | Child Name: ${child_name}
    | Document Type: ${document_type}
    | Document Purpose: ${document_purpose}`;

    // Create messages array with system and user messages
    const messages: Message[] = [
      {
        role: 'system',
        content: 'Format the response according to the provided JSON format',
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt,
          },
          // Add image URLs from Supabase files
          ...files.map((file: { name: string }) => ({
            type: 'image_url' as const,
            image_url: {
              url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/reports/${file.name}`
            }
          }))
        ],
      },
    ];

    const completion = await llamaapi.chat.completions.create({
      model: LLAMA_API_MODEL,
      messages: messages,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'HomeworkAnalysis',
          schema: {
            type: 'object',
            properties: {
              report_in_english: {
                type: 'string',
                description: 'report for teacher in English'
              },
              report_in_spanish: {
                type: 'string',
                description: `report for parents in ${language}`
              },
              follow_up_questions: {
                type: 'string',
                description: `follow up questions in ${language} for student to improve their understanding`
              },
              metadata: {
                type: 'object',
                properties: {
                  grade: { type: 'string' },
                  teacher_name: { type: 'string' },
                  parent_name: { type: 'string' },
                  child_name: { type: 'string' },
                  document_type: { type: 'string' },
                  document_purpose: { type: 'string' }
                },
                required: ['grade', 'teacher_name', 'parent_name', 'child_name', 'document_type', 'document_purpose']
              }
            },
            required: ['report_in_english', 'report_in_spanish', 'follow_up_questions', 'metadata']
          }
        }
      }
    });

    const content = completion?.completion_message?.content;

    if (content && typeof content === 'object' && 'text' in content && typeof content.text === 'string') {
      return new Response(content.text, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      console.error('Unexpected Llama API response structure:', completion);
      return NextResponse.json({
        error: 'Unexpected response structure from Llama API when expecting JSON string.',
        details: 'The completion_message.content.text field was not found or was not a string as expected.'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('POST /api/vision Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to process vision request via POST.', details: errorMessage }, { status: 500 });
  }
}