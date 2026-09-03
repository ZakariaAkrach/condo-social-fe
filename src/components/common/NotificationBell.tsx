// src/components/common/NotificationBell.tsx
import { useState, useEffect, type JSX } from "react";
import { useLocation, useNavigate } from "react-router";
import { Bell, X, BellOff, Building2, ChevronRight, Ticket, FileText, Megaphone, Paperclip, UserCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { type NotificationResponse } from "@/app/api/notification";
import { toast } from "sonner";
import { cn, formatDistanceToNow } from "@/lib/utils";
import { useNotifications } from "./NotificationContext";

interface NotificationBellProps {
  isAdmin?: boolean;
}

export function NotificationBell({ isAdmin = false }: NotificationBellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    notifications, 
    unreadCount, 
    loading, 
    fetchNotifications, 
    markAsRead,
    groupedNotifications,
    totalElements,
    hasMore,
    refreshUnreadCount,
  } = useNotifications();

  const [open, setOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>("all");

  // Controlla se sei sulla pagina delle notifiche
  const isOnNotificationsPage = location.pathname.includes('/notifiche');

  // Quando il popover si apre, fetch delle notifiche
  useEffect(() => {
    if (open && !isOnNotificationsPage) {
      fetchNotifications(true);
      refreshUnreadCount(); // 🔥 Aggiorna anche il conteggio
    }
  }, [open, isOnNotificationsPage, fetchNotifications, refreshUnreadCount]);

  const handleNotificationClick = async (notification: NotificationResponse) => {
    const type = notification.notificationType;
    const actionId = notification.actionId;
    const condoId = notification.condominiumId;

    if (!actionId) {
      setOpen(false);
      navigate(isAdmin ? "/admin/dashboard" : "/resident/dashboard");
      return;
    }

    if (!notification.read) {
      await markAsRead(notification.id, notification.condominiumId);
      toast.success("Notifica letta", { duration: 1500 });
    }

    const navigateTo = () => {
      if (type.startsWith("TICKET")) {
        return isAdmin
          ? `/admin/condomini/${condoId}/tickets/${actionId}`
          : `/resident/ticket/${actionId}`;
      }
      if (type.startsWith("DOCUMENT")) {
        return isAdmin
          ? `/admin/condomini/${condoId}/documenti/${actionId}`
          : `/resident/document/${actionId}`;
      }
      if (type.startsWith("POST")) {
        return isAdmin
          ? `/admin/condomini/${condoId}/posts/${actionId}`
          : `/resident/post/${actionId}`;
      }
      return isAdmin ? "/admin/dashboard" : "/resident/dashboard";
    };

    setOpen(false);
    navigate(navigateTo());
  };

  const getNotificationIcon = (type: string): JSX.Element => {
    if (type.startsWith("TICKET")) return <Ticket className="h-4 w-4" />;
    if (type.startsWith("DOCUMENT")) return <FileText className="h-4 w-4" />;
    if (type.startsWith("POST")) return <Megaphone className="h-4 w-4" />;
    if (type === "TICKET_UPLOAD_DOCUMENT") return <Paperclip className="h-4 w-4" />;
    if (type === "TICKET_ADMIN_ASSIGN") return <UserCheck className="h-4 w-4" />;
    return <Bell className="h-4 w-4" />;
  };

  const getNotificationColor = (type: string) => {
    if (type.startsWith("TICKET")) return "bg-amber-500/10 text-amber-600";
    if (type.startsWith("DOCUMENT")) return "bg-blue-500/10 text-blue-600";
    if (type.startsWith("POST")) return "bg-purple-500/10 text-purple-600";
    if (type === "TICKET_UPLOAD_DOCUMENT") return "bg-indigo-500/10 text-indigo-600";
    if (type === "TICKET_ADMIN_ASSIGN") return "bg-emerald-500/10 text-emerald-600";
    return "bg-gray-500/10 text-gray-600";
  };

  const getFilteredNotifications = () => {
    if (selectedTab === "all") {
      return notifications;
    }
    const group = groupedNotifications.find((g) => g.condominiumId === selectedTab);
    return group?.notifications || [];
  };

  const displayUnreadCount = unreadCount > 99 ? "99+" : unreadCount;

  // Se sei sulla pagina delle notifiche, nascondi la campanella
  if (isOnNotificationsPage) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative h-9 w-9 rounded-full hover:bg-muted transition-all duration-200",
            unreadCount > 0 && "hover:scale-105"
          )}
          aria-label="Notifiche"
        >
          <Bell className={cn(
            "h-5 w-5 transition-all duration-200",
            unreadCount > 0 ? "text-primary" : "text-muted-foreground"
          )} />

          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className={cn(
                "absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center",
                "text-[10px] font-bold leading-none",
                "animate-in fade-in zoom-in duration-200",
                unreadCount > 99 && "px-1.5"
              )}
            >
              {displayUnreadCount}
            </Badge>
          )}

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full animate-ping bg-destructive/20" />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[440px] p-0 max-h-[85vh] flex flex-col shadow-2xl border-0 overflow-hidden rounded-xl max-w-[95vw] sm:max-w-[440px]"
        sideOffset={8}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Bell className="h-5 w-5 text-primary" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-destructive animate-pulse" />
                )}
              </div>
              <div>
                <span className="font-semibold text-sm">
                  {isAdmin ? "Notifiche" : "Le tue notifiche"}
                </span>
                {totalElements > 0 && (
                  <span className="text-xs text-muted-foreground ml-2">
                    ({totalElements})
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs per condomini */}
        {groupedNotifications.length > 1 && (
          <div className="px-4 pt-3 pb-2 border-b bg-muted/30 shrink-0 overflow-x-auto">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="w-full h-auto flex flex-nowrap gap-1 bg-transparent p-0 min-w-max">
                <TabsTrigger
                  value="all"
                  className="flex-shrink-0 text-xs h-8 px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none rounded-lg"
                >
                  Tutti
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-1.5 h-4 px-1 text-[8px]">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                {groupedNotifications.map((group) => (
                  <TabsTrigger
                    key={group.condominiumId}
                    value={group.condominiumId}
                    className="flex-shrink-0 text-xs h-8 px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none rounded-lg gap-1.5"
                  >
                    <Building2 className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate max-w-[60px]">{group.condominiumName}</span>
                    {group.unreadCount > 0 && (
                      <Badge variant="destructive" className="h-4 px-1 text-[8px]">
                        {group.unreadCount > 99 ? "99+" : group.unreadCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        )}

        {/* Lista notifiche */}
        <div className="relative flex-1 min-h-0">
          <ScrollArea className="h-[calc(85vh-180px)] sm:h-[calc(85vh-200px)] max-h-[400px]">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center h-40">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Caricamento...</span>
                </div>
              </div>
            ) : getFilteredNotifications().length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-3">
                <div className="rounded-full bg-muted/50 p-4">
                  <BellOff className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-sm">Nessuna notifica</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isAdmin ? "Non ci sono notifiche" : "Non hai nuove notifiche"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border/50 pb-2">
                {getFilteredNotifications().map((notification, index) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "group relative flex items-start gap-3 p-4 cursor-pointer transition-all duration-200",
                      "hover:bg-muted/50",
                      !notification.read && "bg-primary/5 hover:bg-primary/10",
                      index === 0 && !notification.read && "border-l-4 border-l-primary"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {/* Icona */}
                    <div className="relative flex-shrink-0">
                      <div className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full",
                        getNotificationColor(notification.notificationType)
                      )}>
                        {getNotificationIcon(notification.notificationType)}
                      </div>
                      {!notification.read && (
                        <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-primary ring-2 ring-background ring-offset-1 animate-pulse shadow-sm" />
                      )}
                    </div>

                    {/* Contenuto */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn(
                          "text-sm leading-tight",
                          !notification.read ? "font-semibold text-foreground" : "text-muted-foreground"
                        )}>
                          {notification.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5 flex-shrink-0">
                          {formatDistanceToNow(new Date(notification.createdAt))}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground/80 line-clamp-2 mt-1 leading-relaxed">
                        {notification.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        {isAdmin && (
                          <Badge variant="outline" className="text-[8px] px-1.5 py-0 h-4 bg-muted/50">
                            {groupedNotifications.find(
                              (g) => g.condominiumId === notification.condominiumId
                            )?.condominiumName}
                          </Badge>
                        )}
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-primary animate-pulse shrink-0" />
                        )}
                      </div>
                    </div>

                    {/* Freccia hover */}
                    <div className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}

                {hasMore && (
                  <div className="p-3 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => fetchNotifications(false)}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                      ) : null}
                      {loading ? "Caricamento..." : "Carica altre notifiche"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="shrink-0 border-t bg-background/95 backdrop-blur-sm">
            <div className="p-4 text-center">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs text-muted-foreground hover:text-foreground h-9"
                onClick={() => {
                  setOpen(false);
                  navigate(isAdmin ? "/admin/notifiche" : "/resident/notifiche");
                }}
              >
                <span>Vedi tutte le notifiche</span>
                <ChevronRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}