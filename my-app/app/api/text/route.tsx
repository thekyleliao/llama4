// my-app/app/api/text/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { LlamaAPIClient, Message } from 'llama-api-client';
// If your LlamaAPIClient library exports more specific types for request parameters,
// you might want to import them, e.g., ChatCompletionCreateParams.
// For now, we'll define a specific interface for clarity.

// Ensures the route is re-evaluated on every request.
export const dynamic = 'force-dynamic';

const LLAMA_API_MODEL = 'Llama-4-Maverick-17B-128E-Instruct-FP8';

// Initialize the LlamaAPIClient. (Ensure LLAMA_API_KEY is set in your environment)
const llamaapi = new LlamaAPIClient();

// --- Helper Function to Parse Llama Response Content ---
function parseLlamaResponseContent(
    content: unknown, // Can be string, or an object like { type: 'text', text: '...' }
    isJsonExpected: boolean
): any {
    let responseData = content;

    if (isJsonExpected) {
        if (typeof content === 'string') {
            try {
                responseData = JSON.parse(content);
            } catch (e) {
                console.warn('Llama Response Parser: Content was a string but not valid JSON.', content);
                // Keep as string if parsing fails
            }
        } else if (
            content &&
            typeof content === 'object' &&
            'type' in content &&
            content.type === 'text' &&
            'text' in content &&
            typeof content.text === 'string'
        ) {
            try {
                responseData = JSON.parse(content.text);
            } catch (e) {
                console.warn('Llama Response Parser: Content.text was a string but not valid JSON.', content.text);
                responseData = content.text; // Fallback to the text content
            }
        }
        // If it's already a parsed object (not a string or the specific text wrapper), it's returned as is.
    }
    return responseData;
}


// --- Default Schema for GET example ---
const defaultAddressSchema = {
    type: 'object',
    properties: {
        street: { type: 'string', description: 'The street name and number.' },
        city: { type: 'string', description: 'The city name.' },
        state: { type: 'string', description: 'The state or region.' },
        zip: { type: 'string', description: 'The postal or ZIP code.' },
    },
    required: ['street', 'city', 'state', 'zip'],
};

// --- GET Handler ---
export async function GET(request: NextRequest) {
    const defaultMessagesForGET: Message[] = [
        {
            role: 'system',
            content: 'You are a helpful assistant. Extract the address details into a JSON object matching the provided schema.',
        },
        {
            role: 'user',
            content: 'The user lives at 1600 Amphitheatre Parkway, Mountain View, CA 94043.',
        },
    ];

    try {
        const completion = await llamaapi.chat.completions.create({
            model: LLAMA_API_MODEL,
            messages: defaultMessagesForGET,
            temperature: 0.1,
            response_format: {
                type: 'json_schema',
                json_schema: {
                    name: 'AddressExtractor',
                    description: 'Extracts address components from text.',
                    schema: defaultAddressSchema,
                },
            },
        });

        const extractedAddress = parseLlamaResponseContent(
            completion.completion_message?.content,
            true // JSON is expected
        );

        return NextResponse.json({
            query: defaultMessagesForGET.find(m => m.role === 'user')?.content,
            extracted_address: extractedAddress,
            // raw_completion: process.env.NODE_ENV === 'development' ? completion : undefined, // Optionally include raw for debug
        });

    } catch (error) {
        console.error('GET /api/text Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'Failed to fetch text completion via GET.', details: errorMessage }, { status: 500 });
    }
}

// --- POST Handler ---
interface PostRequestBody {
    user_prompt: string;
    system_prompt?: string;
    json_schema_definition?: {
        name: string;
        description?: string;
        schema: Record<string, any>; // JSON Schema object
    };
    temperature?: number;
}

// Define a more specific type for the Llama API request payload
interface LlamaChatCompletionPayload {
    model: string;
    messages: Message[];
    temperature?: number;
    response_format?: {
        type: 'json_schema';
        json_schema: {
            name: string;
            description?: string;
            schema: Record<string, any>;
        };
    } | { type: 'text' }; // Supporting 'text' as a possible response format type
    // stream?: boolean; // Not implementing client response streaming in this version
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as PostRequestBody;

        const {
            user_prompt,
            system_prompt = 'You are a helpful assistant.',
            json_schema_definition,
            temperature = 0.7,
        } = body;

        if (!user_prompt) {
            return NextResponse.json({ error: 'User prompt ("user_prompt") is required.' }, { status: 400 });
        }

        const messages: Message[] = [{ role: 'system', content: system_prompt }];
        messages.push({ role: 'user', content: user_prompt });

        const requestPayload: LlamaChatCompletionPayload = {
            model: LLAMA_API_MODEL,
            messages: messages,
            temperature: temperature,
        };

        if (json_schema_definition) {
            if (!json_schema_definition.name || !json_schema_definition.schema) {
                return NextResponse.json({ error: 'JSON schema definition must include "name" and "schema".' }, { status: 400 });
            }
            requestPayload.response_format = {
                type: 'json_schema',
                json_schema: {
                    name: json_schema_definition.name,
                    ...(json_schema_definition.description && { description: json_schema_definition.description }),
                    schema: json_schema_definition.schema,
                },
            };
        }

        const completion = await llamaapi.chat.completions.create(requestPayload as any); // Using 'as any' if LlamaChatCompletionPayload isn't an exact match for SDK's expected type

        const responseContent = parseLlamaResponseContent(
            completion.completion_message?.content,
            !!json_schema_definition // Only expect JSON if a schema was provided
        );

        return NextResponse.json({
            user_prompt: user_prompt,
            response: responseContent,
            // raw_completion: process.env.NODE_ENV === 'development' ? completion : undefined, // Optionally include raw for debug
        });

    } catch (error) {
        console.error('POST /api/text Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        // Basic check for client-side input errors (already handled by status codes)
        // vs. server-side issues
        return NextResponse.json({ error: 'Failed to process text request via POST.', details: errorMessage }, { status: 500 });
    }
}