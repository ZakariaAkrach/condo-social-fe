import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "../ui/button";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="relative"
        >
            {/* SUN */}
            <Sun
                className={`h-5 w-5 transition-all duration-300 ${isDark
                        ? "scale-0 rotate-90 opacity-0"
                        : "scale-100 rotate-0 opacity-100"
                    }`}
            />

            {/* MOON */}
            <Moon
                className={`absolute h-5 w-5 transition-all duration-300 ${isDark
                        ? "scale-100 rotate-0 opacity-100"
                        : "scale-0 -rotate-90 opacity-0"
                    }`}
            />

            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}