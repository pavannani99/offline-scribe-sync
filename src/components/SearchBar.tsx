
import React from 'react';
import { useNotes } from '@/context/NotesContext';
import { Input } from '@/components/ui/input';

const SearchBar: React.FC = () => {
  const { searchQuery, setSearchQuery } = useNotes();
  
  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="Search notes..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full"
      />
    </div>
  );
};

export default SearchBar;
