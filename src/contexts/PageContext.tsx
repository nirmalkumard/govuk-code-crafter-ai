
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Page {
  id: string;
  name: string;
  description?: string;
  generatedCode: string;
  lastModified: Date;
}

interface PageContextType {
  pages: Page[];
  currentPageId: string | null;
  addPage: (name: string, description?: string) => void;
  updatePageCode: (id: string, code: string) => void;
  selectPage: (id: string) => void;
  renamePage: (id: string, newName: string) => void;
  deletePage: (id: string) => void;
  getCurrentPage: () => Page | undefined;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export const PageProvider = ({ children }: { children: ReactNode }) => {
  const [pages, setPages] = useState<Page[]>(() => {
    const savedPages = localStorage.getItem('govuk-pages');
    if (savedPages) {
      const parsed = JSON.parse(savedPages);
      // Convert string dates back to Date objects
      return parsed.map((page: any) => ({
        ...page,
        lastModified: new Date(page.lastModified)
      }));
    }
    // Default empty page
    const defaultPage: Page = {
      id: '1',
      name: 'Home',
      description: 'Default home page',
      generatedCode: '',
      lastModified: new Date()
    };
    return [defaultPage];
  });
  
  const [currentPageId, setCurrentPageId] = useState<string | null>(() => {
    const savedCurrentPageId = localStorage.getItem('govuk-current-page-id');
    return savedCurrentPageId || (pages.length > 0 ? pages[0].id : null);
  });

  // Save to localStorage whenever pages or currentPageId changes
  React.useEffect(() => {
    localStorage.setItem('govuk-pages', JSON.stringify(pages));
  }, [pages]);

  React.useEffect(() => {
    if (currentPageId) {
      localStorage.setItem('govuk-current-page-id', currentPageId);
    }
  }, [currentPageId]);

  const addPage = (name: string, description?: string) => {
    const newPage: Page = {
      id: Date.now().toString(),
      name,
      description,
      generatedCode: '',
      lastModified: new Date()
    };
    setPages(prev => [...prev, newPage]);
    // Automatically select the new page
    setCurrentPageId(newPage.id);
  };

  const updatePageCode = (id: string, code: string) => {
    setPages(prev => prev.map(page => 
      page.id === id 
        ? { ...page, generatedCode: code, lastModified: new Date() } 
        : page
    ));
  };

  const selectPage = (id: string) => {
    setCurrentPageId(id);
  };

  const renamePage = (id: string, newName: string) => {
    setPages(prev => prev.map(page => 
      page.id === id 
        ? { ...page, name: newName, lastModified: new Date() } 
        : page
    ));
  };

  const deletePage = (id: string) => {
    // Don't delete if it's the only page
    if (pages.length <= 1) return;
    
    setPages(prev => prev.filter(page => page.id !== id));
    
    // If we're deleting the current page, select another one
    if (currentPageId === id) {
      const remainingPages = pages.filter(page => page.id !== id);
      if (remainingPages.length > 0) {
        setCurrentPageId(remainingPages[0].id);
      } else {
        setCurrentPageId(null);
      }
    }
  };

  const getCurrentPage = () => {
    return pages.find(page => page.id === currentPageId);
  };

  return (
    <PageContext.Provider value={{
      pages,
      currentPageId,
      addPage,
      updatePageCode,
      selectPage,
      renamePage,
      deletePage,
      getCurrentPage
    }}>
      {children}
    </PageContext.Provider>
  );
};

export const usePageContext = () => {
  const context = useContext(PageContext);
  if (context === undefined) {
    throw new Error('usePageContext must be used within a PageProvider');
  }
  return context;
};
