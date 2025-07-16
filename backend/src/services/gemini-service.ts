import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables');
}

interface GeminiCandidate {
  content: {
    parts: { text: string }[];
  };
}

interface GeminiResponse {
  candidates: GeminiCandidate[];
}

export async function generateSpendingProfileWithGemini(prompt: string): Promise<string> {
  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    // Type assertion to GeminiResponse
    const data = response.data as GeminiResponse;
    if (data.candidates && data.candidates.length > 0) {
      return data.candidates[0].content.parts[0].text;
    }
    return 'No response from Gemini.';
  } catch (error: any) {
    console.error('Gemini API error:', error?.response?.data || error.message);
    return 'Error generating profile.';
  }
} 