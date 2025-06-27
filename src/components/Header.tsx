
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const Header = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="w-full px-6 py-4 flex items-center justify-between bg-background/80 backdrop-blur-sm border-b border-border/50">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-electric-500 to-electric-600 rounded-lg flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-sm">S</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Shrink & Send</h1>
          <p className="text-xs text-muted-foreground">Professional compression meets one-click delivery</p>
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleDarkMode}
        className="rounded-lg"
      >
        {isDark ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </Button>
    </header>
  );
};

export default Header;
