import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      data-testid="button-theme-toggle"
      className="relative"
    >
      <Sun className={`h-5 w-5 transition-all ${theme === "dark" ? "scale-0 opacity-0" : "scale-100 opacity-100"}`} />
      <Moon className={`absolute h-5 w-5 transition-all ${theme === "dark" ? "scale-100 opacity-100" : "scale-0 opacity-0"}`} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
