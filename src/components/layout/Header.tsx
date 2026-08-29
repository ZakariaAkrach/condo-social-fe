import { Link } from "react-router";
import { Button } from "../ui/button";
import ThemeToggle from "../common/ThemeToggle";
import { useAuth } from "@/auth/AuthProvider";

export default function Header() {
    const { user } = useAuth();
    const isLoggedIn = !!user;

    return (
        <header className="sticky top-0 z-20 bg-background/85 backdrop-blur-xl border-b">
            <div className="w-4/5 mx-auto">
                <div className="flex h-16 justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
                            A
                        </span>
                        <span>
                            <span className="block text-sm font-bold leading-4">
                                Condo Social
                            </span>
                            <span className="hidden text-xs text-muted-foreground sm:block">
                                Tutto il condominio, in un posto
                            </span>
                        </span>
                    </Link>

                    <nav className="flex items-center gap-2">
                        <Button
                            asChild
                            variant="ghost"
                            className={`relative ${
                                isLoggedIn ? "ring-1 ring-green-500/30" : ""
                            }`}
                            aria-label={
                                isLoggedIn
                                    ? "Sei autenticato"
                                    : "Accedi"
                            }
                        >
                            <Link to="/sign-in">
                                <span className="flex items-center gap-2">
                                    Accedi
                                    {isLoggedIn && (
                                        <span className="relative flex h-2.5 w-2.5">
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background"></span>
                                        </span>
                                    )}
                                </span>
                            </Link>
                        </Button>

                        <Button
                            asChild
                            variant="outline"
                            className="hidden sm:inline-flex"
                        >
                            <a href="#categories">
                                Inizia ora
                            </a>
                        </Button>

                        <ThemeToggle />
                    </nav>
                </div>
            </div>
        </header>
    );
}