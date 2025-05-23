
import React from 'react';
import { NotesProvider } from '@/context/NotesContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import NoteList from '@/components/NoteList';
import NoteEditor from '@/components/NoteEditor';
import SearchBar from '@/components/SearchBar';
import ConnectionStatus from '@/components/ConnectionStatus';
import { useNotes } from '@/context/NotesContext';

// Create a NotesApp component to use useNotes hook
const NotesApp: React.FC = () => {
  const { createNewNote, isLoading } = useNotes();
  
  return (
    <div className="h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">OfflineScribeSync</h1>
          <ConnectionStatus />
        </div>
      </header>
      
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full md:w-80 border-r flex flex-col overflow-hidden">
          <div className="p-4 space-y-4">
            <Button onClick={() => createNewNote()} className="w-full">New Note</Button>
            <SearchBar />
          </div>
          <Separator />
          <div className="flex-1 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p>Loading notes...</p>
              </div>
            ) : (
              <NoteList />
            )}
          </div>
        </aside>
        
        {/* Main content area */}
        <section className="flex-1 overflow-hidden">
          <NoteEditor />
        </section>
      </main>
      
      <footer className="border-t p-2">
        <div className="container mx-auto text-xs text-center text-gray-500">
          OfflineScribeSync - Notes sync automatically when you're online
        </div>
      </footer>
    </div>
  );
};

// Wrapper component to provide context
const Index: React.FC = () => {
  return (
    <NotesProvider>
      <NotesApp />
    </NotesProvider>
  );
};

export default Index;
