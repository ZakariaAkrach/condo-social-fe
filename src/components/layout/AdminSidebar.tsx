import { Link, useLocation, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  Ticket,
  MessageSquare,
  Archive,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
  Home,
  User,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { logout } from "@/auth/logout";
import { useAuth } from "@/auth/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X } from "lucide-react";
import { useTheme } from "next-themes";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isMobile: boolean;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  { icon: Home, label: "Condomini", path: "/admin/condomini" },
  { icon: Ticket, label: "Ticket", path: "/admin/tickets" },
  { icon: MessageSquare, label: "Comunicazioni", path: "/admin/posts" },
  { icon: Archive, label: "Archivio", path: "/admin/archive" },
  { icon: Users, label: "Residenti", path: "/admin/residents" },
  { icon: Settings, label: "Impostazioni Mockata", path: "/admin/settings" },
];

const textVariants = {
  hidden: { opacity: 0, width: 0 },
  visible: { opacity: 1, width: "auto" },
};

export function AdminSidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  isMobile,
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/sign-in");
    } catch (error) {
      console.error("Errore durante il logout:", error);
    }
  };

  // Determina se mostrare il testo
  const showText = isMobile ? true : !isCollapsed;

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        <div className="flex items-center gap-2 overflow-hidden">
          <Building2 className="h-8 w-8 text-primary shrink-0" />
          <AnimatePresence mode="wait">
            {showText && (
              <motion.span
                key="logo-text"
                variants={textVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent whitespace-nowrap"
              >
                CondoConnect
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden"
            aria-label="Chiudi menu"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          const linkContent = (
            <>
              {isActive && (
                <motion.span
                  layoutId="active-pill"
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className="h-5 w-5 shrink-0" />
              <AnimatePresence mode="wait">
                {showText && (
                  <motion.span
                    key={`label-${item.path}`}
                    variants={textVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </>
          );

          // Su mobile, mostra sempre il testo completo
          if (isMobile) {
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {linkContent}
              </Link>
            );
          }

          // Su desktop, usa tooltip quando è collassato
          return (
            <Tooltip key={item.path} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {linkContent}
                </Link>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" className="text-sm">
                  {item.label}
                </TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </nav>

      {/* Footer: Profilo, Theme Toggle, Logout */}
      <div className="border-t border-border p-3 space-y-2">
        {/* User Profile */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src="/avatars/01.png" alt={profile?.firstName || "User"} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {profile?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <AnimatePresence mode="wait">
            {showText && (
              <motion.div
                key="profile-info"
                variants={textVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium truncate">
                  {profile?.firstName} {profile?.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {profile?.email}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5 shrink-0" />
          ) : (
            <Moon className="h-5 w-5 shrink-0" />
          )}
          <AnimatePresence mode="wait">
            {showText && (
              <motion.span
                key="theme-text"
                variants={textVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="whitespace-nowrap"
              >
                {theme === "dark" ? "Tema chiaro" : "Tema scuro"}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>

        {/* Logout */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <AnimatePresence mode="wait">
            {showText && (
              <motion.span
                key="logout-text"
                variants={textVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="whitespace-nowrap"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </Button>

        {/* Collapse Toggle (Desktop only) */}
        {!isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 shrink-0" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5 shrink-0" />
                {showText && <span className="whitespace-nowrap">Riduci menu</span>}
              </>
            )}
          </Button>
        )}
      </div>
    </>
  );

  // Mobile: slide-in sidebar
  if (isMobile) {
    return (
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            
            {/* Sidebar */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop: collapsible sidebar
  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 70 : 240 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative flex h-full flex-col border-r border-border bg-card overflow-hidden"
    >
      {sidebarContent}
    </motion.aside>
  );
}