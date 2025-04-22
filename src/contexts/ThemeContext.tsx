import { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Custom hook for using theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Provider component
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Try to get saved theme or default to system preference
  const getInitialTheme = (): Theme => {
    const savedTheme = localStorage.getItem('skillnet_theme') as Theme | null;
    
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  };
  
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  
  useEffect(() => {
    // Apply theme to document element
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save theme preference
    localStorage.setItem('skillnet_theme', theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };
  
  const value = {
    theme,
    toggleTheme
  };
  
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};