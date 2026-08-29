import { Button } from "@/components/ui/button";
import { Menu, ArrowLeft, ExternalLink } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { cn } from "@/lib/utils";

interface HeaderProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  setIsMobileOpen: (open: boolean) => void;
}

export function AdminHeader({ isCollapsed, setIsCollapsed, setIsMobileOpen }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Funzione per tornare indietro
  const handleGoBack = () => {
    // Se c'è una history, torna indietro
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback: vai alla dashboard
      navigate("/admin/dashboard");
    }
  };

  // Determina se mostrare il pulsante indietro
  const showBackButton = location.pathname !== "/admin/dashboard";

  // Ottieni il titolo della pagina corrente
  const getPageTitle = () => {
    const path = location.pathname;
    const segments = path.split("/").filter(Boolean);
    
    // Mappa path a titoli leggibili
    const pathTitles: Record<string, string> = {
      admin: "Dashboard",
      dashboard: "Dashboard",
      condomini: "Condomini",
      tickets: "Ticket",
      posts: "Comunicazioni",
      documenti: "Documenti",
      archive: "Archivio",
      residents: "Residenti",
      settings: "Impostazioni",
      "nuovo-condominio": "Nuovo Condominio",
      "create": "Nuova Comunicazione",
    };

    // Cerca l'ultimo segmento significativo
    for (let i = segments.length - 1; i >= 0; i--) {
      const segment = segments[i];
      
      // Salta gli ID
      if (/^[0-9a-f-]{8,}$/i.test(segment) || /^\d+$/.test(segment)) {
        continue;
      }
      
      if (pathTitles[segment]) {
        return pathTitles[segment];
      }
      
      // Se non trovato nella mappa, capitalizza
      return segment.charAt(0).toUpperCase() + segment.slice(1);
    }
    
    return "Dashboard";
  };

  const pageTitle = getPageTitle();

  return (
    <header className="sticky top-0 z-40 flex h-14 sm:h-16 items-center justify-between border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-3 sm:px-4 md:px-6">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden text-muted-foreground hover:text-foreground shrink-0 h-9 w-9"
          aria-label="Apri menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Desktop collapse button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:inline-flex text-muted-foreground hover:text-foreground shrink-0 h-9 w-9"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Back button */}
        {showBackButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="text-muted-foreground hover:text-foreground h-9 px-2 sm:px-3 gap-1.5"
            aria-label="Torna indietro"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Indietro</span>
          </Button>
        )}

        {/* Page title */}
        <div className="flex items-center min-w-0">
          <h1 className="text-sm sm:text-base font-semibold text-foreground truncate">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Right side - clean, no clutter */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2">
        {/* Quick actions */}
        <Button
          variant="ghost"
          size="sm"
          className="hidden sm:inline-flex text-muted-foreground hover:text-foreground h-9 px-2 sm:px-3"
        >
          <ExternalLink className="h-4 w-4 mr-1.5" />
          <span className="hidden md:inline">Supporto</span>
        </Button>
      </div>
    </header>
  );
}