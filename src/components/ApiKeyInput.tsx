
import React, { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ApiKeyInputProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  onSave: () => void;
  className?: string;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ 
  apiKey, 
  setApiKey, 
  onSave,
  className 
}) => {
  // Pre-fill with the provided API key
  useEffect(() => {
    if (!apiKey) {
      setApiKey('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');
    }
  }, [apiKey, setApiKey]);

  return (
    <div className={cn("p-6 bg-govuk-light-grey border-l-4 border-govuk-blue rounded", className)}>
      <h2 className="govuk-heading-m">OpenAI API Key Required</h2>
      <p className="govuk-body">
        To generate code, please enter your OpenAI API key. This key will be stored locally in your browser and is not sent to our servers.
      </p>
      <div className="mt-4">
        <Label htmlFor="apiKey" className="govuk-label">OpenAI API Key</Label>
        <p className="govuk-hint">Your key starts with 'sk-'</p>
        <div className="flex gap-3">
          <Input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="govuk-input flex-1"
          />
          <Button onClick={onSave} className="govuk-button">
            Save Key
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyInput;
