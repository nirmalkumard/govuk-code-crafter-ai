
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ExternalLink, Maximize } from 'lucide-react';
import CodePreview from './CodePreview';

interface PreviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  html: string;
  pageName: string;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ 
  isOpen, 
  onOpenChange, 
  html,
  pageName
}) => {
  const handleOpenInNewTab = () => {
    if (!html) return;
    
    // Create a new document with the HTML content
    const htmlWithGovUkCss = `
      <!DOCTYPE html>
      <html lang="en" class="govuk-template">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          
          <title>${pageName || 'GOV.UK Preview'}</title>
          
          <!-- Load GOV.UK Design System CSS from local file -->
          <link rel="stylesheet" href="/stylesheets/main.css">
          
          <!-- Additional GOV.UK Fonts -->
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=GDS+Transport:wght@400;700&display=swap" rel="stylesheet">
          
          <style>
            body {
              font-family: "GDS Transport", arial, sans-serif;
              margin: 0;
              padding: 0;
            }
            
            .govuk-header__logotype-crown {
              display: inline-block;
            }
            
            .govuk-width-container {
              max-width: 1200px;
              margin: 0 auto;
            }
          </style>
        </head>
        <body class="govuk-template__body">
          <script>document.body.className = ((document.body.className) ? document.body.className + ' js-enabled' : 'js-enabled');</script>
          ${html}
          
          <script>
            // Enable linking between pages
            document.addEventListener('DOMContentLoaded', function() {
              // Find all links and intercept clicks
              const links = document.querySelectorAll('a');
              links.forEach(function(link) {
                link.addEventListener('click', function(e) {
                  const href = link.getAttribute('href');
                  // Allow external links to work normally
                  if (href && (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:'))) {
                    return;
                  }
                  
                  // For relative links, we can dispatch a custom event that the parent window can listen for
                  e.preventDefault();
                  const linkEvent = new CustomEvent('govuk-page-link', { 
                    detail: { href: href || '/' }
                  });
                  window.parent.document.dispatchEvent(linkEvent);
                });
              });
            });
          </script>
        </body>
      </html>
    `;
    
    // Create a blob and open it in a new tab
    const blob = new Blob([htmlWithGovUkCss], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-screen-lg w-[90vw] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Preview: {pageName || 'Page'}</DialogTitle>
        </DialogHeader>
        
        <div className="flex justify-end mb-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleOpenInNewTab}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Open in Browser
          </Button>
        </div>
        
        <div className="flex-1 h-[70vh] overflow-hidden border rounded-md">
          <CodePreview html={html} className="h-full" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewModal;
