"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface HeaderContextType {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: ReactNode;
  setHeaderConfig: (config: {
    title: string;
    icon?: React.ComponentType<{ className?: string }>;
    actions?: ReactNode;
  }) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

interface HeaderProviderProps {
  children: ReactNode;
}

export function HeaderProvider({ children }: HeaderProviderProps) {
  const [title, setTitle] = useState('Dashboard');
  const [icon, setIcon] = useState<React.ComponentType<{ className?: string }> | undefined>();
  const [actions, setActions] = useState<ReactNode>(null);

  const setHeaderConfig = ({
    title: newTitle,
    icon: newIcon,
    actions: newActions,
  }: {
    title: string;
    icon?: React.ComponentType<{ className?: string }>;
    actions?: ReactNode;
  }) => {
    setTitle(newTitle);
    setIcon(() => newIcon);
    setActions(newActions);
  };

  return (
    <HeaderContext.Provider
      value={{
        title,
        icon,
        actions,
        setHeaderConfig,
      }}
    >
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeader() {
  const context = useContext(HeaderContext);
  if (context === undefined) {
    throw new Error('useHeader must be used within a HeaderProvider');
  }
  return context;
}