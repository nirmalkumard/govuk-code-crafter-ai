
import React, { useRef } from 'react';
import { toast } from 'sonner';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'html',
  className
}) => {
  const codeRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (codeRef.current) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Code copied to clipboard');
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  return (
    <div className={cn("relative rounded border border-govuk-mid-grey", className)}>
      <div className="flex items-center justify-between px-4 py-2 bg-govuk-light-grey border-b border-govuk-mid-grey">
        <span className="text-sm font-medium">{language.toUpperCase()}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 gap-1 text-govuk-dark hover:text-govuk-blue"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <pre
        ref={codeRef}
        className="p-4 overflow-x-auto bg-white text-govuk-dark text-sm"
      >
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
