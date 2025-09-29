import React, { createContext, useContext } from 'react';
import { useDownloads } from '@/hooks/use-downloads';

type UseDownloadsReturn = ReturnType<typeof useDownloads>;

const DownloadContext = createContext<UseDownloadsReturn | undefined>(undefined);

export const DownloadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const downloads = useDownloads();
  return (
    <DownloadContext.Provider value={downloads}>
      {children}
    </DownloadContext.Provider>
  );
};

export const useDownloadContext = () => {
  const context = useContext(DownloadContext);
  if (context === undefined) {
    throw new Error('useDownloadContext must be used within a DownloadProvider');
  }
  return context;
};