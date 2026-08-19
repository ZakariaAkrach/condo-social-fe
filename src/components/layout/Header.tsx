import { Link } from "react-router";
import { Button } from "../ui/button";
import ThemeToggle from "../common/ThemeToggle";

export default function Header() {
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
                                My App
                            </span>
                            <span className="hidden text-xs text-muted-foreground sm:block">
                                La tua soluzione semplice e veloce
                            </span>
                        </span>
                    </Link>

                    <nav className="flex items-center gap-2">
                        <Button asChild variant="ghost">
                            <Link to="/sign-in">
                                Accedi
                            </Link>
                        </Button>

                        <Button asChild variant="outline" className="hidden sm:inline-flex">
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