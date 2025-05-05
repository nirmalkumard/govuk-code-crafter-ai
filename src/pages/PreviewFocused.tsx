
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import CodePreview from '../components/CodePreview';
import CodeBlock from '../components/CodeBlock';
import ApiKeyInput from '../components/ApiKeyInput';
import GeneratorForm, { GeneratorFormData } from '../components/GeneratorForm';
import { generateCodeWithOpenAI } from '../services/openai';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download } from 'lucide-react';

const PreviewFocused = () => {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState<string>('');
  const [isApiKeySet, setIsApiKeySet] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [conversationContext, setConversationContext] = useState<string>('');
  
  // Check for saved API key on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai-api-key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setIsApiKeySet(true);
    }
  }, []);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('openai-api-key', apiKey);
      setIsApiKeySet(true);
      toast.success('API key saved successfully');
    } else {
      toast.error('Please enter a valid API key');
    }
  };

  const createPromptFromFormData = (data: GeneratorFormData): string => {
    const componentsList = data.components.join(', ');
    
    let prompt = `Generate HTML that follows the GOV.UK Design System for ${data.pageType} page. `;
    
    // If we have previous conversation context, include it
    if (conversationContext) {
      prompt += `Based on our previous conversation: ${conversationContext}. `;
      prompt += `New instructions: ${data.description}. `;
    } else {
      prompt += `The page is for: ${data.description}. `;
    }
    
    prompt += `Include these components: ${componentsList}. `;
    
    if (data.customRequirements) {
      prompt += `Additional requirements: ${data.customRequirements}. `;
    }
    
    prompt += "The HTML should be responsive, accessible, and follow all GOV.UK Design System patterns and principles. IMPORTANT: Ensure all elements use proper govuk CSS classes (e.g. govuk-button, govuk-heading-xl, govuk-form-group, etc.). Include only the HTML without any explanations or comments.";
    
    return prompt;
  };

  const handleGenerateCode = async (formData: GeneratorFormData) => {
    try {
      setIsGenerating(true);
      
      // Update conversation context with the new description
      if (conversationContext) {
        setConversationContext(prev => `${prev} User requested: ${formData.description}`);
      } else {
        setConversationContext(formData.description);
      }
      
      const prompt = createPromptFromFormData(formData);
      
      // Pass null if model is 'auto' to let the service handle model selection
      const modelToUse = formData.model === 'auto' ? null : formData.model;
      const code = await generateCodeWithOpenAI(apiKey, prompt, modelToUse);
      
      setGeneratedCode(code);
      toast.success('Code generated successfully');
    } catch (error) {
      console.error('Error generating code:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadCode = () => {
    if (!generatedCode) return;
    
    const blob = new Blob([generatedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'govuk-generated-page.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header with app title */}
      <div className="bg-govuk-blue py-3 px-4">
        <div className="flex items-center justify-center">
          <h1 className="text-white font-bold">GOV.UK Code Generator</h1>
        </div>
      </div>
      
      {!isApiKeySet ? (
        <div className="max-w-lg mx-auto mt-8">
          <ApiKeyInput 
            apiKey={apiKey} 
            setApiKey={setApiKey} 
            onSave={handleSaveApiKey}
            className="p-4"
          />
        </div>
      ) : (
        <div className="flex h-[calc(100vh-56px)]">
          {/* Collapsible sidebar for the generator form */}
          <div className="w-96 bg-white p-4 border-r border-gray-200 overflow-auto">
            <GeneratorForm
              onSubmit={handleGenerateCode}
              isLoading={isGenerating}
              generatedCode={generatedCode}
              apiKey={apiKey}
              setApiKey={setApiKey}
              onSaveApiKey={handleSaveApiKey}
            />
          </div>
          
          {/* Maximized preview area */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center">
              <Tabs defaultValue="preview" className="w-full">
                <div className="flex justify-between items-center">
                  <TabsList>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="code">HTML Code</TabsTrigger>
                  </TabsList>
                  
                  {generatedCode && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleDownloadCode}
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download HTML
                    </Button>
                  )}
                </div>
                
                <TabsContent value="preview" className="h-[calc(100vh-120px)] overflow-auto">
                  <CodePreview html={generatedCode} className="h-full" />
                </TabsContent>
                
                <TabsContent value="code" className="h-[calc(100vh-120px)] overflow-auto">
                  {generatedCode ? (
                    <CodeBlock code={generatedCode} />
                  ) : (
                    <div className="h-full flex items-center justify-center border border-dashed border-govuk-mid-grey rounded p-8 text-center">
                      <div>
                        <h2 className="govuk-heading-m">No code generated yet</h2>
                        <p className="govuk-body">
                          Start a conversation by describing what you need, and I'll create HTML that follows the GOV.UK Design System.
                        </p>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewFocused;
