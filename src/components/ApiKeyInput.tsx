
import React, { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface ApiKeyInputProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  onSave: () => void;
  className?: string;
  isInSettings?: boolean;
  apiProvider?: string;
  setApiProvider?: (provider: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ 
  apiKey, 
  setApiKey, 
  onSave,
  className,
  isInSettings = false,
  apiProvider = 'openai',
  setApiProvider
}) => {
  // Pre-fill with default API keys
  useEffect(() => {
    if (!apiKey) {
      if (apiProvider === 'openai') {
        setApiKey('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');
      } else if (apiProvider === 'anthropic') {
        setApiKey('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');
      }
    }
  }, [apiKey, setApiKey, apiProvider]);

  if (isInSettings) {
    return (
      <div className={cn("space-y-4", className)}>
        {setApiProvider && (
          <div className="space-y-2">
            <Label htmlFor="apiProviderSettings" className="text-base font-medium">AI Provider</Label>
            <Select value={apiProvider} onValueChange={setApiProvider}>
              <SelectTrigger id="apiProviderSettings">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="apiKeySettings" className="text-base font-medium">
            {apiProvider === 'openai' ? 'OpenAI API Key' : 'Anthropic API Key'}
          </Label>
          <p className="govuk-hint text-sm">
            {apiProvider === 'openai' 
              ? 'Your OpenAI key starts with \'sk-\'' 
              : 'Your Anthropic key starts with \'sk-ant-\''}
          </p>
        </div>
        <div className="flex gap-3">
          <Input
            id="apiKeySettings"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={apiProvider === 'openai' ? "sk-..." : "sk-ant-..."}
            className="flex-1"
          />
          <Button onClick={onSave} variant="secondary">
            Update Key
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("p-6 bg-govuk-light-grey border-l-4 border-govuk-blue rounded", className)}>
      <h2 className="govuk-heading-m">AI API Key Required</h2>
      <p className="govuk-body">
        To generate code, please enter your API key. This key will be stored locally in your browser and is not sent to our servers.
      </p>
      
      {setApiProvider && (
        <div className="mt-4 space-y-2">
          <Label htmlFor="apiProvider" className="govuk-label">AI Provider</Label>
          <Select value={apiProvider} onValueChange={setApiProvider}>
            <SelectTrigger id="apiProvider" className="govuk-input">
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="anthropic">Anthropic</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="mt-4">
        <Label htmlFor="apiKey" className="govuk-label">
          {apiProvider === 'openai' ? 'OpenAI API Key' : 'Anthropic API Key'}
        </Label>
        <p className="govuk-hint">
          {apiProvider === 'openai' 
            ? 'Your OpenAI key starts with \'sk-\'' 
            : 'Your Anthropic key starts with \'sk-ant-\''}
        </p>
        <div className="flex gap-3">
          <Input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={apiProvider === 'openai' ? "sk-..." : "sk-ant-..."}
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
