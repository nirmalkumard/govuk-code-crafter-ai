
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CodeBlock from '../components/CodeBlock';
import CodePreview from '../components/CodePreview';
import ApiKeyInput from '../components/ApiKeyInput';
import GeneratorForm, { GeneratorFormData } from '../components/GeneratorForm';
import { generateCodeWithOpenAI } from '../services/openai';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const Index = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isApiKeySet, setIsApiKeySet] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  
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
    prompt += `The page is for: ${data.description}. `;
    prompt += `Include these components: ${componentsList}. `;
    
    if (data.customRequirements) {
      prompt += `Additional requirements: ${data.customRequirements}. `;
    }
    
    prompt += "The HTML should be responsive, accessible, and follow all GOV.UK Design System patterns and principles. Include only the HTML without any explanations or comments.";
    
    return prompt;
  };

  const handleGenerateCode = async (formData: GeneratorFormData) => {
    try {
      setIsGenerating(true);
      const prompt = createPromptFromFormData(formData);
      const code = await generateCodeWithOpenAI(apiKey, prompt);
      setGeneratedCode(code);
      toast.success('Code generated successfully');
    } catch (error) {
      console.error('Error:', error);
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
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        <div className="govuk-width-container py-8">
          <div className="govuk-phase-banner">
            <p className="flex items-center gap-2 text-sm">
              <span className="govuk-tag">BETA</span>
              <span>This is a new service – your feedback will help us improve it.</span>
            </p>
          </div>
          
          <h1 className="govuk-heading-xl">GOV.UK Code Generator</h1>
          <p className="govuk-body">Generate HTML code that follows the GOV.UK Design System patterns and principles.</p>
          
          {!isApiKeySet ? (
            <ApiKeyInput 
              apiKey={apiKey} 
              setApiKey={setApiKey} 
              onSave={handleSaveApiKey} 
              className="mt-6"
            />
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
                <div className="lg:col-span-5">
                  <GeneratorForm 
                    onSubmit={handleGenerateCode} 
                    isLoading={isGenerating} 
                  />
                </div>
                
                <div className="lg:col-span-7">
                  {generatedCode ? (
                    <Tabs defaultValue="preview" className="w-full">
                      <div className="flex justify-between items-center mb-4">
                        <TabsList>
                          <TabsTrigger value="preview">Preview</TabsTrigger>
                          <TabsTrigger value="code">HTML Code</TabsTrigger>
                        </TabsList>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleDownloadCode}
                          className="flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download HTML
                        </Button>
                      </div>
                      
                      <TabsContent value="preview">
                        <CodePreview html={generatedCode} />
                      </TabsContent>
                      
                      <TabsContent value="code">
                        <CodeBlock code={generatedCode} />
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <div className="h-full flex items-center justify-center border border-dashed border-govuk-mid-grey rounded p-8 text-center">
                      <div>
                        <h2 className="govuk-heading-m">No code generated yet</h2>
                        <p className="govuk-body">
                          Fill out the form and click "Generate Code" to create HTML that follows the GOV.UK Design System.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-12 p-6 bg-govuk-light-grey border-l-4 border-govuk-blue rounded">
                <h2 className="govuk-heading-m">About this tool</h2>
                <p className="govuk-body">
                  This code generator creates HTML following the GOV.UK Design System principles. The generated code is for reference and might need adjustments before production use.
                </p>
                <p className="govuk-body">
                  Always refer to the <a href="https://design-system.service.gov.uk/" className="govuk-link" target="_blank" rel="noopener noreferrer">official GOV.UK Design System</a> for detailed guidance.
                </p>
              </div>
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
