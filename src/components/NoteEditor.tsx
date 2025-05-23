
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNotes } from '@/context/NotesContext';
import SyncStatusIndicator from './SyncStatusIndicator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Note } from '@/types';
import { useDebounce } from '@/hooks/use-debounce';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Add remark-gfm dependency
<lov-add-dependency>remark-gfm@4.0.1</lov-add-dependency>
import remarkGfm from 'remark-gfm';

const NoteEditor: React.FC = () => {
  const { notes, selectedNoteId, updateNoteContent, deleteSelectedNote } = useNotes();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [activeTab, setActiveTab] = useState('edit');
  const [note, setNote] = useState<Note | null>(null);
  
  // Debounced values for autosave
  const debouncedTitle = useDebounce(title, 500);
  const debouncedContent = useDebounce(content, 500);
  
  // Find the selected note
  useEffect(() => {
    if (selectedNoteId) {
      const selectedNote = notes.find(n => n.id === selectedNoteId) || null;
      setNote(selectedNote);
      
      if (selectedNote) {
        setTitle(selectedNote.title);
        setContent(selectedNote.content);
      }
    } else {
      setNote(null);
      setTitle('');
      setContent('');
    }
  }, [selectedNoteId, notes]);
  
  // Autosave when debounced values change
  useEffect(() => {
    if (selectedNoteId && (debouncedTitle !== note?.title || debouncedContent !== note?.content)) {
      updateNoteContent(selectedNoteId, debouncedTitle, debouncedContent);
    }
  }, [debouncedTitle, debouncedContent, selectedNoteId]);
  
  const handleDelete = () => {
    if (selectedNoteId && confirm('Are you sure you want to delete this note?')) {
      deleteSelectedNote(selectedNoteId);
    }
  };
  
  if (!selectedNoteId || !note) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        <p>Select a note or create a new one</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-4">
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
            className="text-xl font-medium border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <SyncStatusIndicator status={note.syncStatus} />
        </div>
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          Delete
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b px-4">
          <TabsList className="mt-2">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <TabsContent value="edit" className="h-full mt-0">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your markdown content here..."
              className="min-h-full resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
            />
          </TabsContent>
          
          <TabsContent value="preview" className="markdown-preview h-full mt-0 prose max-w-none">
            {content ? (
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  code({node, className, children, ...props}) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={oneLight}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {content}
              </ReactMarkdown>
            ) : (
              <p className="text-gray-400">Nothing to preview</p>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default NoteEditor;
