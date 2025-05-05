
import React, { useState, useRef, useEffect } from 'react';
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
import { SendIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

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
  generatedCode?: string;
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
  { value: 'auto', label: 'Auto (try available models)' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'gpt-4o', label: 'GPT-4o' },
];

const GeneratorForm: React.FC<GeneratorFormProps> = ({ onSubmit, isLoading, className, generatedCode }) => {
  const [pageType, setPageType] = useState('form');
  const [components, setComponents] = useState<string[]>(['header', 'footer']);
  const [customRequirements, setCustomRequirements] = useState('');
  const [model, setModel] = useState('auto');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      content: "Welcome! Describe the page you want to generate following the GOV.UK Design System patterns and principles.",
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    
    // Create prompt for code generation with GOV.UK directive
    const componentsList = components.join(', ');
    const description = inputMessage + " Use the GOV.UK Design System patterns and principles.";
    
    // Submit for code generation
    onSubmit({
      description,
      pageType,
      components,
      customRequirements,
      model
    });
    
    // Add system response indicating generation
    const systemResponse: Message = {
      id: (Date.now() + 1).toString(),
      content: "Generating code based on your request...",
      sender: 'assistant',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, systemResponse]);
  };

  const toggleComponent = (componentId: string) => {
    setComponents(prev => 
      prev.includes(componentId)
        ? prev.filter(id => id !== componentId)
        : [...prev, componentId]
    );
  };

  // Update messages when new code is generated
  useEffect(() => {
    if (generatedCode && messages.length > 1) {
      // Replace the "generating" message with a completion message
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage.sender === 'assistant' && lastMessage.content.includes("Generating code")) {
          const updatedMessages = [...prev];
          updatedMessages[prev.length - 1] = {
            ...lastMessage,
            content: "Code generated successfully! You can see the preview on the right. Continue the conversation to refine the code."
          };
          return updatedMessages;
        }
        return prev;
      });
    }
  }, [generatedCode]);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Settings using Sheet component to avoid footer overlap */}
      <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <SheetTrigger asChild>
          <div 
            className="flex items-center justify-between p-2 bg-gray-100 rounded-md mb-4 cursor-pointer"
            onClick={() => setIsSettingsOpen(true)}
          >
            <span className="font-medium">Settings</span>
            <ChevronDown size={16} />
          </div>
        </SheetTrigger>
        <SheetContent className="overflow-y-auto max-h-[90vh] w-full md:max-w-md">
          <SheetHeader>
            <SheetTitle>Generator Settings</SheetTitle>
            <SheetDescription>
              Configure your code generation preferences
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-4 mt-6">
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
              <div className="grid gap-3 md:grid-cols-2">
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
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Chat messages */}
      <ScrollArea className="flex-grow border border-gray-200 rounded-md p-4 mb-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={cn(
                "p-3 rounded-lg max-w-[85%]",
                message.sender === 'user' 
                  ? "bg-govuk-blue text-white ml-auto" 
                  : "bg-gray-100 text-black mr-auto"
              )}
            >
              {message.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {/* Input form */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Describe your page or provide additional instructions..."
          className="flex-grow resize-none h-20"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(e);
            }
          }}
        />
        <Button 
          type="submit" 
          disabled={isLoading || !inputMessage.trim()} 
          className="self-end govuk-button"
        >
          <SendIcon className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default GeneratorForm;
