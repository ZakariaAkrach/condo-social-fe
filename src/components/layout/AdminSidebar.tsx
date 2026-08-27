import { Link, useLocation, useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    LayoutDashboard,
    Ticket,
    DollarSign,
    Truck,
    MessageSquare,
    Archive,
    Users,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Building2,
    HouseIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "motion/react"
import { logout } from "@/auth/logout"

interface SidebarProps {
    isCollapsed: boolean
    setIsCollapsed: (collapsed: boolean) => void
}

const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
    { icon: HouseIcon, label: "Condomini", path: "/admin/condomini" },
    { icon: Ticket, label: "Ticket", path: "/admin/tickets" },
    { icon: MessageSquare, label: "Comunicazioni", path: "/admin/posts" },
    { icon: Archive, label: "Archivio", path: "/admin/archive" },
    { icon: Users, label: "Residenti", path: "/admin/residents" },
    { icon: Settings, label: "Impostazioni", path: "/admin/settings" },
]

// Variante di animazione per i testi
const textVariants = {
    hidden: { opacity: 0, width: 0, marginRight: 0 },
    visible: { opacity: 1, width: "auto", marginRight: 8 },
}

export function AdminSidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
    const location = useLocation()
    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            await logout()
            navigate("/sign-in")
        } catch (error) {
            console.error("Errore durante il logout:", error)
        }
    }

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 70 : 240 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative flex h-full flex-col border-r border-border bg-card overflow-hidden"
        >
            {/* Logo */}
            <div className="flex h-16 items-center gap-2 px-4 border-b border-border overflow-hidden">
                <Building2 className="h-8 w-8 text-primary shrink-0" />
                <AnimatePresence mode="wait">
                    {!isCollapsed && (
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

            {/* Menu */}
            <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path
                    return (
                        <Tooltip key={item.path} delayDuration={0}>
                            <TooltipTrigger asChild>
                                <Link
                                    to={item.path}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <item.icon className="h-5 w-5 shrink-0" />
                                    <AnimatePresence mode="wait">
                                        {!isCollapsed && (
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
                                </Link>
                            </TooltipTrigger>
                            {isCollapsed && (
                                <TooltipContent side="right" className="text-sm">
                                    {item.label}
                                </TooltipContent>
                            )}
                        </Tooltip>
                    )
                })}
            </nav>

            {/* Footer: logout + toggle */}
            <div className="border-t border-border p-3 space-y-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground overflow-hidden"
                >
                    <LogOut className="h-5 w-5 shrink-0" />
                    <AnimatePresence mode="wait">
                        {!isCollapsed && (
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

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground overflow-hidden"
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-5 w-5 shrink-0" />
                    ) : (
                        <>
                            <ChevronLeft className="h-5 w-5 shrink-0" />
                            <AnimatePresence mode="wait">
                                {!isCollapsed && (
                                    <motion.span
                                        key="collapse-text"
                                        variants={textVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="hidden"
                                        transition={{ duration: 0.2, ease: "easeInOut" }}
                                        className="whitespace-nowrap"
                                    >
                                        Riduci menu
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </>
                    )}
                </Button>
            </div>
        </motion.aside>
    )
}