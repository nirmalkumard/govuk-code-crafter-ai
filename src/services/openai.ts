
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

// List of models by preference order - will try each one in sequence if previous one fails
const OPENAI_MODELS = [
  'gpt-4o-mini',  // Fallback to mini version first
  'gpt-3.5-turbo', // Further fallback
  'gpt-4-turbo',  // Try turbo if available
  'gpt-4o'        // Try original if available
];

export const generateCodeWithOpenAI = async (
  apiKey: string,
  prompt: string,
  modelOverride?: string
): Promise<string> => {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  // Use provided model or first from the list
  let modelToUse = modelOverride || OPENAI_MODELS[0];
  let attempts = 0;
  let lastError: Error | null = null;

  // Try with different models if first one fails
  while (attempts < (modelOverride ? 1 : OPENAI_MODELS.length)) {
    if (!modelOverride) {
      modelToUse = OPENAI_MODELS[attempts];
    }
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelToUse,
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

      const responseData = await response.json();
      
      if (!response.ok) {
        // Check if the error is about model access
        if (responseData.error?.message?.includes('does not have access to model') ||
            responseData.error?.message?.includes('model is currently overloaded')) {
          lastError = new Error(responseData.error?.message);
          attempts++;
          continue; // Try the next model
        }
        throw new Error(responseData.error?.message || 'Failed to generate code');
      }

      const data: OpenAIResponse = responseData;
      
      if (!data.choices || !data.choices[0]?.message?.content) {
        throw new Error('No generated content received from OpenAI');
      }

      // Clean the response to ensure it's just the HTML code
      let generatedCode = data.choices[0].message.content;
      
      // Remove any markdown code block formatting if present
      generatedCode = generatedCode.replace(/```html/g, '').replace(/```/g, '').trim();
      
      toast.success(`Generated using ${modelToUse} model`);
      return generatedCode;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      if (!modelOverride) {
        attempts++;
      } else {
        break;
      }
    }
  }

  // All attempts failed
  console.error('Error generating code:', lastError);
  toast.error(lastError?.message || 'Failed to generate code with all available models');
  throw lastError || new Error('Failed to generate code with all available models');
};
