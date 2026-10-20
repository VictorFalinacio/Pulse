import { useContext } from 'react';
import { UploadContext } from './uploadContextValue';

export const useUpload = () => {
  const context = useContext(UploadContext);
  if (!context) throw new Error('useUpload must be used within an UploadProvider');
  return context;
};
