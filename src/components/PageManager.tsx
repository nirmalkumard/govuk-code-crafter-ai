
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePageContext, Page } from '../contexts/PageContext';
import { cn } from '@/lib/utils';
import { FilePlus, File, X, Edit } from 'lucide-react';
import { format } from 'date-fns';

const PageManager = () => {
  const { pages, currentPageId, addPage, selectPage, renamePage, deletePage } = usePageContext();
  const [showNewPageDialog, setShowNewPageDialog] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPageDescription, setNewPageDescription] = useState('');
  
  const [editPageId, setEditPageId] = useState<string | null>(null);
  const [editPageName, setEditPageName] = useState('');

  const handleAddPage = () => {
    if (newPageName.trim()) {
      addPage(newPageName, newPageDescription);
      setNewPageName('');
      setNewPageDescription('');
      setShowNewPageDialog(false);
    }
  };

  const handleStartEdit = (page: Page) => {
    setEditPageId(page.id);
    setEditPageName(page.name);
  };

  const handleSaveEdit = () => {
    if (editPageId && editPageName.trim()) {
      renamePage(editPageId, editPageName);
      setEditPageId(null);
      setEditPageName('');
    }
  };

  const handleCancelEdit = () => {
    setEditPageId(null);
    setEditPageName('');
  };

  return (
    <div className="w-full">
      <Dialog open={showNewPageDialog} onOpenChange={setShowNewPageDialog}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-between mb-4"
            onClick={() => setShowNewPageDialog(true)}
          >
            <span>Add New Page</span>
            <FilePlus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Page</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Page Name</label>
              <Input
                value={newPageName}
                onChange={e => setNewPageName(e.target.value)}
                placeholder="e.g., Contact Form"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description (optional)</label>
              <Input
                value={newPageDescription}
                onChange={e => setNewPageDescription(e.target.value)}
                placeholder="Brief description of the page"
              />
            </div>
            <Button onClick={handleAddPage} className="w-full">
              Add Page
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ScrollArea className="h-[220px] w-full border rounded-md">
        <div className="p-2">
          {pages.map(page => (
            <div 
              key={page.id}
              className={cn(
                "mb-2 p-2 rounded-md flex items-center justify-between group",
                currentPageId === page.id ? "bg-gray-100" : "hover:bg-gray-50"
              )}
            >
              {editPageId === page.id ? (
                <div className="flex items-center space-x-2 w-full">
                  <Input 
                    value={editPageName} 
                    onChange={e => setEditPageName(e.target.value)}
                    className="flex-grow"
                    autoFocus
                  />
                  <Button size="sm" variant="ghost" onClick={handleSaveEdit}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
                </div>
              ) : (
                <>
                  <div 
                    className="flex items-center flex-grow cursor-pointer"
                    onClick={() => selectPage(page.id)}
                  >
                    <File className="h-4 w-4 mr-2" />
                    <div>
                      <div className="font-medium">{page.name}</div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(page.lastModified), 'dd MMM yyyy HH:mm')}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      className="p-1 rounded hover:bg-gray-200"
                      onClick={() => handleStartEdit(page)}
                    >
                      <Edit className="h-3 w-3" />
                    </button>
                    {pages.length > 1 && (
                      <button 
                        className="p-1 rounded hover:bg-gray-200"
                        onClick={() => deletePage(page.id)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PageManager;
