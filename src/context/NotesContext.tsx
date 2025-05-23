import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Note, SyncStatus } from '@/types';
import { db, getNotes, saveNote, deleteNote, getUnsyncedNotes } from '@/services/db';
import { syncNotes } from '@/services/sync';
import { fetchAllNotes } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';

interface NotesContextType {
  notes: Note[];
  isLoading: boolean;
  selectedNoteId: string | null;
  isOnline: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  createNewNote: () => Promise<string>;
  updateNoteContent: (id: string, title: string, content: string) => Promise<void>;
  deleteSelectedNote: (id: string) => Promise<void>;
  selectNote: (id: string | null) => void;
  syncAllNotes: () => Promise<void>;
  filteredNotes: Note[];
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { toast } = useToast();

  // Check for forced offline mode
  const isForceOfflineMode = () => {
    return localStorage.getItem('offlineMode') === 'true';
  };

  // Get actual online status
  const getActualOnlineStatus = () => {
    return isForceOfflineMode() ? false : navigator.onLine;
  };

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(getActualOnlineStatus());
      if (!isForceOfflineMode()) {
        toast({
          title: "You're back online",
          description: "Syncing your notes...",
        });
        syncAllNotes();
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "You're offline",
        description: "Changes will be synced when you reconnect.",
        variant: "destructive"
      });
    };

    // Update online status initially
    setIsOnline(getActualOnlineStatus());

    // Set up event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for storage events (for offline mode changes in other tabs)
    const handleStorageChange = () => {
      setIsOnline(getActualOnlineStatus());
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Load notes from DB
  useEffect(() => {
    const loadNotes = async () => {
      setIsLoading(true);
      try {
        // First load notes from IndexedDB
        const localNotes = await getNotes();
        setNotes(localNotes);
        
        // If we're online and have no notes, try to fetch from API
        const actualOnlineStatus = getActualOnlineStatus();
        if (actualOnlineStatus && localNotes.length === 0) {
          const apiNotes = await fetchAllNotes();
          
          // Save API notes to IndexedDB
          for (const note of apiNotes) {
            await saveNote(note);
          }
          
          if (apiNotes.length > 0) {
            setNotes(apiNotes);
          }
        }
        
        // Try to sync any unsynced notes
        if (actualOnlineStatus) {
          const unsyncedNotes = await getUnsyncedNotes();
          if (unsyncedNotes.length > 0) {
            await syncAllNotes();
          }
        }
      } catch (error) {
        console.error('Error loading notes:', error);
        toast({
          title: "Error loading notes",
          description: "There was a problem loading your notes.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadNotes();
  }, [isOnline]);

  // Filter notes based on search query
  const filteredNotes = React.useMemo(() => {
    if (!searchQuery.trim()) return notes;
    
    const query = searchQuery.toLowerCase();
    return notes.filter(note => 
      note.title.toLowerCase().includes(query) || 
      note.content.toLowerCase().includes(query)
    );
  }, [notes, searchQuery]);

  // Create a new note
  const createNewNote = async () => {
    const newNote: Note = {
      id: uuidv4(),
      title: 'New Note',
      content: '',
      updatedAt: new Date().toISOString(),
      synced: false,
      syncStatus: 'unsynced'
    };

    await saveNote(newNote);
    setNotes(prev => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
    
    if (isOnline) {
      syncAllNotes();
    }
    
    return newNote.id;
  };

  // Update note content with debouncing
  const updateNoteContent = useCallback(async (id: string, title: string, content: string) => {
    const noteToUpdate = notes.find(note => note.id === id);
    
    if (!noteToUpdate) return;
    
    const updatedNote: Note = {
      ...noteToUpdate,
      title,
      content,
      updatedAt: new Date().toISOString(),
      syncStatus: 'unsynced',
      synced: false
    };
    
    await saveNote(updatedNote);
    
    // Update the notes state
    setNotes(prev => prev.map(note => note.id === id ? updatedNote : note));
    
    // Try to sync if online
    if (getActualOnlineStatus()) {
      // We don't await here to allow UI to remain responsive
      syncAllNotes();
    }
  }, [notes]);

  // Delete a note
  const deleteSelectedNote = async (id: string) => {
    await deleteNote(id);
    
    setNotes(prev => prev.filter(note => note.id !== id));
    
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
    }
    
    if (isOnline) {
      syncAllNotes();
    }
  };

  // Select a note
  const selectNote = (id: string | null) => {
    setSelectedNoteId(id);
  };

  // Sync all notes
  const syncAllNotes = async () => {
    if (!getActualOnlineStatus()) {
      toast({
        title: "You're offline",
        description: "Notes will sync when you're back online.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await syncNotes();
      const updatedNotes = await getNotes(searchQuery);
      setNotes(updatedNotes);
      
      toast({
        title: "Notes synced",
        description: "All your notes have been synced successfully."
      });
    } catch (error) {
      console.error('Error syncing notes:', error);
      toast({
        title: "Sync failed",
        description: "There was a problem syncing your notes. We'll try again later.",
        variant: "destructive"
      });
    }
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        isLoading,
        selectedNoteId,
        isOnline: getActualOnlineStatus(), // Use the actual status
        searchQuery,
        setSearchQuery,
        createNewNote,
        updateNoteContent,
        deleteSelectedNote,
        selectNote,
        syncAllNotes,
        filteredNotes,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};
