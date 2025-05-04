
import { toast } from 'sonner';

// Define the interface for the OpenAI API response
interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
  error?: {
    message: string;
  };
}

export const generateCodeWithOpenAI = async (
  apiKey: string,
  prompt: string
): Promise<string> => {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant specialized in generating HTML code following the GOV.UK Design System principles. Generate only the HTML code without explanations, comments, or markdown formatting. The HTML should be valid, accessible, and follow best practices for the GOV.UK Design System.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate code');
    }

    const data: OpenAIResponse = await response.json();
    
    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error('No generated content received from OpenAI');
    }

    // Clean the response to ensure it's just the HTML code
    let generatedCode = data.choices[0].message.content;
    
    // Remove any markdown code block formatting if present
    generatedCode = generatedCode.replace(/```html/g, '').replace(/```/g, '').trim();
    
    return generatedCode;
  } catch (error) {
    console.error('Error generating code:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to generate code');
    throw error;
  }
};
