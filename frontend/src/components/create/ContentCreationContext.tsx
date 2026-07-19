'use client';

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type CreationFlow = 'post' | 'live' | null;

interface ContentCreationState {
  activeFlow: CreationFlow;
  isSpeedDialOpen: boolean;
  openPostModal: () => void;
  openGoLiveModal: () => void;
  closeAll: () => void;
  toggleSpeedDial: () => void;
  closeSpeedDial: () => void;
}

const ContentCreationContext = createContext<ContentCreationState | null>(null);

export function ContentCreationProvider({ children }: { children: ReactNode }) {
  const [activeFlow, setActiveFlow] = useState<CreationFlow>(null);
  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);

  const openPostModal = useCallback(() => {
    setActiveFlow('post');
    setIsSpeedDialOpen(false);
  }, []);

  const openGoLiveModal = useCallback(() => {
    setActiveFlow('live');
    setIsSpeedDialOpen(false);
  }, []);

  const closeAll = useCallback(() => {
    setActiveFlow(null);
    setIsSpeedDialOpen(false);
  }, []);

  const toggleSpeedDial = useCallback(() => {
    setIsSpeedDialOpen((prev) => !prev);
  }, []);

  const closeSpeedDial = useCallback(() => {
    setIsSpeedDialOpen(false);
  }, []);

  return (
    <ContentCreationContext.Provider
      value={{
        activeFlow,
        isSpeedDialOpen,
        openPostModal,
        openGoLiveModal,
        closeAll,
        toggleSpeedDial,
        closeSpeedDial,
      }}
    >
      {children}
    </ContentCreationContext.Provider>
  );
}

export function useContentCreation() {
  const ctx = useContext(ContentCreationContext);
  if (!ctx) {
    throw new Error('useContentCreation must be used within a ContentCreationProvider');
  }
  return ctx;
}