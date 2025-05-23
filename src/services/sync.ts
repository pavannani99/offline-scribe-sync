
import { Note } from '@/types';
import { getUnsyncedNotes, updateNoteSyncStatus, purgeDeletedNotes } from './db';
import { createNote, updateNote, deleteNoteFromServer } from './api';

export const syncNotes = async (): Promise<void> => {
  const notesToSync = await getUnsyncedNotes();
  
  for (const note of notesToSync) {
    try {
      // Update sync status to syncing
      await updateNoteSyncStatus(note.id, 'syncing');
      
      if (note.isDeleted) {
        // Handle deleted notes
        const success = await deleteNoteFromServer(note.id);
        if (success) {
          await updateNoteSyncStatus(note.id, 'synced');
        } else {
          await updateNoteSyncStatus(note.id, 'error');
        }
      } else {
        // Handle new or updated notes
        const syncedNote = await (note.synced ? updateNote(note) : createNote(note));
        
        if (syncedNote) {
          await updateNoteSyncStatus(note.id, 'synced');
        } else {
          await updateNoteSyncStatus(note.id, 'error');
        }
      }
    } catch (error) {
      console.error('Sync error for note:', note.id, error);
      await updateNoteSyncStatus(note.id, 'error');
    }
  }
  
  // Clean up synced deleted notes
  await purgeDeletedNotes();
};
