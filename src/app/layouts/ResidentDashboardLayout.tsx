// src/components/layout/ResidentDashboardLayout.tsx
import { Outlet, useNavigate, useLocation } from "react-router";
import { 
  Building2, 
  ChevronDown, 
  Home, 
  FileText, 
  Ticket,
  Check,
  LogOut,
  User,
} from "lucide-react";
import { logout } from "@/auth/logout";
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
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { NotificationBell } from "@/components/common/NotificationBell";
import { NotificationProvider } from "@/components/common/NotificationContext";

type Tab = "home" | "documents" | "tickets";

function ResidentLayoutContent() {
  const { profile, loading } = useAuth();
  const { condominiumId, condominiumName, role, setCondominium } = useCondominium();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const getActiveTab = (path: string): Tab => {
    if (path.includes("/documents")) return "documents";
    if (path.includes("/tickets")) return "tickets";
    return "home";
  };
  const activeTab = getActiveTab(location.pathname);

  const navigateToTab = (tab: Tab) => {
    navigate(`/resident/${tab === "home" ? "dashboard" : tab}`);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/sign-in");
    } catch (error) {
      console.error("Errore durante il logout:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!profile || profile.memberships.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Building2 className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold mb-2">Nessun condominio associato</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          Non risulti membro di alcun condominio. Contatta l'amministratore per essere invitato.
        </p>
      </div>
    );
  }

  return (
    <NotificationProvider isAdmin={false}>
      <div className="flex h-screen flex-col bg-background">
        {/* Header */}
        <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-20">
          <div className="flex items-center justify-between px-4 py-3 max-w-4xl mx-auto">
            {/* Selettore condominio */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="rounded-lg bg-primary/10 p-1.5 shrink-0">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-1.5 px-2 h-9 text-sm font-medium truncate max-w-[180px] sm:max-w-[250px]"
                  >
                    <span className="truncate">{condominiumName || "Seleziona"}</span>
                    <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 p-1">
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase">
                    I tuoi condomini
                  </div>
                  {profile.memberships.map((m) => (
                    <DropdownMenuItem
                      key={m.condominiumId}
                      onClick={() => setCondominium(m.condominiumId)}
                      className="flex items-center gap-2 cursor-pointer rounded-lg px-2 py-2"
                    >
                      <Building2 className="h-4 w-4 shrink-0" />
                      <span className="truncate flex-1 text-sm">{m.condominiumName}</span>
                      {m.condominiumId === condominiumId && (
                        <Check className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Right side - con campanella */}
            <div className="flex items-center gap-2 shrink-0">
              {/* 🔔 Campanella notifiche - modalità residente */}
              <NotificationBell isAdmin={false} />

              <Badge variant={role === "CONDO_ADMIN" ? "default" : "outline"} className="text-[10px] gap-1 hidden sm:flex">
                <User className="h-3 w-3" />
                <span className="hidden sm:inline">
                  {role === "CONDO_ADMIN" ? "Amministratore" : "Residente"}
                </span>
              </Badge>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          </div>
        </header>

        {/* Contenuto */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
            <Outlet />
          </div>
        </main>

        {/* Bottom Tab Bar */}
        <nav className="border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky bottom-0 z-20 safe-area-bottom">
          <div className="flex justify-around items-center max-w-4xl mx-auto px-2">
            {[
              { id: "home", label: "Home", icon: Home },
              { id: "documents", label: "Documenti", icon: FileText },
              { id: "tickets", label: "Ticket", icon: Ticket },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => navigateToTab(tab.id as Tab)}
                  className={cn(
                    "flex flex-col items-center justify-center py-2 px-2 rounded-xl transition-all duration-200 touch-manipulation",
                    "min-h-[56px] flex-1 max-w-[100px]",
                    "active:scale-95",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className={cn(
                    "rounded-xl p-1.5 transition-all",
                    isActive && "bg-primary/10"
                  )}>
                    <tab.icon
                      className={cn(
                        "h-5 w-5 transition-transform",
                        isActive && "scale-110"
                      )}
                    />
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium mt-0.5",
                    isActive && "font-semibold"
                  )}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </NotificationProvider>
  );
}

export function ResidentDashboardLayout() {
  return (
    <CondominiumProvider>
      <ResidentLayoutContent />
    </CondominiumProvider>
  );
}