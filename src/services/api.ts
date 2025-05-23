
import { Note } from '@/types';

const API_URL = 'https://jsonplaceholder.typicode.com'; // Mock API

export const fetchAllNotes = async (): Promise<Note[]> => {
  try {
    const response = await fetch(`${API_URL}/posts`);
    if (!response.ok) throw new Error('Failed to fetch notes');
    
    const data = await response.json();
    // Transform the mock API data to our Note format
    return data.map((item: any) => ({
      id: item.id.toString(),
      title: item.title,
      content: item.body,
      updatedAt: new Date().toISOString(),
      synced: true,
      syncStatus: 'synced'
    })).slice(0, 10); // Limit to 10 notes for demo
  } catch (error) {
    console.error('API fetch error:', error);
    return [];
  }
};

export const createNote = async (note: Note): Promise<Note | null> => {
  try {
    const response = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      body: JSON.stringify({
        title: note.title,
        body: note.content,
        userId: 1
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    });
    
    if (!response.ok) throw new Error('Failed to create note');
    const data = await response.json();
    
    return {
      ...note,
      synced: true,
      syncStatus: 'synced'
    };
  } catch (error) {
    console.error('API create error:', error);
    return null;
  }
};

export const updateNote = async (note: Note): Promise<Note | null> => {
  try {
    const response = await fetch(`${API_URL}/posts/${note.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        id: note.id,
        title: note.title,
        body: note.content,
        userId: 1,
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    });
    
    if (!response.ok) throw new Error('Failed to update note');
    
    return {
      ...note,
      synced: true,
      syncStatus: 'synced'
    };
  } catch (error) {
    console.error('API update error:', error);
    return null;
  }
};

export const deleteNoteFromServer = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/posts/${id}`, {
      method: 'DELETE',
    });
    
    return response.ok;
  } catch (error) {
    console.error('API delete error:', error);
    return false;
  }
};
