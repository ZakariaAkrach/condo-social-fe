// pages/private/resident/ResidentTicketsPage.tsx
import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import { Plus, Search, Ticket as TicketIcon, Clock, AlertCircle, CheckCircle, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useCondominium } from "@/components/residentDashboard/CondominiumContext";
import { cn } from "@/lib/utils";
import { ticketResidentApi, type TicketListItem, type TicketStatus } from "@/app/api/ticketResident";

const STATUS_CONFIG: Record<TicketStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  OPEN: { label: "Aperto", variant: "default", icon: <Clock className="h-3 w-3" /> },
  IN_PROGRESS: { label: "In corso", variant: "secondary", icon: <Clock className="h-3 w-3" /> },
  WAITING_USER: { label: "In attesa", variant: "outline", icon: <AlertCircle className="h-3 w-3" /> },
  WAITING_ADMIN: { label: "In attesa admin", variant: "outline", icon: <AlertCircle className="h-3 w-3" /> },
  CLOSED: { label: "Chiuso", variant: "destructive", icon: <CheckCircle className="h-3 w-3" /> },
};

// Stati che vogliamo mostrare nel filtro (escluso WAITING_USER)
const FILTER_STATUSES: TicketStatus[] = ["OPEN", "IN_PROGRESS", "WAITING_ADMIN", "CLOSED"];

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  HIGH: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

function getPriorityColor(priority: string): string {
  return PRIORITY_COLORS[priority] || PRIORITY_COLORS.MEDIUM;
}

export default function ResidentTicketsPage() {
  const { condominiumId } = useCondominium();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "ALL">("ALL");
  const size = 10;

  const debounceTimeout = useRef<number | null>(null);
  const lastTicketRef = useRef<HTMLDivElement | null>(null);
  const isFetching = useRef(false);

  // --- Funzione di fetch (reset o load more) ---
  const fetchTickets = useCallback(
    async (reset = true, overrideStatus?: TicketStatus | "ALL", overrideSearch?: string) => {
      if (!condominiumId) return;
      if (isFetching.current) return; // previene chiamate multiple
      isFetching.current = true;

      const effectiveStatus = overrideStatus !== undefined ? overrideStatus : statusFilter;
      const effectiveSearch = overrideSearch !== undefined ? overrideSearch : search;
      const currentPage = reset ? 0 : page;

      // Imposta lo stato di caricamento
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const response = await ticketResidentApi.fetchTickets(condominiumId, {
          page: currentPage,
          size,
          sortBy: "createdAt",
          ascending: false,
          status: effectiveStatus !== "ALL" ? effectiveStatus : undefined,
          title: effectiveSearch || undefined,
        });

        const newTickets = response.data || [];
        const totalPages = response.totalPages || 0;
        const nextPage = currentPage + 1;

        setHasMore(nextPage < totalPages);
        setPage(nextPage);

        if (reset) {
          setTickets(newTickets);
        } else {
          setTickets((prev) => [...prev, ...newTickets]);
        }
      } catch (error: any) {
        const msg = error?.response?.data?.message || "Errore nel caricamento dei ticket";
        toast.error(msg);
        console.error(error);
      } finally {
        if (reset) {
          setLoading(false);
        } else {
          setLoadingMore(false);
        }
        isFetching.current = false;
      }
    },
    [condominiumId, page, size, statusFilter, search]
  );

  // --- Caricamento iniziale o cambio condominio ---
  useEffect(() => {
    if (condominiumId) {
      setTickets([]);
      setPage(0);
      setHasMore(true);
      fetchTickets(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [condominiumId]);

  // --- Gestione ricerca con debounce ---
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      fetchTickets(true, statusFilter, value);
    }, 500);
  };

  // --- Cambio filtro stato ---
  const handleStatusChange = (value: string) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
      debounceTimeout.current = null;
    }
    const newStatus = value as TicketStatus | "ALL";
    setStatusFilter(newStatus);
    setPage(0);
    setHasMore(true);
    setTickets([]);
    fetchTickets(true, newStatus, search);
  };

  // --- Carica altri ticket (load more) ---
  const handleLoadMore = () => {
    if (isFetching.current || loadingMore || !hasMore || loading) return;
    fetchTickets(false);
  };

  // --- Navigazione ---
  const goToDetail = (ticketId: string) => {
    navigate(`/resident/ticket/${ticketId}`);
  };

  const goToCreate = () => {
    navigate("/resident/tickets/create");
  };

  // --- Badge stato ---
  const getStatusBadge = (status: TicketStatus) => {
    const config = STATUS_CONFIG[status];
    return (
      <Badge variant={config.variant} className="gap-1 text-xs">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  // --- Se non c'è condominio ---
  if (!condominiumId) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Seleziona un condominio per visualizzare i ticket.
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Intestazione */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ticket</h1>
          <p className="text-sm text-muted-foreground">Le tue richieste di assistenza</p>
        </div>
        <Button size="sm" className="gap-1" onClick={goToCreate}>
          <Plus className="h-4 w-4" /> Nuovo
        </Button>
      </div>

      {/* Filtri */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per titolo..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 py-6 text-base"
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Tutti gli stati" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tutti</SelectItem>
            {FILTER_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {STATUS_CONFIG[status].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Caricamento iniziale */}
      {loading && tickets.length === 0 && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Lista vuota */}
      {!loading && tickets.length === 0 && (
        <Card className="p-8 text-center">
          <TicketIcon className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Nessun ticket trovato</p>
          <Button variant="link" onClick={goToCreate} className="mt-2">
            Crea il tuo primo ticket
          </Button>
        </Card>
      )}

      {/* Lista ticket */}
      {tickets.length > 0 && (
        <div className="space-y-3">
          {tickets.map((ticket, index) => {
            const isLast = index === tickets.length - 1;
            return (
              <Card
                key={ticket.id}
                ref={isLast ? lastTicketRef : null}
                className="cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
                onClick={() => goToDetail(ticket.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusBadge(ticket.status)}
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", getPriorityColor(ticket.priority))}>
                          {ticket.priority}
                        </span>
                      </div>
                      <h3 className="font-semibold text-base truncate">{ticket.title}</h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {new Date(ticket.createdAt).toLocaleDateString("it-IT")}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                  </div>
                  {ticket.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{ticket.description}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pulsante "Carica altri ticket" */}
      {!loading && hasMore && tickets.length > 0 && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="gap-2"
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Caricamento...
              </>
            ) : (
              "Carica altri ticket"
            )}
          </Button>
        </div>
      )}

      {/* Fine lista */}
      {!loading && !hasMore && tickets.length > 0 && (
        <p className="text-center text-xs text-muted-foreground pt-2">
          — Fine lista —
        </p>
      )}
    </div>
  );
}