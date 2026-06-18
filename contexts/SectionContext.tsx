'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface SectionContextType {
  activeSection: string;
  setActiveSection: (section: string) => void;
  activeSkillCategory: number | null;
  setActiveSkillCategory: (category: number | null) => void;
}

const SectionContext = createContext<SectionContextType>({
  activeSection: 'hero',
  setActiveSection: () => {},
  activeSkillCategory: null,
  setActiveSkillCategory: () => {},
});

export function SectionProvider({ children }: { children: ReactNode }) {
  const [activeSection, setActiveSection] = useState('hero');
  const [activeSkillCategory, setActiveSkillCategory] = useState<number | null>(
    null
  );

  return (
    <SectionContext.Provider
      value={{
        activeSection,
        setActiveSection,
        activeSkillCategory,
        setActiveSkillCategory,
      }}
    >
      {children}
    </SectionContext.Provider>
  );
}

export function useSection() {
  return useContext(SectionContext);
}
