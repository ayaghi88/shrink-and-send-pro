
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
        <img 
          src="/lovable-uploads/5f5bf873-3f73-4660-9769-124e7507faff.png" 
          alt="Shrink & Send Logo" 
          className="w-10 h-10"
        />
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
