
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
