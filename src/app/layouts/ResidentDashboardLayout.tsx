import { Outlet, useNavigate, useLocation } from "react-router";
import { Building2, ChevronDown, Home, FileText, Ticket, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/auth/AuthProvider";
import { CondominiumProvider, useCondominium } from "@/components/residentDashboard/CondominiumContext";

type Tab = "home" | "documents" | "tickets" | "posts";

// Componente interno che usa il contesto
function ResidentLayoutContent() {
  const { profile, loading } = useAuth();
  const { condominiumId, condominiumName, role, setCondominium } = useCondominium();
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = (path: string): Tab => {
    if (path.includes("/documents")) return "documents";
    if (path.includes("/tickets")) return "tickets";
    if (path.includes("/posts")) return "posts";
    return "home";
  };
  const activeTab = getActiveTab(location.pathname);

  const navigateToTab = (tab: Tab) => {
    navigate(`/resident/${tab === "home" ? "dashboard" : tab}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-primary">Caricamento...</div>
      </div>
    );
  }

  if (!profile || profile.memberships.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 text-center">
        <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">Nessun condominio associato</h2>
        <p className="text-muted-foreground">
          Non risulti membro di alcun condominio. Contatta l'amministratore per essere invitato.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header con selettore */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="h-5 w-5 text-primary shrink-0" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1 px-2 h-8 text-sm font-medium truncate max-w-[200px]">
                  <span className="truncate">{condominiumName || "Seleziona"}</span>
                  <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {profile.memberships.map((m) => (
                  <DropdownMenuItem
                    key={m.condominiumId}
                    onClick={() => setCondominium(m.condominiumId)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Building2 className="h-4 w-4" />
                    <span className="truncate flex-1">{m.condominiumName}</span>
                    {m.condominiumId === condominiumId && (
                      <span className="text-primary text-xs">✓</span>
                    )}
                    <span className="text-[10px] text-muted-foreground">
                      {m.role === "CONDO_ADMIN" ? "Admin" : ""}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="text-xs text-muted-foreground">
            {role === "CONDO_ADMIN" ? "Amministratore" : "Residente"}
          </div>
        </div>
      </header>

      {/* Contenuto */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Tab Bar */}
      <nav className="border-t bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky bottom-0 z-10">
        <div className="flex justify-around items-center max-w-7xl mx-auto px-2 py-1">
          {[
            { id: "home", label: "Home", icon: Home },
            { id: "documents", label: "Documenti", icon: FileText },
            { id: "tickets", label: "Ticket", icon: Ticket },
            { id: "posts", label: "Annunci", icon: Megaphone },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => navigateToTab(tab.id as Tab)}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors touch-manipulation",
                  "min-h-[56px] min-w-[64px]",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon
                  className={cn(
                    "h-6 w-6 transition-transform",
                    isActive && "scale-110"
                  )}
                />
                <span className="text-[10px] font-medium mt-0.5">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

// Componente esterno che fornisce il contesto
export function ResidentDashboardLayout() {
  return (
    <CondominiumProvider>
      <ResidentLayoutContent />
    </CondominiumProvider>
  );
}