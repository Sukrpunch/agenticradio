'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthModalContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType>({} as AuthModalContextType);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <AuthModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export const useAuthModal = () => useContext(AuthModalContext);
