// src/pages/private/resident/ResidentTicketsPage.tsx
import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import { Plus, Search, Ticket as TicketIcon, Clock, AlertCircle, CheckCircle, ChevronRight, Loader2, Inbox, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const FILTER_STATUSES: TicketStatus[] = ["OPEN", "IN_PROGRESS", "WAITING_ADMIN", "CLOSED"];

const PRIORITY_CONFIG: Record<string, { label: string; className: string }> = {
  LOW: { label: "Bassa", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  MEDIUM: { label: "Media", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
  HIGH: { label: "Alta", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
};

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
  const [showFilters, setShowFilters] = useState(false);
  const size = 10;

  const debounceTimeout = useRef<number | null>(null);
  const isFetching = useRef(false);

  const fetchTickets = useCallback(
    async (reset = true, overrideStatus?: TicketStatus | "ALL", overrideSearch?: string) => {
      if (!condominiumId) return;
      if (isFetching.current) return;
      isFetching.current = true;

      const effectiveStatus = overrideStatus !== undefined ? overrideStatus : statusFilter;
      const effectiveSearch = overrideSearch !== undefined ? overrideSearch : search;
      const currentPage = reset ? 0 : page;

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

  useEffect(() => {
    if (condominiumId) {
      setTickets([]);
      setPage(0);
      setHasMore(true);
      fetchTickets(true);
    }
  }, [condominiumId]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      fetchTickets(true, statusFilter, value);
    }, 500);
  };

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

  const handleLoadMore = () => {
    if (isFetching.current || loadingMore || !hasMore || loading) return;
    fetchTickets(false);
  };

  const goToDetail = (ticketId: string) => {
    navigate(`/resident/ticket/${ticketId}`);
  };

  const goToCreate = () => {
    navigate("/resident/tickets/create");
  };

  if (!condominiumId) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Seleziona un condominio per visualizzare i ticket.
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <TicketIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Ticket</h1>
            <p className="text-sm text-muted-foreground">Le tue richieste di assistenza</p>
          </div>
        </div>
        <Button size="sm" className="gap-2" onClick={goToCreate}>
          <Plus className="h-4 w-4" />
          Nuovo ticket
        </Button>
      </div>

      {/* Filtri */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca per titolo..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className="shrink-0"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            {showFilters && (
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-full">
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
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && tickets.length === 0 && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && tickets.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-3">
              <Inbox className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-medium text-muted-foreground">Nessun ticket trovato</p>
            <p className="text-sm text-muted-foreground mt-1">
              Crea un nuovo ticket per ricevere assistenza
            </p>
            <Button variant="outline" size="sm" onClick={goToCreate} className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Crea ticket
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Ticket list */}
      {tickets.length > 0 && (
        <div className="space-y-3">
          {tickets.map((ticket) => {
            const priorityConfig = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.MEDIUM;
            const statusConfig = STATUS_CONFIG[ticket.status];
            return (
              <Card
                key={ticket.id}
                className="cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
                onClick={() => goToDetail(ticket.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant={statusConfig.variant} className="gap-1 text-xs">
                          {statusConfig.icon}
                          {statusConfig.label}
                        </Badge>
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", priorityConfig.className)}>
                          {priorityConfig.label}
                        </span>
                      </div>
                      <h3 className="font-semibold text-base truncate">{ticket.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(ticket.createdAt).toLocaleDateString("it-IT", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {ticket.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{ticket.description}</p>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-2" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Load more */}
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

      {/* End of list */}
      {!loading && !hasMore && tickets.length > 0 && (
        <p className="text-center text-xs text-muted-foreground pt-2">
          — Fine lista —
        </p>
      )}
    </div>
  );
}