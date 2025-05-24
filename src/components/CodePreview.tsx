
import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { usePageContext } from '../contexts/PageContext';

interface CodePreviewProps {
  html: string;
  className?: string;
}

const CodePreview: React.FC<CodePreviewProps> = ({ html, className }) => {
  const { pages, selectPage } = usePageContext();
  
  // Default content to show when no code has been generated yet
  const defaultContent = `
    <h1 class="govuk-heading-xl">Welcome to the GOV.UK Code Generator</h1>
    <p class="govuk-body">This tool helps you generate HTML that follows the GOV.UK Design System patterns and principles.</p>
    <p class="govuk-body">Use the chat interface to describe what you need, and the AI will create accessible HTML code for your service.</p>
    
    <div class="govuk-inset-text">
      Start a conversation by describing what you need in the chat. For example:
      <ul class="govuk-list govuk-list--bullet">
        <li>"Create a form for collecting personal details"</li>
        <li>"Generate a confirmation page for a successful application"</li>
        <li>"Make a page with a table showing transaction history"</li>
      </ul>
    </div>
  `;

  // Set up event listener for page links
  useEffect(() => {
    const handlePageLink = (e: CustomEvent) => {
      if (!e.detail?.href) return;
      
      const path = e.detail.href;
      // Remove leading slashes and file extension
      const pageName = path.replace(/^\//, '').replace(/\.html$/, '');
      
      // Try to find a page with matching name (case-insensitive)
      const matchingPage = pages.find(page => 
        page.name.toLowerCase() === pageName.toLowerCase()
      );
      
      if (matchingPage) {
        selectPage(matchingPage.id);
      }
    };
    
    // TypeScript needs a type assertion here since CustomEvent is the expected type
    document.addEventListener('govuk-page-link', handlePageLink as EventListener);
    
    return () => {
      document.removeEventListener('govuk-page-link', handlePageLink as EventListener);
    };
  }, [pages, selectPage]);

  // Use the provided base template
  const htmlWithBaseTemplate = `
    <!DOCTYPE html>
    <html lang="en" class="govuk-template">

    <head>
      <meta charset="utf-8">
      <title>GOV.UK - The best place to find government services and information</title>
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
      <meta name="theme-color" content="#0b0c0c">
      <link rel="icon" sizes="48x48" href="/assets/images/favicon.ico">
      <link rel="icon" sizes="any" href="/assets/images/favicon.svg" type="image/svg+xml">
      <link rel="mask-icon" href="/assets/images/govuk-icon-mask.svg" color="#0b0c0c">
      <link rel="apple-touch-icon" href="/assets/images/govuk-icon-180.png">
      <link rel="manifest" href="/assets/manifest.json">
      <link rel="stylesheet" href="/stylesheets/main.css">
    </head>

    <body class="govuk-template__body">
      <script>
        document.body.className += ' js-enabled' + ('noModule' in HTMLScriptElement.prototype ? ' govuk-frontend-supported' : '');
      </script>
      <a href="#main-content" class="govuk-skip-link" data-module="govuk-skip-link">Skip to main content</a>
      <header class="govuk-header" data-module="govuk-header">
        <div class="govuk-header__container govuk-width-container">
          <div class="govuk-header__logo">
            <a href="/" class="govuk-header__link govuk-header__link--homepage">
              <svg
                focusable="false"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 296 60"
                height="30"
                width="148"
                fill="currentcolor" class="govuk-header__logotype" aria-label="GOV.UK">
                <title>GOV.UK</title>
                <g>
                  <circle cx="20" cy="17.6" r="3.7" />
                  <circle cx="10.2" cy="23.5" r="3.7" />
                  <circle cx="3.7" cy="33.2" r="3.7" />
                  <circle cx="31.7" cy="30.6" r="3.7" />
                  <circle cx="43.3" cy="17.6" r="3.7" />
                  <circle cx="53.2" cy="23.5" r="3.7" />
                  <circle cx="59.7" cy="33.2" r="3.7" />
                  <circle cx="31.7" cy="30.6" r="3.7" />
                  <path d="M33.1,9.8c.2-.1.3-.3.5-.5l4.6,2.4v-6.8l-4.6,1.5c-.1-.2-.3-.3-.5-.5l1.9-5.9h-6.7l1.9,5.9c-.2.1-.3.3-.5.5l-4.6-1.5v6.8l4.6-2.4c.1.2.3.3.5.5l-2.6,8c-.9,2.8,1.2,5.7,4.1,5.7h0c3,0,5.1-2.9,4.1-5.7l-2.6-8ZM37,37.9s-3.4,3.8-4.1,6.1c2.2,0,4.2-.5,6.4-2.8l-.7,8.5c-2-2.8-4.4-4.1-5.7-3.8.1,3.1.5,6.7,5.8,7.2,3.7.3,6.7-1.5,7-3.8.4-2.6-2-4.3-3.7-1.6-1.4-4.5,2.4-6.1,4.9-3.2-1.9-4.5-1.8-7.7,2.4-10.9,3,4,2.6,7.3-1.2,11.1,2.4-1.3,6.2,0,4,4.6-1.2-2.8-3.7-2.2-4.2.2-.3,1.7.7,3.7,3,4.2,1.9.3,4.7-.9,7-5.9-1.3,0-2.4.7-3.9,1.7l2.4-8c.6,2.3,1.4,3.7,2.2,4.5.6-1.6.5-2.8,0-5.3l5,1.8c-2.6,3.6-5.2,8.7-7.3,17.5-7.4-1.1-15.7-1.7-24.5-1.7h0c-8.8,0-17.1.6-24.5,1.7-2.1-8.9-4.7-13.9-7.3-17.5l5-1.8c-.5,2.5-.6,3.7,0,5.3.8-.8,1.6-2.3,2.2-4.5l2.4,8c-1.5-1-2.6-1.7-3.9-1.7,2.3,5,5.2,6.2,7,5.9,2.3-.4,3.3-2.4,3-4.2-.5-2.4-3-3.1-4.2-.2-2.2-4.6,1.6-6,4-4.6-3.7-3.7-4.2-7.1-1.2-11.1,4.2,3.2,4.3,6.4,2.4,10.9,2.5-2.8,6.3-1.3,4.9,3.2-1.8-2.7-4.1-1-3.7,1.6.3,2.3,3.3,4.1,7,3.8,5.4-.5,5.7-4.2,5.8-7.2-1.3-.2-3.7,1-5.7,3.8l-.7-8.5c2.2,2.3,4.2,2.7,6.4,2.8-.7-2.3-4.1-6.1-4.1-6.1h10.6,0Z" />
                </g>
                <path d="M88.6,33.2c0,1.8.2,3.4.6,5s1.2,3,2,4.4c1,1.2,2,2.2,3.4,3s3,1.2,5,1.2,3.4-.2,4.6-.8,2.2-1.4,3-2.2,1.2-1.8,1.6-3c.2-1,.4-2,.4-3v-.4h-10.6v-6.4h18.8v23h-7.4v-5c-.6.8-1.2,1.6-2,2.2-.8.6-1.6,1.2-2.6,1.8-1,.4-2,.8-3.2,1.2s-2.4.4-3.6.4c-3,0-5.8-.6-8-1.6-2.4-1.2-4.4-2.6-6-4.6s-2.8-4.2-3.6-6.8c-.6-2.8-1-5.6-1-8.6s.4-5.8,1.4-8.4,2.2-4.8,4-6.8,3.8-3.4,6.2-4.6c2.4-1.2,5.2-1.6,8.2-1.6s3.8.2,5.6.6c1.8.4,3.4,1.2,4.8,2s2.8,1.8,3.8,3c1.2,1.2,2,2.6,2.8,4l-7.4,4.2c-.4-.8-1-1.8-1.6-2.4-.6-.8-1.2-1.4-2-2s-1.6-1-2.6-1.4-2.2-.4-3.4-.4c-2,0-3.6.4-5,1.2-1.4.8-2.6,1.8-3.4,3-1,1.2-1.6,2.8-2,4.4-.6,1.6-.8,3.8-.8,5.4ZM161.4,24.6c-.8-2.6-2.2-4.8-4-6.8s-3.8-3.4-6.2-4.6c-2.4-1.2-5.2-1.6-8.4-1.6s-5.8.6-8.4,1.6c-2.2,1.2-4.4,2.8-6,4.6-1.8,2-3,4.2-4,6.8-.8,2.6-1.4,5.4-1.4,8.4s.4,5.8,1.4,8.4c.8,2.6,2.2,4.8,4,6.8s3.8,3.4,6.2,4.6c2.4,1.2,5.2,1.6,8.4,1.6s5.8-.6,8.4-1.6c2.4-1.2,4.6-2.6,6.2-4.6,1.8-2,3-4.2,4-6.8.8-2.6,1.4-5.4,1.4-8.4-.2-3-.6-5.8-1.6-8.4h0ZM154,33.2c0,2-.2,3.8-.8,5.4-.4,1.6-1.2,3.2-2.2,4.4s-2.2,2.2-3.4,2.8c-1.4.6-3,1-4.8,1s-3.4-.4-4.8-1-2.6-1.6-3.4-2.8c-1-1.2-1.6-2.6-2.2-4.4-.4-1.6-.8-3.4-.8-5.4v-.2c0-2,.2-3.8.8-5.4.4-1.6,1.2-3.2,2.2-4.4,1-1.2,2.2-2.2,3.4-2.8,1.4-.6,3-1,4.8-1s3.4.4,4.8,1,2.6,1.6,3.4,2.8c1,1.2,1.6,2.6,2.2,4.4.4,1.6.8,3.4.8,5.4v.2ZM177.8,54l-11.8-42h9.4l8,31.4h.2l8-31.4h9.4l-11.8,42h-11.4,0ZM235.4,46.7c1.2,0,2.4-.2,3.4-.6,1-.4,2-.8,2.8-1.6s1.4-1.6,1.8-2.8c.4-1.2.6-2.4.6-4V11.8h8.2v27.2c0,2.4-.4,4.4-1.2,6.2s-2,3.4-3.6,4.8c-1.4,1.4-3.2,2.4-5.4,3-2,.8-4.4,1-6.8,1s-4.8-.4-6.8-1c-2-.8-3.8-1.8-5.4-3-1.6-1.4-2.6-3-3.6-4.8-.8-1.8-1.2-4-1.2-6.2V11.7h8.4v26c0,1.6.2,2.8.6,4,.4,1.2,1,2,1.8,2.8s1.6,1.2,2.8,1.6c1.2.4,2.2.6,3.6.6h0ZM261.4,11.9h8.4v18.2l14.8-18.2h10.4l-14.4,16.8,15.4,25.2h-9.8l-11-18.8-5.4,6v12.8h-8.4V11.9h0ZM206.2,44.2c-3,0-5.4,2.4-5.4,5.4s2.4,5.4,5.4,5.4,5.4-2.4,5.4-5.4-2.4-5.4-5.4-5.4Z" />
              </svg>
            </a>
          </div>
        </div>
      </header>
      <div class="govuk-width-container">
        <main class="govuk-main-wrapper" id="main-content">
          ${html || defaultContent}
        </main>
      </div>
      <footer class="govuk-footer">
        <div class="govuk-width-container">
          <div class="govuk-footer__meta">
            <div class="govuk-footer__meta-item govuk-footer__meta-item--grow">
              <svg
                aria-hidden="true"
                focusable="false"
                class="govuk-footer__licence-logo"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 483.2 195.7"
                height="17"
                width="41">
                <path
                  fill="currentColor"
                  d="M421.5 142.8V.1l-50.7 32.3v161.1h112.4v-50.7zm-122.3-9.6A47.12 47.12 0 0 1 221 97.8c0-26 21.1-47.1 47.1-47.1 16.7 0 31.4 8.7 39.7 21.8l42.7-27.2A97.63 97.63 0 0 0 268.1 0c-36.5 0-68.3 20.1-85.1 49.7A98 98 0 0 0 97.8 0C43.9 0 0 43.9 0 97.8s43.9 97.8 97.8 97.8c36.5 0 68.3-20.1 85.1-49.7a97.76 97.76 0 0 0 149.6 25.4l19.4 22.2h3v-87.8h-80l24.3 27.5zM97.8 145c-26 0-47.1-21.1-47.1-47.1s21.1-47.1 47.1-47.1 47.2 21 47.2 47S123.8 145 97.8 145" />
              </svg>
              <span class="govuk-footer__licence-description">
                All content is available under the
                <a
                  class="govuk-footer__link"
                  href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
                  rel="license">Open Government Licence v3.0</a>, except where otherwise stated
              </span>
            </div>
            <div class="govuk-footer__meta-item">
              <a
                class="govuk-footer__link govuk-footer__copyright-logo"
                href="https://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/uk-government-licensing-framework/crown-copyright/">
                © Crown copyright
              </a>
            </div>
          </div>
        </div>
      </footer>
      <script type="module" src="/javascripts/govuk-frontend.min.js"></script>
      <script type="module">
        import { initAll } from '/javascripts/govuk-frontend.min.js'
        initAll()
      </script>
      
      <script>
        // Enable page linking functionality
        document.addEventListener('DOMContentLoaded', function() {
          const links = document.querySelectorAll('a');
          links.forEach(function(link) {
            link.addEventListener('click', function(e) {
              const href = link.getAttribute('href');
              // Allow external links to work normally
              if (href && (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:'))) {
                return;
              }
              
              // For relative links, we can dispatch a custom event
              e.preventDefault();
              
              // Create and dispatch event for parent window to handle
              const linkEvent = new CustomEvent('govuk-page-link', { 
                detail: { href: href || '/' },
                bubbles: true 
              });
              document.dispatchEvent(linkEvent);
            });
          });
        });
      </script>
    </body>

    </html>
  `;

  return (
    <div className={cn("border border-govuk-mid-grey rounded h-full flex flex-col", className)}>
      <div className="px-4 py-2 bg-govuk-light-grey border-b border-govuk-mid-grey">
        <span className="text-sm font-medium">Preview</span>
      </div>
      <div className="p-0 bg-white flex-1">
        <iframe
          title="Generated HTML Preview"
          srcDoc={htmlWithBaseTemplate}
          className="w-full h-full border-0"
          sandbox="allow-same-origin allow-scripts"
        ></iframe>
      </div>
    </div>
  );
};

export default CodePreview;
