
import React from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { useNotes } from '@/context/NotesContext';
import SyncStatusIndicator from './SyncStatusIndicator';
import { cn } from '@/lib/utils';

const NoteList: React.FC = () => {
  const { filteredNotes, selectedNoteId, selectNote } = useNotes();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };
  
  // Sort notes by updatedAt (most recent first)
  const sortedNotes = [...filteredNotes].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="h-full overflow-y-auto">
      {sortedNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
          <p>No notes found</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {sortedNotes.map((note) => (
            <li 
              key={note.id}
              onClick={() => selectNote(note.id)}
              className={cn(
                "cursor-pointer p-4 hover:bg-gray-50 transition-colors",
                selectedNoteId === note.id ? "bg-blue-50 border-l-4 border-blue-500" : ""
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className={cn(
                  "font-medium truncate flex-1",
                  selectedNoteId === note.id ? "text-blue-700" : "text-gray-900"
                )}>
                  {note.title || "Untitled"}
                </h3>
                <SyncStatusIndicator status={note.syncStatus} className="ml-2 flex-shrink-0" />
              </div>
              <p className="text-sm text-gray-500 truncate">{note.content}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-400">{formatDate(note.updatedAt)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NoteList;
