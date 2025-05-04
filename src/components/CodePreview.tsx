
import React from 'react';
import { cn } from '@/lib/utils';

interface CodePreviewProps {
  html: string;
  className?: string;
}

const CodePreview: React.FC<CodePreviewProps> = ({ html, className }) => {
  return (
    <div className={cn("border border-govuk-mid-grey rounded", className)}>
      <div className="px-4 py-2 bg-govuk-light-grey border-b border-govuk-mid-grey">
        <span className="text-sm font-medium">Preview</span>
      </div>
      <div className="p-4 bg-white">
        <iframe
          title="Generated HTML Preview"
          srcDoc={html}
          className="w-full min-h-[300px] border-0"
          sandbox="allow-same-origin"
        ></iframe>
      </div>
    </div>
  );
};

export default CodePreview;
