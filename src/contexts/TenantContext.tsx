import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface TenantContextType {
  selectedTenantKey: string | null;
  setSelectedTenantKey: (key: string | null) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider = ({ children }: { children: ReactNode }) => {
  const [selectedTenantKey, setSelectedTenantKeyState] = useState<string | null>(() => {
    return localStorage.getItem('selectedTenantKey');
  });

  const setSelectedTenantKey = (key: string | null) => {
    setSelectedTenantKeyState(key);
    if (key) {
      localStorage.setItem('selectedTenantKey', key);
    } else {
      localStorage.removeItem('selectedTenantKey');
    }
  };

  return (
    <TenantContext.Provider value={{ selectedTenantKey, setSelectedTenantKey }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
