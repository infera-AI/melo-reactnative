import React, { createContext, useContext } from 'react';
import RootStore from './RootStore';

const rootStore = new RootStore();
const StoreContext = createContext<RootStore>(rootStore);

interface StoreProviderProps {
  children: React.ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  return (
    <StoreContext.Provider value={rootStore}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStores = () => {
  const stores = useContext(StoreContext);
  if (!stores) {
    throw new Error('useStores must be used within a StoreProvider');
  }
  return stores;
}; 