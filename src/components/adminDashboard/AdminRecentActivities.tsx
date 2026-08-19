import { activityApi, type FetchActivityResponseDto } from "@/app/api/activity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Settings,
  FileText,
  Home,
  RefreshCw,
  Check,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { CondominiumDto } from "@/app/api/condominium";

// Mappa icone per tipo di attività (basata su entityType + activityType)
const getActivityIcon = (entityType: string, activityType: string) => {
  const key = `${entityType}_${activityType}`;
  
  const map: Record<string, { icon: any; bg: string; color: string }> = {
    // Utenti
    USER_CREATED: { icon: User, bg: "bg-emerald-500/15", color: "text-emerald-600" },
    USER_UPDATED: { icon: User, bg: "bg-amber-500/15", color: "text-amber-600" },
    USER_DELETED: { icon: User, bg: "bg-rose-500/15", color: "text-rose-600" },
    USER_LOGIN: { icon: User, bg: "bg-primary/15", color: "text-primary" },
    USER_LOGOUT: { icon: User, bg: "bg-muted/20", color: "text-muted-foreground" },
    
    // Condomini
    CONDOMINIUM_CREATED: { icon: Home, bg: "bg-emerald-500/15", color: "text-emerald-600" },
    CONDOMINIUM_UPDATED: { icon: Home, bg: "bg-amber-500/15", color: "text-amber-600" },
    CONDOMINIUM_DELETED: { icon: Home, bg: "bg-rose-500/15", color: "text-rose-600" },
    
    // Ticket
    TICKET_CREATED: { icon: MessageSquare, bg: "bg-primary/15", color: "text-primary" },
    TICKET_UPDATED: { icon: MessageSquare, bg: "bg-amber-500/15", color: "text-amber-600" },
    TICKET_CLOSED: { icon: CheckCircle, bg: "bg-emerald-500/15", color: "text-emerald-600" },
    
    // Post
    POST_CREATED: { icon: FileText, bg: "bg-primary/15", color: "text-primary" },
    POST_UPDATED: { icon: FileText, bg: "bg-amber-500/15", color: "text-amber-600" },
    POST_DELETED: { icon: FileText, bg: "bg-rose-500/15", color: "text-rose-600" },
    
    // Impostazioni
    SETTINGS_CHANGED: { icon: Settings, bg: "bg-muted/20", color: "text-muted-foreground" },
  };

  return map[key] || { icon: Clock, bg: "bg-muted/20", color: "text-muted-foreground" };
};

// Formatta il testo dell'attività
const formatActivityText = (activity: FetchActivityResponseDto) => {
  const { activityType, description, entityType } = activity;
  
  // Se c'è una descrizione, usala (è già formattata dal backend)
  if (description) {
    return description;
  }
  
  // Altrimenti costruisci un testo base
  const actionMap: Record<string, string> = {
    CREATED: "è stato creato",
    UPDATED: "è stato aggiornato",
    DELETED: "è stato eliminato",
    LOGIN: "ha effettuato l'accesso",
    LOGOUT: "ha effettuato il logout",
    CLOSED: "è stato chiuso",
    CHANGED: "è stato modificato",
  };
  
  const action = actionMap[activityType] || activityType.toLowerCase();
  const entity = entityType.toLowerCase();
  
  return `Un ${entity} ${action}`;
};

interface AdminRecentActivitiesProps {
  condominiums: CondominiumDto[];
  limit?: number;
}

export default function AdminRecentActivities({
  condominiums,
  limit = 10,
}: AdminRecentActivitiesProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activities, setActivities] = useState<FetchActivityResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Seleziona tutti i condomini all'avvio
  useEffect(() => {
    if (condominiums.length > 0) {
      setSelectedIds(condominiums.map((c) => c.id));
    }
  }, [condominiums]);

  // Carica le attività quando cambia la selezione
  const fetchActivities = useCallback(async () => {
    if (selectedIds.length === 0) {
      setActivities([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await activityApi.fetchActivities({
        condominiumIds: selectedIds,
        page: 0,
        size: limit,
        sortBy: "createdAt",
        ascending: false,
      });
      setActivities(response.data || []);
    } catch (err) {
      console.error("Error fetching activities:", err);
      setError("Impossibile caricare le attività recenti");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedIds, limit]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Gestione selezione
  const toggleCondominium = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === condominiums.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(condominiums.map((c) => c.id));
    }
  };

  // Refresh manuale
  const handleRefresh = () => {
    setRefreshing(true);
    fetchActivities();
  };

  // Formatta data
  const formatTimeAgo = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: it });
};

  // Stati di caricamento/vuoto
  if (loading && !refreshing) {
    return (
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-primary" />
            Attività recenti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 shadow-sm overflow-hidden">
      {/* Header con titolo e azioni */}
      <CardHeader className="pb-3 border-b border-border/40 bg-muted/5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-primary" />
            Attività recenti
            {selectedIds.length > 0 && (
              <span className="ml-2 text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {activities.length} eventi
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-1.5 rounded-md hover:bg-muted/60 transition-colors disabled:opacity-50"
              aria-label="Aggiorna"
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            </button>
            <button
              onClick={toggleAll}
              className="text-xs font-medium text-primary hover:underline"
            >
              {selectedIds.length === condominiums.length
                ? "Deseleziona tutti"
                : "Seleziona tutti"}
            </button>
          </div>
        </div>

        {/* Filtri a badge */}
        <div className="flex flex-wrap gap-1.5 pt-2">
          {condominiums.map((c) => {
            const isSelected = selectedIds.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggleCondominium(c.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {isSelected && <Check className="h-3 w-3" />}
                {c.name}
              </button>
            );
          })}
          {condominiums.length === 0 && (
            <span className="text-xs text-muted-foreground">Nessun condominio disponibile</span>
          )}
        </div>

        {/* Contatore selezionati */}
        <div className="text-[11px] text-muted-foreground/70 pt-0.5">
          {selectedIds.length} di {condominiums.length} selezionati
        </div>
      </CardHeader>

      <CardContent className="pt-4 pb-2">
        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {selectedIds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Home className="h-12 w-12 text-muted-foreground/20 mb-3" />
            <p className="text-sm text-muted-foreground">Nessun condominio selezionato</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Seleziona almeno un condominio per vedere le attività
            </p>
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground/20 mb-3" />
            <p className="text-sm text-muted-foreground">Nessuna attività recente</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Le attività appariranno qui non appena si verificheranno
            </p>
          </div>
        ) : (
          <div className="relative pl-2 pb-1">
            {/* Linea verticale della timeline */}
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/15 via-border/60 to-transparent" />

            <ul className="space-y-0">
              {activities.map((activity, idx) => {
                const { icon: Icon, bg, color } = getActivityIcon(
                  activity.entityType,
                  activity.activityType
                );
                const isLast = idx === activities.length - 1;

                return (
                  <li
                    key={idx}
                    className={cn(
                      "relative flex gap-4 pl-12",
                      !isLast && "pb-5"
                    )}
                  >
                    {/* Icona cerchio */}
                    <div
                      className={cn(
                        "absolute left-0 mt-1 flex items-center justify-center w-9 h-9 rounded-full border border-background shadow-sm transition-transform hover:scale-105",
                        bg
                      )}
                    >
                      <Icon className={cn("h-4 w-4", color)} />
                    </div>

                    {/* Contenuto */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-sm leading-relaxed text-foreground/90">
                        {formatActivityText(activity)}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-muted-foreground/70">
                        <span className="font-medium text-foreground/80">
                          {activity.condominiumName}
                        </span>
                        <span>•</span>
                        <span>{formatTimeAgo(activity.createdAt)}</span>
                        <span>•</span>
                        <span className="capitalize">
                          {activity.entityType.toLowerCase()}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Footer con refresh e conteggio */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30 text-[11px] text-muted-foreground/60">
              <span>
                Mostrati {activities.length} eventi
                {activities.length > 0 && ` · ultimo ${formatTimeAgo(activities[0].createdAt)}`}
              </span>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-1 text-primary/70 hover:text-primary transition-colors disabled:opacity-50"
              >
                <RefreshCw className={cn("h-3 w-3", refreshing && "animate-spin")} />
                Aggiorna
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}