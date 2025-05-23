
export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  synced: boolean;
  syncStatus: SyncStatus;
  isDeleted?: boolean;
}

export type SyncStatus = 'unsynced' | 'syncing' | 'synced' | 'error';

export interface ConnectionStatus {
  online: boolean;
  lastChecked: Date;
}
