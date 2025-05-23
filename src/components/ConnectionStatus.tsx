
import React from 'react';
import { useNotes } from '@/context/NotesContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ConnectionStatus: React.FC = () => {
  const { isOnline, syncAllNotes } = useNotes();
  
  return (
    <div className="flex items-center gap-2">
      <div 
        className={cn(
          "w-2 h-2 rounded-full", 
          isOnline ? "bg-green-500" : "bg-red-500"
        )}
      />
      <span className="text-sm">
        {isOnline ? 'Online' : 'Offline'}
      </span>
      {isOnline && (
        <Button variant="outline" size="sm" onClick={() => syncAllNotes()}>
          Sync Now
        </Button>
      )}
    </div>
  );
};

export default ConnectionStatus;
