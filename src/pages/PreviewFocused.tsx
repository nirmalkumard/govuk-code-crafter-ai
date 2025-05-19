
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import CodePreview from '../components/CodePreview';
import CodeBlock from '../components/CodeBlock';
import ApiKeyInput from '../components/ApiKeyInput';
import GeneratorForm, { GeneratorFormData } from '../components/GeneratorForm';
import { generateCodeWithOpenAI } from '../services/openai';
import { generateCodeWithAnthropic } from '../services/anthropic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, ExternalLink, Maximize } from 'lucide-react';
import PageManager from '../components/PageManager';
import { PageProvider, usePageContext } from '../contexts/PageContext';
import PreviewModal from '../components/PreviewModal';

const PreviewFocusedContent = () => {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState<string>('');
  const [apiProvider, setApiProvider] = useState<string>('openai'); // Default to OpenAI
  const [isApiKeySet, setIsApiKeySet] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [conversationContext, setConversationContext] = useState<string>('');
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  
  // Get the current page from context
  const { currentPageId, updatePageCode, getCurrentPage } = usePageContext();
  const currentPage = getCurrentPage();
  
  // Check for saved API key on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem(`${apiProvider}-api-key`);
    const savedApiProvider = localStorage.getItem('api-provider') || 'openai';
    
    setApiProvider(savedApiProvider);
    
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setIsApiKeySet(true);
    } else {
      // If we switch providers and don't have a key, we need to prompt for one
      setIsApiKeySet(false);
    }
  }, [apiProvider]);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem(`${apiProvider}-api-key`, apiKey);
      localStorage.setItem('api-provider', apiProvider);
      setIsApiKeySet(true);
      toast.success(`${apiProvider === 'openai' ? 'OpenAI' : 'Anthropic'} API key saved successfully`);
    } else {
      toast.error('Please enter a valid API key');
    }
  };

  const createPromptFromFormData = (data: GeneratorFormData): string => {
    const componentsList = data.components.join(', ');
    
    let prompt = `Generate HTML that follows the GOV.UK Design System for ${data.pageType} page. `;
    
    // Include the current page name in the prompt
    if (currentPage) {
      prompt += `This is for a page named "${currentPage.name}". `;
    }
    
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
      if (!currentPageId) {
        toast.error('No page selected');
        return;
      }
      
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
      
      let code;
      // Generate code using selected API provider
      if (formData.apiProvider === 'anthropic') {
        code = await generateCodeWithAnthropic(apiKey, prompt, modelToUse);
      } else {
        // Default to OpenAI
        code = await generateCodeWithOpenAI(apiKey, prompt, modelToUse);
      }
      
      // Update the current page's code
      updatePageCode(currentPageId, code);
      
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
    if (!currentPage || !currentPage.generatedCode) return;
    
    const blob = new Blob([currentPage.generatedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentPage.name.toLowerCase().replace(/\s+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenInBrowser = () => {
    if (!currentPage || !currentPage.generatedCode) return;
    
    const htmlWithGovUkCss = `
      <!DOCTYPE html>
      <html lang="en" class="govuk-template">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          
          <title>${currentPage.name || 'GOV.UK Preview'}</title>
          
          <!-- Load GOV.UK Design System CSS -->
          <link rel="stylesheet" href="https://design-system.service.gov.uk/stylesheets/main-8ac4d8a2fc1f22a06df330c13b616776.css">
          
          <!-- Additional GOV.UK Fonts -->
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=GDS+Transport:wght@400;700&display=swap" rel="stylesheet">
          
          <style>
            body {
              font-family: "GDS Transport", arial, sans-serif;
              margin: 0;
              padding: 0;
            }
            
            .govuk-header__logotype-crown {
              display: inline-block;
            }
            
            .govuk-width-container {
              max-width: 1200px;
              margin: 0 auto;
            }
          </style>
        </head>
        <body class="govuk-template__body">
          <script>document.body.className = ((document.body.className) ? document.body.className + ' js-enabled' : 'js-enabled');</script>
          ${currentPage.generatedCode}
        </body>
      </html>
    `;
    
    const blob = new Blob([htmlWithGovUkCss], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
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
            apiProvider={apiProvider}
            setApiProvider={setApiProvider}
          />
        </div>
      ) : (
        <div className="flex h-[calc(100vh-56px)]">
          {/* Sidebar for page management and generator form */}
          <div className="w-96 bg-white p-4 border-r border-gray-200 overflow-auto flex flex-col">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Pages</h2>
              <PageManager />
            </div>
            
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-2">Generator</h2>
              <GeneratorForm
                onSubmit={handleGenerateCode}
                isLoading={isGenerating}
                generatedCode={currentPage?.generatedCode || ''}
                apiKey={apiKey}
                setApiKey={setApiKey}
                onSaveApiKey={handleSaveApiKey}
                apiProvider={apiProvider}
                setApiProvider={setApiProvider}
              />
            </div>
          </div>
          
          {/* Preview area */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center">
              <Tabs defaultValue="preview" className="w-full">
                <div className="flex justify-between items-center">
                  <TabsList>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="code">HTML Code</TabsTrigger>
                  </TabsList>
                  
                  <div className="flex space-x-2">
                    {currentPage?.generatedCode && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowPreviewModal(true)}
                          className="flex items-center gap-2"
                        >
                          <Maximize className="w-4 h-4" />
                          Full Preview
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleOpenInBrowser}
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Open in Browser
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleDownloadCode}
                          className="flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download HTML
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                <TabsContent value="preview" className="h-[calc(100vh-120px)] overflow-auto">
                  <CodePreview html={currentPage?.generatedCode || ''} className="h-full" />
                </TabsContent>
                
                <TabsContent value="code" className="h-[calc(100vh-120px)] overflow-auto">
                  {currentPage?.generatedCode ? (
                    <CodeBlock code={currentPage.generatedCode} />
                  ) : (
                    <div className="h-full flex items-center justify-center border border-dashed border-govuk-mid-grey rounded p-8 text-center">
                      <div>
                        <h2 className="govuk-heading-m">No code generated yet</h2>
                        <p className="govuk-body">
                          {currentPage ? 
                            `Start a conversation to generate code for "${currentPage.name}"` :
                            'Select or create a page to get started'
                          }
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

      {/* Preview Modal */}
      {currentPage && (
        <PreviewModal 
          isOpen={showPreviewModal}
          onOpenChange={setShowPreviewModal}
          html={currentPage?.generatedCode || ''}
          pageName={currentPage?.name || ''}
        />
      )}
    </div>
  );
};

// Wrap the component with PageProvider
const PreviewFocused = () => (
  <PageProvider>
    <PreviewFocusedContent />
  </PageProvider>
);

export default PreviewFocused;
