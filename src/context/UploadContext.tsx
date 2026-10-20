import React, { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { apiFetch } from '../utils/api';
import type { UploadResult } from '../types/api';
import { UploadContext } from './uploadContextValue';
import type { UploadTask } from './uploadContextValue';

export const UploadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [uploads, setUploads] = useState<Record<string, UploadTask>>({});

    const uploadFile = useCallback(async (file: File, options?: { day?: number, sprintId?: string, onComplete?: (data: UploadResult) => void }) => {
        const taskId = `${Date.now()}-${file.name}`;
        
        setUploads(prev => ({
            ...prev,
            [taskId]: {
                id: taskId,
                fileName: file.name,
                progress: 0,
                status: 'uploading',
                day: options?.day,
                sprintId: options?.sprintId
            }
        }));

        const formData = new FormData();
        formData.append('file', file);

        try {
            const url = options?.sprintId 
                ? `/api/sprint/${options.sprintId}/upload/${options.day}` 
                : `/api/analysis/analisar`;

            const response = await apiFetch(url, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Erro ao processar arquivo');
            }

            setUploads(prev => ({
                ...prev,
                [taskId]: { ...prev[taskId], status: 'completed', progress: 100 }
            }));

            if (options?.onComplete) options.onComplete(data);
            
        } catch (err: unknown) {
            setUploads(prev => ({
                ...prev,
                [taskId]: { ...prev[taskId], status: 'error', error: err instanceof Error ? err.message : 'Falha desconhecida no upload.' }
            }));
            throw err;
        }
    }, []);

    return (
        <UploadContext.Provider value={{ uploads, uploadFile }}>
            {children}
        </UploadContext.Provider>
    );
};
