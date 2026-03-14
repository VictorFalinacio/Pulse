import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { API_URL } from '../config';

interface UploadTask {
    id: string;
    fileName: string;
    progress: number;
    status: 'uploading' | 'completed' | 'error';
    day?: number;
    sprintId?: string;
    error?: string;
}

interface UploadContextType {
    uploads: Record<string, UploadTask>;
    uploadFile: (file: File, options?: { day?: number, sprintId?: string, onComplete?: (data: any) => void }) => Promise<void>;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export const UploadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [uploads, setUploads] = useState<Record<string, UploadTask>>({});

    const uploadFile = useCallback(async (file: File, options?: { day?: number, sprintId?: string, onComplete?: (data: any) => void }) => {
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
            const token = localStorage.getItem('agile_pulse_token');
            const url = options?.sprintId 
                ? `${API_URL}/api/sprint/${options.sprintId}/upload/${options.day}` 
                : `${API_URL}/api/analysis/analisar`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
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
            
        } catch (err: any) {
            setUploads(prev => ({
                ...prev,
                [taskId]: { ...prev[taskId], status: 'error', error: err.message }
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

export const useUpload = () => {
    const context = useContext(UploadContext);
    if (context === undefined) {
        throw new Error('useUpload must be used within an UploadProvider');
    }
    return context;
};
