import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  Search,
  X,
  Eye,
  Pencil,
  UserPlus,
  RefreshCw,
  ChevronRight,
  Clock,
  AlertCircle,
  CheckCircle,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { ticketAdminApi } from "@/app/api/ticketAdmin";
import { useNavigate } from "react-router";

interface AdminTicketListProps {
  condominiumId: string;
}

// Mappature per stati, priorità e categorie (adattare agli enum del backend)
const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  OPEN: { label: "Aperto", variant: "default" },
  IN_PROGRESS: { label: "In corso", variant: "secondary" },
  WAITING_USER: { label: "In attesa utente", variant: "outline" },
  WAITING_ADMIN: { label: "In attesa admin", variant: "outline" },
  CLOSED: { label: "Chiuso", variant: "destructive" },
};

const PRIORITY_OPTIONS = [
  { value: "", label: "Tutte" },
  { value: "LOW", label: "Bassa" },
  { value: "MEDIUM", label: "Media" },
  { value: "HIGH", label: "Alta" },
];

const CATEGORY_OPTIONS = [
  { value: "", label: "Tutte" },
  { value: "MAINTENANCE", label: "Manutenzione" },
  { value: "CLEANING", label: "Pulizia" },
  { value: "NOISE", label: "Rumori" },
  { value: "ADMINISTRATIVE", label: "Amministrativo" },
  { value: "SECURITY", label: "Sicurezza" },
  { value: "UTILITIES", label: "Utilità" },
  { value: "COMMON_AREAS", label: "Aree comuni" },
  { value: "OTHER", label: "Altro" },
];

const STATUS_OPTIONS = [
  { value: "", label: "Tutti" },
  ...Object.entries(STATUS_CONFIG).map(([key, { label }]) => ({
    value: key,
    label,
  })),
];

const DEFAULT_FILTERS = {
  title: "",
  description: "",
  category: "",
  status: "",
  priority: "",
  createdByEmail: "",
  assignedToEmail: "",
};

export function AdminTicketList({ condominiumId }: AdminTicketListProps) {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Metadati paginazione
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Parametri di query
  const [queryParams, setQueryParams] = useState({
    filters: DEFAULT_FILTERS,
    page: 0,
    size: 10,
    sortBy: "createdAt",
    ascending: false,
  });
  const [filterValues, setFilterValues] = useState(DEFAULT_FILTERS);

  // Stati per dialog
  const [changeStatusDialog, setChangeStatusDialog] = useState<{
    open: boolean;
    ticketId: string | null;
    currentStatus: string;
  }>({ open: false, ticketId: null, currentStatus: "" });
  const [assignDialog, setAssignDialog] = useState<{
    open: boolean;
    ticketId: string | null;
  }>({ open: false, ticketId: null });
  const [assignEmail, setAssignEmail] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch tickets
  const fetchTickets = useCallback(
    async (params: typeof queryParams, showLoading = true) => {
      if (showLoading) setLoading(true);
      setError(null);
      try {
        const { page, size, sortBy, ascending, filters } = params;
        const response = await ticketAdminApi.fetchTickets(condominiumId, {
          ...filters,
          page,
          size,
          sortBy,
          ascending,
        });
        setTickets(response.data || []);
        setTotalElements(response.totalElements || 0);
        setTotalPages(response.totalPages || 0);
      } catch (err: any) {
        console.error("Errore fetch tickets:", err);
        setError("Impossibile caricare i ticket. Riprova.");
        toast.error("Errore nel caricamento dei ticket");
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [condominiumId]
  );

  useEffect(() => {
    fetchTickets(queryParams);
  }, [fetchTickets, queryParams]);

  const handleSearch = () => {
    setQueryParams((prev) => ({
      ...prev,
      filters: filterValues,
      page: 0,
    }));
  };

  const handleReset = () => {
    setFilterValues(DEFAULT_FILTERS);
    setQueryParams((prev) => ({
      ...prev,
      filters: DEFAULT_FILTERS,
      page: 0,
    }));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTickets(queryParams, true);
    setRefreshing(false);
    toast.info("Elenco aggiornato");
  };

  // Paginazione
  const goToPage = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setQueryParams((prev) => ({ ...prev, page }));
    }
  };

  const handlePageSizeChange = (size: number) => {
    setQueryParams((prev) => ({ ...prev, size, page: 0 }));
  };

  // Naviga al dettaglio
  const goToDetail = (ticketId: string) => {
    navigate(`/admin/condomini/${condominiumId}/tickets/${ticketId}`);
  };

  // Apri dialog cambio stato
  const openChangeStatus = (ticketId: string, currentStatus: string) => {
    setNewStatus(currentStatus);
    setChangeStatusDialog({ open: true, ticketId, currentStatus });
  };

  // Apri dialog assegnazione
  const openAssign = (ticketId: string) => {
    setAssignEmail("");
    setAssignDialog({ open: true, ticketId });
  };

  // Submit cambio stato
  const handleChangeStatus = async () => {
    if (!changeStatusDialog.ticketId || !newStatus) return;
    setIsSubmitting(true);
    try {
      await ticketAdminApi.changeStatus(condominiumId, changeStatusDialog.ticketId, {
        status: newStatus,
      });
      toast.success("Stato aggiornato");
      setChangeStatusDialog({ open: false, ticketId: null, currentStatus: "" });
      fetchTickets(queryParams);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Errore durante il cambio stato");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit assegnazione
  const handleAssign = async () => {
    if (!assignDialog.ticketId || !assignEmail) return;
    setIsSubmitting(true);
    try {
      await ticketAdminApi.assignTicket(condominiumId, assignDialog.ticketId, {
        email: assignEmail,
      });
      toast.success("Ticket assegnato");
      setAssignDialog({ open: false, ticketId: null });
      setAssignEmail("");
      fetchTickets(queryParams);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Errore durante l'assegnazione");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formatta data
  const formatDate = (date: string) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Render badge stato
  const StatusBadge = ({ status }: { status: string }) => {
    const config = STATUS_CONFIG[status];
    if (!config) return <Badge variant="outline">{status}</Badge>;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>{error}</p>
        <Button variant="outline" onClick={handleRefresh} className="mt-2">
          Riprova
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Intestazione e azioni */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Ticket</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {totalElements} ticket
          </span>
        </div>
      </div>

      {/* Filtri */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 items-end">
        <div className="space-y-1">
          <Label htmlFor="filter-title" className="text-xs">
            Titolo
          </Label>
          <Input
            id="filter-title"
            placeholder="Titolo"
            value={filterValues.title}
            onChange={(e) =>
              setFilterValues((prev) => ({ ...prev, title: e.target.value }))
            }
            className="h-9"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="filter-category" className="text-xs">
            Categoria
          </Label>
          <Select
            value={filterValues.category}
            onValueChange={(val) =>
              setFilterValues((prev) => ({ ...prev, category: val }))
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Tutte" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="filter-status" className="text-xs">
            Stato
          </Label>
          <Select
            value={filterValues.status}
            onValueChange={(val) =>
              setFilterValues((prev) => ({ ...prev, status: val }))
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Tutti" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="filter-priority" className="text-xs">
            Priorità
          </Label>
          <Select
            value={filterValues.priority}
            onValueChange={(val) =>
              setFilterValues((prev) => ({ ...prev, priority: val }))
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Tutte" />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="filter-createdBy" className="text-xs">
            Creato da (email)
          </Label>
          <Input
            id="filter-createdBy"
            placeholder="Email creatore"
            value={filterValues.createdByEmail}
            onChange={(e) =>
              setFilterValues((prev) => ({ ...prev, createdByEmail: e.target.value }))
            }
            className="h-9"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="default" onClick={handleSearch} className="gap-1">
          <Search className="h-4 w-4" /> Cerca
        </Button>
        <Button size="sm" variant="outline" onClick={handleReset} className="gap-1">
          <X className="h-4 w-4" /> Reset
        </Button>
      </div>

      {/* Tabella */}
      <div className="overflow-x-auto relative border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:text-primary"
                onClick={() => {
                  if (queryParams.sortBy === "title") {
                    setQueryParams((prev) => ({ ...prev, ascending: !prev.ascending }));
                  } else {
                    setQueryParams((prev) => ({ ...prev, sortBy: "title", ascending: true }));
                  }
                }}
              >
                Titolo{" "}
                {queryParams.sortBy === "title" &&
                  (queryParams.ascending ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-primary hidden md:table-cell"
                onClick={() => {
                  if (queryParams.sortBy === "category") {
                    setQueryParams((prev) => ({ ...prev, ascending: !prev.ascending }));
                  } else {
                    setQueryParams((prev) => ({ ...prev, sortBy: "category", ascending: true }));
                  }
                }}
              >
                Categoria{" "}
                {queryParams.sortBy === "category" &&
                  (queryParams.ascending ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-primary hidden sm:table-cell"
                onClick={() => {
                  if (queryParams.sortBy === "status") {
                    setQueryParams((prev) => ({ ...prev, ascending: !prev.ascending }));
                  } else {
                    setQueryParams((prev) => ({ ...prev, sortBy: "status", ascending: true }));
                  }
                }}
              >
                Stato{" "}
                {queryParams.sortBy === "status" &&
                  (queryParams.ascending ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-primary"
                onClick={() => {
                  if (queryParams.sortBy === "priority") {
                    setQueryParams((prev) => ({ ...prev, ascending: !prev.ascending }));
                  } else {
                    setQueryParams((prev) => ({ ...prev, sortBy: "priority", ascending: true }));
                  }
                }}
              >
                Priorità{" "}
                {queryParams.sortBy === "priority" &&
                  (queryParams.ascending ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-primary hidden lg:table-cell"
                onClick={() => {
                  if (queryParams.sortBy === "createdByEmail") {
                    setQueryParams((prev) => ({ ...prev, ascending: !prev.ascending }));
                  } else {
                    setQueryParams((prev) => ({ ...prev, sortBy: "createdByEmail", ascending: true }));
                  }
                }}
              >
                Creato da{" "}
                {queryParams.sortBy === "createdByEmail" &&
                  (queryParams.ascending ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-primary hidden xl:table-cell"
                onClick={() => {
                  if (queryParams.sortBy === "assignedTo") {
                    setQueryParams((prev) => ({ ...prev, ascending: !prev.ascending }));
                  } else {
                    setQueryParams((prev) => ({ ...prev, sortBy: "assignedTo", ascending: true }));
                  }
                }}
              >
                Assegnato a{" "}
                {queryParams.sortBy === "assignedTo" &&
                  (queryParams.ascending ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-primary hidden lg:table-cell"
                onClick={() => {
                  if (queryParams.sortBy === "createdAt") {
                    setQueryParams((prev) => ({ ...prev, ascending: !prev.ascending }));
                  } else {
                    setQueryParams((prev) => ({ ...prev, sortBy: "createdAt", ascending: false }));
                  }
                }}
              >
                Data{" "}
                {queryParams.sortBy === "createdAt" &&
                  (queryParams.ascending ? "↑" : "↓")}
              </TableHead>
              <TableHead className="w-16 text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground mt-1">Caricamento...</p>
                </TableCell>
              </TableRow>
            ) : tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-6">
                  Nessun ticket trovato.
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket) => (
                <TableRow
                  key={ticket.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => goToDetail(ticket.id)}
                >
                  <TableCell>
                    <div className="font-medium truncate max-w-[200px]">
                      {ticket.title}
                    </div>
                    {ticket.description && (
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {ticket.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {ticket.category || "—"}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <StatusBadge status={ticket.status} />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        ticket.priority === "HIGH"
                          ? "destructive"
                          : ticket.priority === "MEDIUM"
                          ? "default"
                          : "outline"
                      }
                    >
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {ticket.createdByEmail || "—"}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    {ticket.assignedTo || "—"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {formatDate(ticket.createdAt)}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => goToDetail(ticket.id)}>
                          <Eye className="h-4 w-4 mr-2" /> Dettaglio
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openChangeStatus(ticket.id, ticket.status)}
                        >
                          <Pencil className="h-4 w-4 mr-2" /> Cambia stato
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openAssign(ticket.id)}>
                          <UserPlus className="h-4 w-4 mr-2" /> Assegna
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginazione */}
      {totalPages > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-2">
          <div className="text-sm text-muted-foreground">
            Mostrati {tickets.length} di {totalElements} ticket
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(queryParams.page - 1)}
              disabled={queryParams.page === 0}
            >
              Precedente
            </Button>
            <span className="text-sm px-2">
              Pagina {queryParams.page + 1} di {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(queryParams.page + 1)}
              disabled={queryParams.page === totalPages - 1}
            >
              Successiva
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="pageSize" className="text-xs">
              Righe:
            </Label>
            <Select
              value={String(queryParams.size)}
              onValueChange={(val) => handlePageSizeChange(Number(val))}
            >
              <SelectTrigger className="h-8 w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Dialog Cambio Stato */}
      <Dialog
        open={changeStatusDialog.open}
        onOpenChange={(open) =>
          !open && setChangeStatusDialog({ open: false, ticketId: null, currentStatus: "" })
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cambia stato ticket</DialogTitle>
            <DialogDescription>
              Seleziona il nuovo stato per il ticket.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona stato" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.filter((opt) => opt.value !== "").map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setChangeStatusDialog({ open: false, ticketId: null, currentStatus: "" })
              }
            >
              Annulla
            </Button>
            <Button onClick={handleChangeStatus} disabled={isSubmitting || !newStatus}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aggiorna"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Assegnazione */}
      <Dialog
        open={assignDialog.open}
        onOpenChange={(open) =>
          !open && setAssignDialog({ open: false, ticketId: null })
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assegna ticket</DialogTitle>
            <DialogDescription>
              Inserisci l'email dell'amministratore a cui assegnare il ticket.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Email amministratore"
              value={assignEmail}
              onChange={(e) => setAssignEmail(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignDialog({ open: false, ticketId: null })}
            >
              Annulla
            </Button>
            <Button onClick={handleAssign} disabled={isSubmitting || !assignEmail}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Assegna"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}