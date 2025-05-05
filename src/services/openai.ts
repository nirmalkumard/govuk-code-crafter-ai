
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

// Default GOV.UK header HTML template
const govUkHeaderTemplate = `
<!-- GOV.UK Header -->
<header class="govuk-header" role="banner" data-module="govuk-header">
  <div class="govuk-header__container govuk-width-container">
    <div class="govuk-header__logo">
      <a href="/" class="govuk-header__link govuk-header__link--homepage">
        <span class="govuk-header__logotype">
          <svg role="presentation" focusable="false" class="govuk-header__logotype-crown" xmlns="http://www.w3.org/2000/svg" viewbox="0 0 132 97" height="30" width="36">
            <path fill="currentColor" fill-rule="evenodd" d="M25 30.2c3.5 1.5 7.7-.2 9.1-3.7 1.5-3.6-.2-7.8-3.9-9.2-3.6-1.4-7.6.3-9.1 3.9-1.4 3.5.3 7.5 3.9 9zM9 39.5c3.6 1.5 7.8-.2 9.2-3.7 1.5-3.6-.2-7.8-3.9-9.1-3.6-1.5-7.6.2-9.1 3.8-1.4 3.5.3 7.5 3.8 9zM4.4 57.2c3.5 1.5 7.7-.2 9.1-3.8 1.5-3.6-.2-7.7-3.9-9.1-3.5-1.5-7.6.3-9.1 3.8-1.4 3.5.3 7.6 3.9 9.1zm38.3-21.4c3.5 1.5 7.7-.2 9.1-3.8 1.5-3.6-.2-7.7-3.9-9.1-3.6-1.5-7.6.3-9.1 3.8-1.3 3.6.4 7.7 3.9 9.1zm64.4-5.6c-3.6 1.5-7.8-.2-9.1-3.7-1.5-3.6.2-7.8 3.8-9.2 3.6-1.4 7.7.3 9.2 3.9 1.3 3.5-.4 7.5-3.9 9zm15.9 9.3c-3.6 1.5-7.7-.2-9.1-3.7-1.5-3.6.2-7.8 3.7-9.1 3.6-1.5 7.7.2 9.2 3.8 1.5 3.5-.3 7.5-3.8 9zm4.7 17.7c-3.6 1.5-7.8-.2-9.2-3.8-1.5-3.6.2-7.7 3.9-9.1 3.6-1.5 7.7.3 9.2 3.8 1.3 3.5-.4 7.6-3.9 9.1zM89.3 35.8c-3.6 1.5-7.8-.2-9.2-3.8-1.4-3.6.2-7.7 3.9-9.1 3.6-1.5 7.7.3 9.2 3.8 1.4 3.6-.3 7.7-3.9 9.1zM69.7 17.7l8.9 4.7V9.3l-8.9 2.8c-.2-.3-.5-.6-.9-.9L72.4 0H59.6l3.5 11.2c-.3.3-.6.5-.9.9l-8.8-2.8v13.1l8.8-4.7c.3.3.6.7.9.9l-5 15.4v.1c-.2.8-.4 1.6-.4 2.4 0 4.1 3.1 7.5 7 8.1h.2c.3 0 .7.1 1 .1.4 0 .7 0 1-.1h.2c4-.6 7.1-4.1 7.1-8.1 0-.8-.1-1.7-.4-2.4V34l-5.1-15.4c.4-.2.7-.6 1-.9zM66 92.8c16.9 0 32.8 1.1 47.1 3.2 4-16.9 8.9-26.7 14-33.5l-9.6-3.4c1 4.9 1.1 7.2 0 10.2-1.5-1.4-3-4.3-4.2-8.7L108.6 76c2.8-2 5-3.2 7.5-3.3-4.4 9.4-10 11.9-13.6 11.2-4.3-.8-6.3-4.6-5.6-7.9 1-4.7 5.7-5.9 8-.5 4.3-8.7-3-11.4-7.6-8.8 7.1-7.2 7.9-13.5 2.1-21.1-8 6.1-8.1 12.3-4.5 20.8-4.7-5.4-12.1-2.5-9.5 6.2 3.4-5.2 7.9-2 7.2 3.1-.6 4.3-6.4 7.8-13.5 7.2-10.3-.9-10.9-8-11.2-13.8 2.5-.5 7.1 1.8 11 7.3L80.2 60c-4.1 4.4-8 5.3-12.3 5.4 1.4-4.4 8-11.6 8-11.6H55.5s6.4 7.2 7.9 11.6c-4.2-.1-8-1-12.3-5.4l1.4 16.4c3.9-5.5 8.5-7.7 10.9-7.3-.3 5.8-.9 12.8-11.1 13.8-7.2.6-12.9-2.9-13.5-7.2-.7-5 3.8-8.3 7.1-3.1 2.7-8.7-4.6-11.6-9.4-6.2 3.7-8.5 3.6-14.7-4.6-20.8-5.8 7.6-5 13.9 2.2 21.1-4.7-2.6-11.9.1-7.7 8.8 2.3-5.5 7.1-4.2 8.1.5.7 3.3-1.3 7.1-5.7 7.9-3.5.7-9-1.8-13.5-11.2 2.5.1 4.7 1.3 7.5 3.3l-4.7-15.4c-1.2 4.4-2.7 7.2-4.3 8.7-1.1-3-.9-5.3 0-10.2l-9.5 3.4c5 6.9 9.9 16.7 14 33.5 14.8-2.1 30.8-3.2 47.7-3.2z"></path>
          </svg>
          <span class="govuk-header__logotype-text">
            GOV.UK
          </span>
        </span>
      </a>
    </div>
    <div class="govuk-header__content">
      <a href="/" class="govuk-header__link govuk-header__link--service-name">
        Service name
      </a>
    </div>
  </div>
</header>
`;

// Default GOV.UK footer HTML template
const govUkFooterTemplate = `
<!-- GOV.UK Footer -->
<footer class="govuk-footer" role="contentinfo">
  <div class="govuk-width-container">
    <div class="govuk-footer__meta">
      <div class="govuk-footer__meta-item govuk-footer__meta-item--grow">
        <h2 class="govuk-visually-hidden">Support links</h2>
        <ul class="govuk-footer__inline-list">
          <li class="govuk-footer__inline-list-item">
            <a class="govuk-footer__link" href="#">
              Help
            </a>
          </li>
          <li class="govuk-footer__inline-list-item">
            <a class="govuk-footer__link" href="#">
              Cookies
            </a>
          </li>
          <li class="govuk-footer__inline-list-item">
            <a class="govuk-footer__link" href="#">
              Contact
            </a>
          </li>
          <li class="govuk-footer__inline-list-item">
            <a class="govuk-footer__link" href="#">
              Terms and conditions
            </a>
          </li>
        </ul>
        <svg aria-hidden="true" focusable="false" class="govuk-footer__licence-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 483.2 195.7" height="17" width="41">
          <path fill="currentColor" d="M421.5 142.8V.1l-50.7 32.3v161.1h112.4v-50.7zm-122.3-9.6A47.12 47.12 0 0 1 221 97.8c0-26 21.1-47.1 47.1-47.1 16.7 0 31.4 8.7 39.7 21.8l42.7-27.2A97.63 97.63 0 0 0 268.1 0c-36.5 0-68.3 20.1-85.1 49.7A98 98 0 0 0 97.8 0C43.9 0 0 43.9 0 97.8s43.9 97.8 97.8 97.8c36.5 0 68.3-20.1 85.1-49.7a97.76 97.76 0 0 0 149.6 25.4l19.4 22.2h3v-87.8h-80l24.3 27.5zM97.8 145c-26 0-47.1-21.1-47.1-47.1s21.1-47.1 47.1-47.1 47.2 21 47.2 47S123.8 145 97.8 145" />
        </svg>
        <span class="govuk-footer__licence-description">
          All content is available under the
          <a class="govuk-footer__link" href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" rel="license">Open Government Licence v3.0</a>, except where otherwise stated
        </span>
      </div>
      <div class="govuk-footer__meta-item">
        <a class="govuk-footer__link govuk-footer__copyright-logo" href="https://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/uk-government-licensing-framework/crown-copyright/">© Crown copyright</a>
      </div>
    </div>
  </div>
</footer>
`;

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

  // Enhanced system prompt that emphasizes CSS classes and components
  const systemPrompt = `You are a helpful assistant specialized in generating HTML code following the GOV.UK Design System principles.
  
  IMPORTANT INSTRUCTIONS:
  1. Generate only HTML code without explanations, comments, or markdown formatting.
  2. The HTML MUST use proper GOV.UK Design System CSS classes for all elements.
  3. Ensure all components include the proper CSS classes (govuk-button, govuk-heading-xl, etc.).
  4. Use semantic HTML with appropriate ARIA attributes for accessibility.
  5. Include proper grid layouts using govuk-grid-row and govuk-grid-column classes.
  6. All form elements must use govuk-form-group, govuk-label, and other appropriate form classes.
  7. Use govuk-width-container for proper page width constraints.
  8. Always wrap main content in govuk-main-wrapper with proper ID and ARIA role.
  9. Create responsive layouts following the GOV.UK grid system.
  
  Your HTML should be complete, accessible, and strictly adhere to GOV.UK Design System patterns.`;

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
              content: systemPrompt
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

      // Add GOV.UK header and footer if not already present
      if (!generatedCode.includes('govuk-header')) {
        generatedCode = govUkHeaderTemplate + '\n\n' + generatedCode;
      }
      
      if (!generatedCode.includes('govuk-footer')) {
        generatedCode = generatedCode + '\n\n' + govUkFooterTemplate;
      }
      
      // Ensure body content is wrapped in main wrapper if not already
      if (!generatedCode.includes('govuk-main-wrapper')) {
        // Find where to insert the main wrapper
        // This is a simple check - we look for a container after the header but before the footer
        const headerEndIndex = generatedCode.indexOf('</header>') + 9;
        const footerStartIndex = generatedCode.indexOf('<footer');
        
        if (headerEndIndex > 0 && footerStartIndex > headerEndIndex) {
          const beforeMainContent = generatedCode.substring(0, headerEndIndex);
          const mainContent = generatedCode.substring(headerEndIndex, footerStartIndex);
          const afterMainContent = generatedCode.substring(footerStartIndex);
          
          generatedCode = `${beforeMainContent}
          <div class="govuk-width-container">
            <main class="govuk-main-wrapper" id="main-content" role="main">
              ${mainContent}
            </main>
          </div>
          ${afterMainContent}`;
        }
      }
      
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
