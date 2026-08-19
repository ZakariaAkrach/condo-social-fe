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
  ChevronDown,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { CondominiumDto } from "@/app/api/condominium";

// Mappa icone (supporta tutti i tipi)
const getActivityIcon = (entityType: string, activityType: string) => {
  const key = `${entityType}_${activityType}`;
  const map: Record<string, { icon: any; bg: string; color: string }> = {
    USER_CREATED: { icon: User, bg: "bg-emerald-500/15", color: "text-emerald-600" },
    USER_UPDATED: { icon: User, bg: "bg-amber-500/15", color: "text-amber-600" },
    USER_DELETED: { icon: User, bg: "bg-rose-500/15", color: "text-rose-600" },
    USER_LOGIN: { icon: User, bg: "bg-primary/15", color: "text-primary" },
    USER_LOGOUT: { icon: User, bg: "bg-muted/20", color: "text-muted-foreground" },
    USER_JOINED: { icon: User, bg: "bg-emerald-500/15", color: "text-emerald-600" },
    USER_LEFT: { icon: User, bg: "bg-rose-500/15", color: "text-rose-600" },
    USER_REMOVED: { icon: User, bg: "bg-rose-500/15", color: "text-rose-600" },
    USER_ROLE_CHANGED: { icon: User, bg: "bg-amber-500/15", color: "text-amber-600" },

    CONDOMINIUM_CREATED: { icon: Home, bg: "bg-emerald-500/15", color: "text-emerald-600" },
    CONDOMINIUM_UPDATED: { icon: Home, bg: "bg-amber-500/15", color: "text-amber-600" },
    CONDOMINIUM_DELETED: { icon: Home, bg: "bg-rose-500/15", color: "text-rose-600" },

    TICKET_CREATED: { icon: MessageSquare, bg: "bg-primary/15", color: "text-primary" },
    TICKET_UPDATED: { icon: MessageSquare, bg: "bg-amber-500/15", color: "text-amber-600" },
    TICKET_CLOSED: { icon: CheckCircle, bg: "bg-emerald-500/15", color: "text-emerald-600" },
    TICKET_OPENED: { icon: MessageSquare, bg: "bg-primary/15", color: "text-primary" },
    TICKET_REOPENED: { icon: MessageSquare, bg: "bg-amber-500/15", color: "text-amber-600" },
    TICKET_ASSIGNED: { icon: MessageSquare, bg: "bg-amber-500/15", color: "text-amber-600" },
    TICKET_COMMENTED: { icon: MessageSquare, bg: "bg-primary/15", color: "text-primary" },

    POST_CREATED: { icon: FileText, bg: "bg-primary/15", color: "text-primary" },
    POST_UPDATED: { icon: FileText, bg: "bg-amber-500/15", color: "text-amber-600" },
    POST_DELETED: { icon: FileText, bg: "bg-rose-500/15", color: "text-rose-600" },
    POST_POSTED: { icon: FileText, bg: "bg-primary/15", color: "text-primary" },
    POST_EDITED_POST: { icon: FileText, bg: "bg-amber-500/15", color: "text-amber-600" },
    POST_DELETED_POST: { icon: FileText, bg: "bg-rose-500/15", color: "text-rose-600" },

    DOCUMENT_UPLOADED: { icon: FileText, bg: "bg-primary/15", color: "text-primary" },
    DOCUMENT_UPDATED_VERSION: { icon: FileText, bg: "bg-amber-500/15", color: "text-amber-600" },
    DOCUMENT_DELETED_DOCUMENT: { icon: FileText, bg: "bg-rose-500/15", color: "text-rose-600" },

    SETTINGS_CHANGED: { icon: Settings, bg: "bg-muted/20", color: "text-muted-foreground" },

    INVITE_INVITED: { icon: User, bg: "bg-primary/15", color: "text-primary" },
    INVITE_ACCEPTED_INVITE: { icon: User, bg: "bg-emerald-500/15", color: "text-emerald-600" },
    INVITE_DECLINED_INVITE: { icon: User, bg: "bg-rose-500/15", color: "text-rose-600" },

    SUBSCRIPTION_SUBSCRIPTION_STARTED: { icon: Settings, bg: "bg-primary/15", color: "text-primary" },
    SUBSCRIPTION_SUBSCRIPTION_CANCELLED: { icon: Settings, bg: "bg-rose-500/15", color: "text-rose-600" },
    PAYMENT_PAYMENT_RECEIVED: { icon: Settings, bg: "bg-emerald-500/15", color: "text-emerald-600" },
  };
  return map[key] || { icon: Clock, bg: "bg-muted/20", color: "text-muted-foreground" };
};

// Formatta il testo dell'attività
const formatActivityText = (activity: FetchActivityResponseDto) => {
  const { activityType, description, entityType } = activity;
  if (description) return description;

  const actionMap: Record<string, string> = {
    CREATED: "è stato creato",
    UPDATED: "è stato aggiornato",
    DELETED: "è stato eliminato",
    ARCHIVED: "è stato archiviato",
    RESTORED: "è stato ripristinato",
    INVITED: "è stato invitato",
    ACCEPTED_INVITE: "ha accettato l'invito",
    DECLINED_INVITE: "ha rifiutato l'invito",
    JOINED: "si è unito",
    LEFT: "ha lasciato",
    REMOVED: "è stato rimosso",
    ROLE_CHANGED: "ha cambiato ruolo",
    OPENED: "è stato aperto",
    CLOSED: "è stato chiuso",
    REOPENED: "è stato riaperto",
    ASSIGNED: "è stato assegnato",
    COMMENTED: "ha commentato",
    POSTED: "ha pubblicato",
    EDITED_POST: "ha modificato un post",
    DELETED_POST: "ha eliminato un post",
    UPLOADED: "è stato caricato",
    UPDATED_VERSION: "ha aggiornato la versione",
    DELETED_DOCUMENT: "ha eliminato il documento",
    SUBSCRIPTION_STARTED: "abbonamento iniziato",
    SUBSCRIPTION_CANCELLED: "abbonamento cancellato",
    PAYMENT_RECEIVED: "pagamento ricevuto",
  };
  const action = actionMap[activityType] || activityType.toLowerCase();
  const entity = entityType.toLowerCase();
  return `Un ${entity} ${action}`;
};

interface AdminRecentActivitiesProps {
  condominiums: CondominiumDto[];
  limit?: number; // numero di eventi per pagina (anteprima)
}

export default function AdminRecentActivities({
  condominiums,
  limit = 5,
}: AdminRecentActivitiesProps) {
  // Filtri condominio
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filtri aggiuntivi
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>("");
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("");
  const [descriptionFilter, setDescriptionFilter] = useState<string>("");
  const [fromDateFilter, setFromDateFilter] = useState<string>("");
  const [toDateFilter, setToDateFilter] = useState<string>("");

  // Stato per la lista (accumulata)
  const [activities, setActivities] = useState<FetchActivityResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Metadati paginazione
  const [currentPage, setCurrentPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);

  // Flag per sapere se la lista è espansa (più di una pagina)
  const [isExpanded, setIsExpanded] = useState(false);

  // Seleziona tutti i condomini all'avvio
  useEffect(() => {
    if (condominiums.length > 0) {
      setSelectedIds(condominiums.map((c) => c.id));
    }
  }, [condominiums]);

  // Resetta la paginazione
  const resetPagination = useCallback(() => {
    setActivities([]);
    setCurrentPage(0);
    setTotalElements(0);
    setIsLastPage(false);
    setIsExpanded(false);
  }, []);

  // Carica una pagina specifica
  const fetchPage = useCallback(
    async (page: number, append: boolean = false) => {
      if (selectedIds.length === 0) {
        setActivities([]);
        setLoading(false);
        return;
      }

      // Se siamo già all'ultima pagina e non è la prima, non fare nulla
      if (isLastPage && page > 0) {
        return;
      }

      try {
        if (page === 0) setLoading(true);
        else setLoadingMore(true);

        const params: any = {
          condominiumIds: selectedIds,
          page,
          size: limit,
          sortBy: "createdAt",
          ascending: false,
        };

        if (activityTypeFilter) params.activityType = activityTypeFilter;
        if (entityTypeFilter) params.entityType = entityTypeFilter;
        if (descriptionFilter) params.description = descriptionFilter;
        if (fromDateFilter) params.fromCreatedAt = `${fromDateFilter}T00:00:00`;
        if (toDateFilter) params.toCreatedAt = `${toDateFilter}T23:59:59`;

        const response = await activityApi.fetchActivities(params);

        setTotalElements(response.totalElements);
        // CORREZIONE: usa response.lastPage (non response.last)
        setIsLastPage(response.lastPage);

        if (append) {
          setActivities((prev) => [...prev, ...response.data]);
        } else {
          setActivities(response.data);
        }

        // Se abbiamo caricato una pagina > 0, consideriamo espanso
        if (page > 0) setIsExpanded(true);

        setError(null);
      } catch (err) {
        console.error("Error fetching activities:", err);
        setError("Impossibile caricare le attività recenti");
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [
      selectedIds,
      limit,
      activityTypeFilter,
      entityTypeFilter,
      descriptionFilter,
      fromDateFilter,
      toDateFilter,
      isLastPage,
    ]
  );

  // Carica la prima pagina (reset)
  const loadFirstPage = useCallback(() => {
    resetPagination();
    fetchPage(0, false);
  }, [fetchPage, resetPagination]);

  // Carica la pagina successiva
  const loadNextPage = useCallback(() => {
    if (isLastPage || loadingMore) return;
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchPage(nextPage, true);
  }, [currentPage, isLastPage, loadingMore, fetchPage]);

  // Ricarica quando cambiano i condomini selezionati
  useEffect(() => {
    loadFirstPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds]);

  // Ricarica quando cambiano i filtri
  useEffect(() => {
    if (selectedIds.length > 0) {
      loadFirstPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityTypeFilter, entityTypeFilter, descriptionFilter, fromDateFilter, toDateFilter]);

  // Polling automatico (solo se non espanso e non è ultima pagina)
  useEffect(() => {
    if (isExpanded || isLastPage) return;

    const interval = setInterval(() => {
      loadFirstPage();
    }, 5 * 60 * 1000); // 5 minuti

    return () => clearInterval(interval);
  }, [isExpanded, isLastPage, loadFirstPage]);

  // Gestione refresh manuale
  const handleRefresh = () => {
    setRefreshing(true);
    loadFirstPage();
  };

  // Gestione selezione condominio
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

  const applyFilters = () => loadFirstPage();

  const resetFilters = () => {
    setActivityTypeFilter("");
    setEntityTypeFilter("");
    setDescriptionFilter("");
    setFromDateFilter("");
    setToDateFilter("");
    loadFirstPage();
  };

  const formatTimeAgo = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: it });
  };

  // Stati di caricamento iniziale
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
      <CardHeader className="pb-3 border-b border-border/40 bg-muted/5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-primary" />
            Attività recenti
            {selectedIds.length > 0 && (
              <span className="ml-2 text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {activities.length} {totalElements > 0 && `di ${totalElements}`} eventi
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

        {/* Filtri condominio (badge) */}
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
        <div className="text-[11px] text-muted-foreground/70 pt-0.5">
          {selectedIds.length} di {condominiums.length} selezionati
        </div>

        {/* Filtri aggiuntivi */}
        <div className="mt-3 pt-2 border-t border-border/30 flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="activityType" className="text-xs font-medium text-muted-foreground block mb-0.5">
              Tipo evento
            </label>
            <select
              id="activityType"
              value={activityTypeFilter}
              onChange={(e) => setActivityTypeFilter(e.target.value)}
              className="h-8 rounded-md border border-border/50 bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Tutti</option>
              <option value="CREATED">Creato</option>
              <option value="UPDATED">Aggiornato</option>
              <option value="DELETED">Eliminato</option>
              <option value="ARCHIVED">Archiviato</option>
              <option value="RESTORED">Ripristinato</option>
              <option value="INVITED">Invitato</option>
              <option value="ACCEPTED_INVITE">Invito accettato</option>
              <option value="DECLINED_INVITE">Invito rifiutato</option>
              <option value="JOINED">Unito</option>
              <option value="LEFT">Lasciato</option>
              <option value="REMOVED">Rimosso</option>
              <option value="ROLE_CHANGED">Ruolo cambiato</option>
              <option value="OPENED">Aperto</option>
              <option value="CLOSED">Chiuso</option>
              <option value="REOPENED">Riaperto</option>
              <option value="ASSIGNED">Assegnato</option>
              <option value="COMMENTED">Commentato</option>
              <option value="POSTED">Pubblicato</option>
              <option value="EDITED_POST">Post modificato</option>
              <option value="DELETED_POST">Post eliminato</option>
              <option value="UPLOADED">Caricato</option>
              <option value="UPDATED_VERSION">Versione aggiornata</option>
              <option value="DELETED_DOCUMENT">Documento eliminato</option>
              <option value="SUBSCRIPTION_STARTED">Abbonamento iniziato</option>
              <option value="SUBSCRIPTION_CANCELLED">Abbonamento cancellato</option>
              <option value="PAYMENT_RECEIVED">Pagamento ricevuto</option>
            </select>
          </div>

          <div>
            <label htmlFor="entityType" className="text-xs font-medium text-muted-foreground block mb-0.5">
              Entità
            </label>
            <select
              id="entityType"
              value={entityTypeFilter}
              onChange={(e) => setEntityTypeFilter(e.target.value)}
              className="h-8 rounded-md border border-border/50 bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Tutte</option>
              <option value="CONDOMINIUM">Condominio</option>
              <option value="USER">Utente</option>
              <option value="INVITE">Invito</option>
              <option value="TICKET">Ticket</option>
              <option value="POST">Post</option>
              <option value="DOCUMENT">Documento</option>
              <option value="DOCUMENT_VERSION">Versione documento</option>
              <option value="SUBSCRIPTION">Abbonamento</option>
              <option value="PAYMENT">Pagamento</option>
            </select>
          </div>

          <div>
            <label htmlFor="description" className="text-xs font-medium text-muted-foreground block mb-0.5">
              Descrizione
            </label>
            <input
              id="description"
              type="text"
              value={descriptionFilter}
              onChange={(e) => setDescriptionFilter(e.target.value)}
              placeholder="Cerca nella descrizione..."
              className="h-8 w-40 rounded-md border border-border/50 bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="fromDate" className="text-xs font-medium text-muted-foreground block mb-0.5">
              Da data
            </label>
            <input
              id="fromDate"
              type="date"
              value={fromDateFilter}
              onChange={(e) => setFromDateFilter(e.target.value)}
              className="h-8 rounded-md border border-border/50 bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="toDate" className="text-xs font-medium text-muted-foreground block mb-0.5">
              A data
            </label>
            <input
              id="toDate"
              type="date"
              value={toDateFilter}
              onChange={(e) => setToDateFilter(e.target.value)}
              className="h-8 rounded-md border border-border/50 bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={applyFilters}
              className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
            >
              Applica filtri
            </button>
            <button
              onClick={resetFilters}
              className="h-8 px-3 rounded-md bg-muted/60 text-muted-foreground text-xs font-medium hover:bg-muted transition-colors"
            >
              Resetta
            </button>
          </div>
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
            {/* Contenitore della timeline con altezza massima e scroll */}
            <div className="max-h-72 overflow-y-auto pr-2">
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
                      key={`${activity.createdAt}-${idx}`}
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

              {/* Pulsante "Mostra altri" o messaggio "Lista completa" */}
              <div className="mt-3 text-center">
                {!isLastPage ? (
                  <button
                    onClick={loadNextPage}
                    disabled={loadingMore}
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                      "bg-primary/5 text-primary hover:bg-primary/10 border border-primary/20",
                      "disabled:opacity-60 disabled:cursor-not-allowed"
                    )}
                  >
                    {loadingMore ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Caricando...
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Mostra altri eventi
                      </>
                    )}
                  </button>
                ) : (
                  activities.length > 0 && (
                    <p className="text-xs text-muted-foreground/70 py-2 flex items-center justify-center gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                      Tutti gli eventi sono stati caricati
                    </p>
                  )
                )}
              </div>
            </div>

            {/* Footer con info e refresh */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30 text-[11px] text-muted-foreground/60">
              <span>
                Mostrati {activities.length} di {totalElements} eventi
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