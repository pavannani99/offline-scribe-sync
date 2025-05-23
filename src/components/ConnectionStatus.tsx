
import React, { useState, useEffect } from 'react';
import { useNotes } from '@/context/NotesContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { AlertCircle, WifiOff } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ConnectionStatus: React.FC = () => {
  const { isOnline, syncAllNotes } = useNotes();
  const [forceOffline, setForceOffline] = useState<boolean>(false);
  
  // When force offline is toggled, we'll update local storage
  useEffect(() => {
    if (forceOffline) {
      localStorage.setItem('offlineMode', 'true');
    } else {
      localStorage.removeItem('offlineMode');
    }
  }, [forceOffline]);
  
  // Check localStorage on component mount
  useEffect(() => {
    const storedOfflineMode = localStorage.getItem('offlineMode') === 'true';
    setForceOffline(storedOfflineMode);
  }, []);
  
  const actualConnectionStatus = forceOffline ? false : isOnline;
  
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <div 
          className={cn(
            "w-2 h-2 rounded-full", 
            actualConnectionStatus ? "bg-green-500" : "bg-red-500"
          )}
        />
        <span className="text-sm">
          {actualConnectionStatus ? 'Online' : 'Offline'}
        </span>
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              <Switch 
                id="offline-mode"
                checked={forceOffline}
                onCheckedChange={setForceOffline}
              />
              <label htmlFor="offline-mode" className="text-sm cursor-pointer">
                Offline Mode
              </label>
              {forceOffline && <WifiOff className="h-4 w-4 text-orange-500" />}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Force app to work offline even when connected</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {actualConnectionStatus && (
        <Button variant="outline" size="sm" onClick={() => syncAllNotes()}>
          Sync Now
        </Button>
      )}
      
      {!actualConnectionStatus && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-amber-500 mr-1" />
                <span className="text-xs text-amber-500">Changes saved locally</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Your changes are saved locally and will sync when you're online</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default ConnectionStatus;
