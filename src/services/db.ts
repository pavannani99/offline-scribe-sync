
import Dexie from 'dexie';
import { Note } from '@/types';

export class NotesDatabase extends Dexie {
  notes!: Dexie.Table<Note, string>;

  constructor() {
    super('NotesDatabase');
    this.version(1).stores({
      notes: 'id, title, updatedAt, synced, syncStatus, isDeleted'
    });
  }
}

export const db = new NotesDatabase();

export const getNotes = async (searchQuery?: string): Promise<Note[]> => {
  let collection = db.notes.where('isDeleted').equals(undefined);
  
  if (searchQuery && searchQuery.trim() !== '') {
    const query = searchQuery.toLowerCase();
    return (await collection.toArray()).filter(note =>
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  }
  
  return collection.toArray();
};

export const getNoteById = async (id: string): Promise<Note | undefined> => {
  return db.notes.get(id);
};

export const saveNote = async (note: Note): Promise<string> => {
  return db.notes.put(note);
};

export const deleteNote = async (id: string): Promise<void> => {
  const note = await getNoteById(id);
  if (note) {
    // Mark as deleted but keep in database for sync purposes
    await db.notes.update(id, { 
      isDeleted: true, 
      syncStatus: 'unsynced', 
      updatedAt: new Date().toISOString() 
    });
  }
};

export const getUnsyncedNotes = async (): Promise<Note[]> => {
  return db.notes.where('syncStatus').equals('unsynced').toArray();
};

export const updateNoteSyncStatus = async (id: string, syncStatus: string): Promise<void> => {
  await db.notes.update(id, { syncStatus, synced: syncStatus === 'synced' });
};

export const purgeDeletedNotes = async (): Promise<void> => {
  const deletedNotes = await db.notes.where('isDeleted').equals(true).and(note => note.syncStatus === 'synced').toArray();
  
  if (deletedNotes.length > 0) {
    const ids = deletedNotes.map(note => note.id);
    await db.notes.bulkDelete(ids);
  }
};
