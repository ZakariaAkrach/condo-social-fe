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
  Info,
  Shield,
  Trash2,
  CreditCard,
  DollarSign,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { CondominiumDto } from "@/app/api/condominium";

// Mappa traduzioni per ActivityType
const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  // Generali
  CREATED: "Creato",
  UPDATED: "Aggiornato",
  DELETED: "Eliminato",
  ARCHIVED: "Archiviato",
  RESTORED: "Ripristinato",
  
  // Inviti
  INVITED: "Invitato",
  ACCEPTED_INVITE: "Invito accettato",
  DECLINED_INVITE: "Invito rifiutato",
  
  // Utenti
  JOINED: "Unito",
  LEFT: "Lasciato",
  REMOVED: "Rimosso",
  ROLE_CHANGED: "Ruolo cambiato",
  
  // Ticket
  ASSIGN_TICKET: "Ticket assegnato",
  CHANGE_TICKET_STATUS: "Status ticket cambiato",
  CREATE_MESSAGE: "Messaggio creato",
  UPLOADED_ATTACHMENT: "Allegato caricato",
  CREATE_TICKET: "Ticket creato",
  
  // Post
  POST_CREATED: "Post creato",
  POSTED: "Post pubblicato",
  EDITED_POST: "Post modificato",
  DELETED_POST: "Post eliminato",
  PROGRAM_DELETED_POST: "Post programmato eliminazione",
  USER_VOTED_POST: "Voto registrato",
  
  // Documenti
  UPLOADED: "Caricato",
  UPDATED_VERSION: "Versione aggiornata",
  DELETED_DOCUMENT: "Documento eliminato",
  PROGRAM_DELETED_DOCUMENT: "Doc. programmato eliminazione",
  DOCUMENT_UPDATED_STATUS: "Status documento cambiato",
  
  // Abbonamenti e Pagamenti
  SUBSCRIPTION_STARTED: "Abbonamento iniziato",
  SUBSCRIPTION_CANCELLED: "Abbonamento cancellato",
  PAYMENT_RECEIVED: "Pagamento ricevuto",
};

// Mappa traduzioni per EntityType
const ENTITY_TYPE_LABELS: Record<string, string> = {
  CONDOMINIUM: "Condominio",
  USER: "Utente",
  INVITE: "Invito",
  TICKET: "Ticket",
  POST: "Post",
  DOCUMENT: "Documento",
  DOCUMENT_VERSION: "Versione documento",
  SUBSCRIPTION: "Abbonamento",
  PAYMENT: "Pagamento",
};

// Mappa icone (supporta tutti i tipi)
const getActivityIcon = (entityType: string, activityType: string) => {
  const key = `${entityType}_${activityType}`;
  const map: Record<string, { icon: any; bg: string; color: string }> = {
    // USER
    USER_CREATED: { icon: User, bg: "bg-emerald-500/15", color: "text-emerald-600" },
    USER_UPDATED: { icon: User, bg: "bg-amber-500/15", color: "text-amber-600" },
    USER_DELETED: { icon: User, bg: "bg-rose-500/15", color: "text-rose-600" },
    USER_JOINED: { icon: User, bg: "bg-emerald-500/15", color: "text-emerald-600" },
    USER_LEFT: { icon: User, bg: "bg-rose-500/15", color: "text-rose-600" },
    USER_REMOVED: { icon: User, bg: "bg-rose-500/15", color: "text-rose-600" },
    USER_ROLE_CHANGED: { icon: User, bg: "bg-amber-500/15", color: "text-amber-600" },

    // CONDOMINIUM
    CONDOMINIUM_CREATED: { icon: Home, bg: "bg-emerald-500/15", color: "text-emerald-600" },
    CONDOMINIUM_UPDATED: { icon: Home, bg: "bg-amber-500/15", color: "text-amber-600" },
    CONDOMINIUM_DELETED: { icon: Home, bg: "bg-rose-500/15", color: "text-rose-600" },

    // TICKET
    TICKET_ASSIGN_TICKET: { icon: MessageSquare, bg: "bg-amber-500/15", color: "text-amber-600" },
    TICKET_CHANGE_TICKET_STATUS: { icon: MessageSquare, bg: "bg-amber-500/15", color: "text-amber-600" },
    TICKET_CREATE_MESSAGE: { icon: MessageSquare, bg: "bg-primary/15", color: "text-primary" },
    TICKET_UPLOADED_ATTACHMENT: { icon: MessageSquare, bg: "bg-primary/15", color: "text-primary" },
    TICKET_CREATE_TICKET: { icon: MessageSquare, bg: "bg-primary/15", color: "text-primary" },

    // POST
    POST_POST_CREATED: { icon: FileText, bg: "bg-primary/15", color: "text-primary" },
    POST_POSTED: { icon: FileText, bg: "bg-primary/15", color: "text-primary" },
    POST_EDITED_POST: { icon: FileText, bg: "bg-amber-500/15", color: "text-amber-600" },
    POST_DELETED_POST: { icon: FileText, bg: "bg-rose-500/15", color: "text-rose-600" },
    POST_PROGRAM_DELETED_POST: { icon: FileText, bg: "bg-amber-500/15", color: "text-amber-600" },
    POST_USER_VOTED_POST: { icon: FileText, bg: "bg-primary/15", color: "text-primary" },

    // DOCUMENT
    DOCUMENT_UPLOADED: { icon: FileText, bg: "bg-primary/15", color: "text-primary" },
    DOCUMENT_UPDATED_VERSION: { icon: FileText, bg: "bg-amber-500/15", color: "text-amber-600" },
    DOCUMENT_DELETED_DOCUMENT: { icon: FileText, bg: "bg-rose-500/15", color: "text-rose-600" },
    DOCUMENT_PROGRAM_DELETED_DOCUMENT: { icon: FileText, bg: "bg-amber-500/15", color: "text-amber-600" },
    DOCUMENT_DOCUMENT_UPDATED_STATUS: { icon: FileText, bg: "bg-amber-500/15", color: "text-amber-600" },

    // INVITE
    INVITE_INVITED: { icon: User, bg: "bg-primary/15", color: "text-primary" },
    INVITE_ACCEPTED_INVITE: { icon: User, bg: "bg-emerald-500/15", color: "text-emerald-600" },
    INVITE_DECLINED_INVITE: { icon: User, bg: "bg-rose-500/15", color: "text-rose-600" },

    // SUBSCRIPTION
    SUBSCRIPTION_SUBSCRIPTION_STARTED: { icon: CreditCard, bg: "bg-emerald-500/15", color: "text-emerald-600" },
    SUBSCRIPTION_SUBSCRIPTION_CANCELLED: { icon: CreditCard, bg: "bg-rose-500/15", color: "text-rose-600" },

    // PAYMENT
    PAYMENT_PAYMENT_RECEIVED: { icon: DollarSign, bg: "bg-emerald-500/15", color: "text-emerald-600" },
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
    ASSIGN_TICKET: "è stato assegnato",
    CHANGE_TICKET_STATUS: "ha cambiato status",
    CREATE_MESSAGE: "ha inviato un messaggio",
    UPLOADED_ATTACHMENT: "ha caricato un allegato",
    CREATE_TICKET: "è stato creato",
    POST_CREATED: "è stato creato",
    POSTED: "è stato pubblicato",
    EDITED_POST: "è stato modificato",
    DELETED_POST: "è stato eliminato",
    PROGRAM_DELETED_POST: "programmato per eliminazione",
    USER_VOTED_POST: "ha votato",
    UPLOADED: "è stato caricato",
    UPDATED_VERSION: "ha aggiornato la versione",
    DELETED_DOCUMENT: "è stato eliminato",
    PROGRAM_DELETED_DOCUMENT: "programmato per eliminazione",
    DOCUMENT_UPDATED_STATUS: "ha cambiato status",
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
  limit?: number;
}

export default function AdminRecentActivities({
  condominiums,
  limit = 5,
}: AdminRecentActivitiesProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>("");
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("");
  const [descriptionFilter, setDescriptionFilter] = useState<string>("");
  const [fromDateFilter, setFromDateFilter] = useState<string>("");
  const [toDateFilter, setToDateFilter] = useState<string>("");
  const [activities, setActivities] = useState<FetchActivityResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    if (condominiums.length > 0) {
      setSelectedIds(condominiums.map((c) => c.id));
    }
  }, [condominiums]);

  const resetPagination = useCallback(() => {
    setActivities([]);
    setCurrentPage(0);
    setTotalElements(0);
    setIsLastPage(false);
    setIsExpanded(false);
  }, []);

  const fetchPage = useCallback(
    async (page: number, append: boolean = false) => {
      if (selectedIds.length === 0) {
        setActivities([]);
        setLoading(false);
        return;
      }

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
        setIsLastPage(response.lastPage);

        if (append) {
          setActivities((prev) => [...prev, ...response.data]);
        } else {
          setActivities(response.data);
        }

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

  const loadFirstPage = useCallback(() => {
    resetPagination();
    fetchPage(0, false);
  }, [fetchPage, resetPagination]);

  const loadNextPage = useCallback(() => {
    if (isLastPage || loadingMore) return;
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchPage(nextPage, true);
  }, [currentPage, isLastPage, loadingMore, fetchPage]);

  useEffect(() => {
    loadFirstPage();
  }, [selectedIds]);

  useEffect(() => {
    if (selectedIds.length > 0) {
      loadFirstPage();
    }
  }, [activityTypeFilter, entityTypeFilter, descriptionFilter, fromDateFilter, toDateFilter]);

  useEffect(() => {
    if (isExpanded || isLastPage) return;

    const interval = setInterval(() => {
      loadFirstPage();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isExpanded, isLastPage, loadFirstPage]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadFirstPage();
  };

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

  // Modal informativa
  const InfoModal = () => {
    if (!showInfoModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowInfoModal(false)}>
        <div className="bg-background rounded-xl max-w-md w-full shadow-2xl border border-border/40" onClick={(e) => e.stopPropagation()}>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <Info className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">Informazioni sulle attività</h3>
            </div>

            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
                <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                  <Info className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">📌 Sezione di cortesia</p>
                  <p className="text-xs mt-0.5">
                    Questa sezione mostra le attività recenti del condominio come <strong>gentilezza informativa</strong>.
                    Non è un sistema di audit permanente.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-100 dark:border-amber-900/30">
                <div className="p-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                  <Clock className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">⏱️ Conservazione 6 mesi</p>
                  <p className="text-xs mt-0.5">
                    Le attività vengono conservate per <strong>6 mesi</strong> dalla data di creazione.
                    Trascorso questo periodo, vengono eliminate automaticamente.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-rose-50 dark:bg-rose-950/20 rounded-lg border border-rose-100 dark:border-rose-900/30">
                <div className="p-1.5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5">
                  <Trash2 className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">🗑️ Cancellazione con il condominio</p>
                  <p className="text-xs mt-0.5">
                    Quando un condominio viene <strong>eliminato</strong>, tutte le attività ad esso associate
                    vengono immediatamente <strong>anonimizzate</strong> (il riferimento al condominio viene rimosso)
                    e successivamente eliminate in modo permanente.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                <div className="p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                  <Shield className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">🔒 Privacy garantita</p>
                  <p className="text-xs mt-0.5">
                    Questo sistema è progettato per <strong>rispettare la privacy</strong>.
                    I dati delle attività non sono un audit legale e non vengono conservati
                    oltre il periodo necessario.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              className="mt-5 w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Ho capito
            </button>
          </div>
        </div>
      </div>
    );
  };

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
    <>
      <InfoModal />
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/40 bg-muted/5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-primary" />
                Attività recenti
                {selectedIds.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {activities.length} {totalElements > 0 && `di ${totalElements}`} eventi
                  </span>
                )}
              </CardTitle>
              <button
                onClick={() => setShowInfoModal(true)}
                className="p-1 rounded-full hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Informazioni sulle attività"
              >
                <Info className="h-4 w-4" />
              </button>
            </div>
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

          {/* Filtri aggiuntivi con optgroup */}
          <div className="mt-3 pt-2 border-t border-border/30 flex flex-wrap items-end gap-3">
            {/* Tipo evento */}
            <div>
              <label htmlFor="activityType" className="text-xs font-medium text-muted-foreground block mb-0.5">
                Tipo evento
              </label>
              <select
                id="activityType"
                value={activityTypeFilter}
                onChange={(e) => setActivityTypeFilter(e.target.value)}
                className="h-8 rounded-md border border-border/50 bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-w-[180px]"
              >
                <option value="">Tutti</option>
                <optgroup label="📋 Generali">
                  <option value="CREATED">Creato</option>
                  <option value="UPDATED">Aggiornato</option>
                  <option value="DELETED">Eliminato</option>
                  <option value="ARCHIVED">Archiviato</option>
                  <option value="RESTORED">Ripristinato</option>
                </optgroup>
                <optgroup label="👥 Utenti & Inviti">
                  <option value="INVITED">Invitato</option>
                  <option value="ACCEPTED_INVITE">Invito accettato</option>
                  <option value="DECLINED_INVITE">Invito rifiutato</option>
                  <option value="JOINED">Unito</option>
                  <option value="LEFT">Lasciato</option>
                  <option value="REMOVED">Rimosso</option>
                  <option value="ROLE_CHANGED">Ruolo cambiato</option>
                </optgroup>
                <optgroup label="🎫 Ticket">
                  <option value="ASSIGN_TICKET">Ticket assegnato</option>
                  <option value="CHANGE_TICKET_STATUS">Status ticket cambiato</option>
                  <option value="CREATE_MESSAGE">Messaggio creato</option>
                  <option value="UPLOADED_ATTACHMENT">Allegato caricato</option>
                  <option value="CREATE_TICKET">Ticket creato</option>
                </optgroup>
                <optgroup label="📝 Post">
                  <option value="POST_CREATED">Post creato</option>
                  <option value="POSTED">Post pubblicato</option>
                  <option value="EDITED_POST">Post modificato</option>
                  <option value="DELETED_POST">Post eliminato</option>
                  <option value="PROGRAM_DELETED_POST">Post programmato eliminazione</option>
                  <option value="USER_VOTED_POST">Voto registrato</option>
                </optgroup>
                <optgroup label="📄 Documenti">
                  <option value="UPLOADED">Caricato</option>
                  <option value="UPDATED_VERSION">Versione aggiornata</option>
                  <option value="DELETED_DOCUMENT">Documento eliminato</option>
                  <option value="PROGRAM_DELETED_DOCUMENT">Doc. programmato eliminazione</option>
                  <option value="DOCUMENT_UPDATED_STATUS">Status documento cambiato</option>
                </optgroup>
                <optgroup label="💳 Abbonamenti">
                  <option value="SUBSCRIPTION_STARTED">Abbonamento iniziato</option>
                  <option value="SUBSCRIPTION_CANCELLED">Abbonamento cancellato</option>
                  <option value="PAYMENT_RECEIVED">Pagamento ricevuto</option>
                </optgroup>
              </select>
            </div>

            {/* Entità */}
            <div>
              <label htmlFor="entityType" className="text-xs font-medium text-muted-foreground block mb-0.5">
                Entità
              </label>
              <select
                id="entityType"
                value={entityTypeFilter}
                onChange={(e) => setEntityTypeFilter(e.target.value)}
                className="h-8 rounded-md border border-border/50 bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-w-[150px]"
              >
                <option value="">Tutte</option>
                <option value="CONDOMINIUM">🏢 Condominio</option>
                <option value="USER">👤 Utente</option>
                <option value="INVITE">📧 Invito</option>
                <option value="TICKET">🎫 Ticket</option>
                <option value="POST">📝 Post</option>
                <option value="DOCUMENT">📄 Documento</option>
                <option value="DOCUMENT_VERSION">📄 Versione documento</option>
                <option value="SUBSCRIPTION">💳 Abbonamento</option>
                <option value="PAYMENT">💰 Pagamento</option>
              </select>
            </div>

            {/* Descrizione */}
            <div>
              <label htmlFor="description" className="text-xs font-medium text-muted-foreground block mb-0.5">
                Cerca
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

            {/* Da data */}
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

            {/* A data */}
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

            {/* Pulsanti azione */}
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

          {/* ⭐ BANNER DI CORTESIA ⭐ */}
          <div className="mt-3 pt-2 border-t border-border/30">
            <div className="flex items-start gap-2 p-2 bg-primary/5 rounded-lg border border-primary/10">
              <Info className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <p className="text-[10.5px] text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">💡 Sezione di cortesia</span>
                {" · "}
                Le attività vengono conservate per <span className="font-medium text-foreground">6 mesi</span>.
                {" "}
                <span className="font-medium text-foreground">Quando il condominio viene eliminato</span>,
                tutte le attività vengono anonimizzate e poi rimosse.
                <button
                  onClick={() => setShowInfoModal(true)}
                  className="ml-1 text-primary hover:underline font-medium"
                >
                  Scopri di più
                </button>
              </p>
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
              <div className="max-h-72 overflow-y-auto pr-2">
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
                        <div
                          className={cn(
                            "absolute left-0 mt-1 flex items-center justify-center w-9 h-9 rounded-full border border-background shadow-sm transition-transform hover:scale-105",
                            bg
                          )}
                        >
                          <Icon className={cn("h-4 w-4", color)} />
                        </div>

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

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30 text-[11px] text-muted-foreground/60">
                <span>
                  Mostrati {activities.length} di {totalElements} eventi
                  {activities.length > 0 && ` · ultimo ${formatTimeAgo(activities[0].createdAt)}`}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowInfoModal(true)}
                    className="text-primary/70 hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <Info className="h-3 w-3" />
                    Info
                  </button>
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
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}