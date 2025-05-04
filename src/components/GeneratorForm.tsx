
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from '@/lib/utils';

export interface GeneratorFormData {
  description: string;
  pageType: string;
  components: string[];
  customRequirements?: string;
  model?: string;
}

interface GeneratorFormProps {
  onSubmit: (data: GeneratorFormData) => void;
  isLoading: boolean;
  className?: string;
}

const pageTypes = [
  { value: 'form', label: 'Form page' },
  { value: 'landing', label: 'Landing page' },
  { value: 'confirmation', label: 'Confirmation page' },
  { value: 'question', label: 'Question page' },
  { value: 'details', label: 'Information details page' },
];

const componentOptions = [
  { id: 'header', label: 'Header' },
  { id: 'footer', label: 'Footer' },
  { id: 'breadcrumbs', label: 'Breadcrumbs' },
  { id: 'backLink', label: 'Back link' },
  { id: 'errorSummary', label: 'Error summary' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'input', label: 'Text input' },
  { id: 'radios', label: 'Radio buttons' },
  { id: 'checkbox', label: 'Checkboxes' },
  { id: 'table', label: 'Table' },
];

const modelOptions = [
  { value: '', label: 'Auto (try available models)' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'gpt-4o', label: 'GPT-4o' },
];

const GeneratorForm: React.FC<GeneratorFormProps> = ({ onSubmit, isLoading, className }) => {
  const [description, setDescription] = useState('');
  const [pageType, setPageType] = useState('form');
  const [components, setComponents] = useState<string[]>(['header', 'footer']);
  const [customRequirements, setCustomRequirements] = useState('');
  const [model, setModel] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      description,
      pageType,
      components,
      customRequirements,
      model
    });
  };

  const toggleComponent = (componentId: string) => {
    setComponents(prev => 
      prev.includes(componentId)
        ? prev.filter(id => id !== componentId)
        : [...prev, componentId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      <div className="govuk-fieldset">
        <Label htmlFor="description" className="govuk-label">Page description</Label>
        <p className="govuk-hint">Describe the purpose and content of the page you want to generate</p>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="E.g., A form to collect user contact details including name, email, and address"
          required
          className="govuk-textarea"
        />
      </div>

      <div className="govuk-fieldset">
        <Label htmlFor="pageType" className="govuk-label">Page type</Label>
        <p className="govuk-hint">Select the type of page you want to generate</p>
        <Select value={pageType} onValueChange={setPageType}>
          <SelectTrigger id="pageType" className="govuk-input">
            <SelectValue placeholder="Select a page type" />
          </SelectTrigger>
          <SelectContent>
            {pageTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="govuk-fieldset">
        <Label htmlFor="model" className="govuk-label">OpenAI Model</Label>
        <p className="govuk-hint">Select the AI model to use (default: auto-select available model)</p>
        <Select value={model} onValueChange={setModel}>
          <SelectTrigger id="model" className="govuk-input">
            <SelectValue placeholder="Auto (try available models)" />
          </SelectTrigger>
          <SelectContent>
            {modelOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="govuk-fieldset">
        <Label className="govuk-label mb-2">Components to include</Label>
        <p className="govuk-hint">Select the GOV.UK components you want to include in the page</p>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {componentOptions.map((component) => (
            <div key={component.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`component-${component.id}`} 
                checked={components.includes(component.id)}
                onCheckedChange={() => toggleComponent(component.id)}
              />
              <Label 
                htmlFor={`component-${component.id}`}
                className="text-base font-normal cursor-pointer"
              >
                {component.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="govuk-fieldset">
        <Label htmlFor="customRequirements" className="govuk-label">Additional requirements (optional)</Label>
        <p className="govuk-hint">Any specific requirements or notes for the generated code</p>
        <Input
          id="customRequirements"
          value={customRequirements}
          onChange={(e) => setCustomRequirements(e.target.value)}
          placeholder="E.g., Make sure to include validation for email fields"
          className="govuk-input"
        />
      </div>

      <Button type="submit" disabled={isLoading} className="govuk-button">
        {isLoading ? 'Generating...' : 'Generate Code'}
      </Button>
    </form>
  );
};

export default GeneratorForm;
