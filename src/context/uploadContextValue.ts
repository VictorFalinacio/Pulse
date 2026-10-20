import { createContext } from 'react';
import type { UploadResult } from '../types/api';

export interface UploadTask {
  id: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  day?: number;
  sprintId?: string;
  error?: string;
}

export interface UploadContextType {
  uploads: Record<string, UploadTask>;
  uploadFile: (file: File, options?: { day?: number; sprintId?: string; onComplete?: (data: UploadResult) => void }) => Promise<void>;
}

export const UploadContext = createContext<UploadContextType | undefined>(undefined);
