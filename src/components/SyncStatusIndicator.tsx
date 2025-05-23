
import React from 'react';
import { SyncStatus } from '@/types';
import { cn } from '@/lib/utils';

interface SyncStatusIndicatorProps {
  status: SyncStatus;
  className?: string;
}

const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({ status, className }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'unsynced':
        return 'bg-sync-unsynced';
      case 'syncing':
        return 'bg-sync-syncing animate-pulse';
      case 'synced':
        return 'bg-sync-synced';
      case 'error':
        return 'bg-sync-error';
      default:
        return 'bg-gray-300';
    }
  };
  
  const getStatusText = () => {
    switch (status) {
      case 'unsynced':
        return 'Not synced';
      case 'syncing':
        return 'Syncing...';
      case 'synced':
        return 'Synced';
      case 'error':
        return 'Sync error';
      default:
        return 'Unknown';
    }
  };
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("w-2 h-2 rounded-full", getStatusColor())} />
      <span className="text-xs text-muted-foreground">{getStatusText()}</span>
    </div>
  );
};

export default SyncStatusIndicator;
