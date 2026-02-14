import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";

function getInitialTheme(): "light" | "dark" {
  const saved = localStorage.getItem("pharmsync.theme");
  if (saved === "dark" || saved === "light") return saved;
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
  return prefersDark ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(() => getInitialTheme());
  const isDark = useMemo(() => theme === "dark", [theme]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("pharmsync.theme", theme);
  }, [theme]);

  return (
    <Button
      type="button"
      variant="outline"
      className="rounded-xl"
      onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      data-testid="btn-theme-toggle"
    >
      {isDark ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
      <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
      <span className="sm:hidden">{isDark ? "Light" : "Dark"}</span>
    </Button>
  );
}
