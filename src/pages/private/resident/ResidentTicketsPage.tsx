// pages/private/resident/ResidentTicketsPage.tsx
import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import { Plus, Search, Ticket as TicketIcon, Clock, AlertCircle, CheckCircle, XCircle, ChevronRight } from "lucide-react";
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
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "ALL">("ALL");
  const size = 10;

  const debounceTimeout = useRef<number | null>(null);

  // fetchTickets accetta parametri opzionali per override
  const fetchTickets = useCallback(
    async (resetPage = true, overrideStatus?: TicketStatus | "ALL", overrideSearch?: string) => {
      if (!condominiumId) return;
      setLoading(true);
      try {
        const effectiveStatus = overrideStatus !== undefined ? overrideStatus : statusFilter;
        const effectiveSearch = overrideSearch !== undefined ? overrideSearch : search;
        const response = await ticketResidentApi.fetchTickets(condominiumId, {
          page: resetPage ? 0 : page,
          size,
          sortBy: "createdAt",
          ascending: false,
          status: effectiveStatus !== "ALL" ? effectiveStatus : undefined,
          title: effectiveSearch || undefined,
        });
        setTickets(response.data || []);
        setTotalPages(response.totalPages || 0);
        if (resetPage) setPage(0);
      } catch (error: any) {
        const msg = error?.response?.data?.message || "Errore nel caricamento dei ticket";
        toast.error(msg);
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [condominiumId, page, size, statusFilter, search]
  );

  // Caricamento iniziale
  useEffect(() => {
    if (condominiumId) {
      fetchTickets(true);
    }
  }, [condominiumId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      // Passa il nuovo valore di ricerca, mantiene il filtro corrente
      fetchTickets(true, statusFilter, value);
    }, 500);
  };

  const handleStatusChange = (value: string) => {
    // Cancella eventuale debounce in corso
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
      debounceTimeout.current = null;
    }
    const newStatus = value as TicketStatus | "ALL";
    setStatusFilter(newStatus);
    setPage(0);
    // Passa il nuovo stato e la ricerca corrente
    fetchTickets(true, newStatus, search);
  };

  const goToPage = (newPage: number) => {
    setPage(newPage);
    fetchTickets(false);
  };

  const goToDetail = (ticketId: string) => {
    navigate(`/resident/ticket/${ticketId}`);
  };

  const goToCreate = () => {
    navigate("/resident/tickets/create");
  };

  const getStatusBadge = (status: TicketStatus) => {
    const config = STATUS_CONFIG[status];
    return (
      <Badge variant={config.variant} className="gap-1 text-xs">
        {config.icon}
        {config.label}
      </Badge>
    );
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ticket</h1>
          <p className="text-sm text-muted-foreground">Le tue richieste di assistenza</p>
        </div>
        <Button size="sm" className="gap-1" onClick={goToCreate}>
          <Plus className="h-4 w-4" /> Nuovo
        </Button>
      </div>

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

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <Card className="p-8 text-center">
          <TicketIcon className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Nessun ticket trovato</p>
          <Button variant="link" onClick={goToCreate} className="mt-2">
            Crea il tuo primo ticket
          </Button>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <Card
                key={ticket.id}
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
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => goToPage(page - 1)}
              >
                Precedente
              </Button>
              <span className="text-sm">Pagina {page + 1} di {totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => goToPage(page + 1)}
              >
                Successiva
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}