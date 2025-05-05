
import React from 'react';
import { cn } from '@/lib/utils';

interface CodePreviewProps {
  html: string;
  className?: string;
}

const CodePreview: React.FC<CodePreviewProps> = ({ html, className }) => {
  // Add the GOV.UK Design System CSS to the preview HTML
  const htmlWithGovUkCss = `
    <!DOCTYPE html>
    <html lang="en" class="govuk-template">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="https://design-system.service.gov.uk/stylesheets/main-8ac4d8a2fc1f22a06df330c13b616776.css">
        <title>GOV.UK Preview</title>
      </head>
      <body class="govuk-template__body">
        ${html}
      </body>
    </html>
  `;

  return (
    <div className={cn("border border-govuk-mid-grey rounded", className)}>
      <div className="px-4 py-2 bg-govuk-light-grey border-b border-govuk-mid-grey">
        <span className="text-sm font-medium">Preview</span>
      </div>
      <div className="p-4 bg-white">
        <iframe
          title="Generated HTML Preview"
          srcDoc={htmlWithGovUkCss}
          className="w-full min-h-[300px] border-0"
          sandbox="allow-same-origin"
        ></iframe>
      </div>
    </div>
  );
};

export default CodePreview;
