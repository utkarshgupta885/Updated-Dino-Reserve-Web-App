import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from './ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      onClick={toggleTheme}
      variant="outline"
      size="icon"
      className="fixed top-6 right-6 z-50 bg-white dark:bg-gray-800 border-green-300 dark:border-green-700 hover:bg-green-50 dark:hover:bg-gray-700 transition-all"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-green-700 dark:text-green-400" />
      ) : (
        <Sun className="w-5 h-5 text-yellow-400" />
      )}
    </Button>
  );
}
