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
  Filter,
  ChevronLeft,
  Inbox,
  User,
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ticketAdminApi } from "@/app/api/ticketAdmin";
import { condominiumMemberApi } from "@/app/api/condominiumMember";
import type { FetchMembersResponseDto } from "@/app/api/condominiumMember";
import { useAuth } from "@/auth/AuthProvider";
import { useNavigate } from "react-router";

interface AdminTicketListProps {
  condominiumId: string;
}

// Mappature per stati, priorità e categorie
const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }
> = {
  OPEN: { label: "Aperto", variant: "default", icon: AlertCircle },
  IN_PROGRESS: { label: "In corso", variant: "secondary", icon: Clock },
  CLOSED: { label: "Chiuso", variant: "destructive", icon: CheckCircle },
};

const PRIORITY_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  LOW: { label: "Bassa", variant: "outline" },
  MEDIUM: { label: "Media", variant: "secondary" },
  HIGH: { label: "Alta", variant: "destructive" },
};

const PRIORITY_OPTIONS = [
  { value: "", label: "Tutte le priorità" },
  { value: "LOW", label: "Bassa" },
  { value: "MEDIUM", label: "Media" },
  { value: "HIGH", label: "Alta" },
];

const CATEGORY_OPTIONS = [
  { value: "", label: "Tutte le categorie" },
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
  { value: "", label: "Tutti gli stati" },
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
  const { user, profile } = useAuth();
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
  const [showFilters, setShowFilters] = useState(false);

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
  const [newStatus, setNewStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Stati per membri
  const [members, setMembers] = useState<FetchMembersResponseDto[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string>("");

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

  // Fetch members
  const fetchMembers = useCallback(async () => {
    setMembersLoading(true);
    try {
      const response = await condominiumMemberApi.fetchMembers(
        {
          role: "CONDO_SUB_ADMIN",
          page: 0,
          size: 100,
        },
        condominiumId
      );
      setMembers(response.data || []);
    } catch (err: any) {
      console.error("Errore fetch members:", err);
      toast.error("Errore nel caricamento dei membri");
    } finally {
      setMembersLoading(false);
    }
  }, [condominiumId]);

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
    toast.success("Elenco aggiornato");
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
  const openAssign = async (ticketId: string) => {
    setAssignDialog({ open: true, ticketId });
    setSelectedMember("");
    await fetchMembers();
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
      fetchTickets(queryParams, false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Errore durante il cambio stato");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit assegnazione
  const handleAssign = async () => {
    if (!assignDialog.ticketId || !selectedMember) return;
    setIsSubmitting(true);
    try {
      let emailToAssign = "";
      
      // Se è "me", usa l'email dell'utente corrente
      if (selectedMember === "me") {
        emailToAssign = user?.email || profile?.email || "";
        if (!emailToAssign) {
          toast.error("Email utente non disponibile");
          return;
        }
      } else {
        // Altrimenti cerca tra i membri
        const selectedMemberData = members.find(m => m.memberId === selectedMember);
        if (!selectedMemberData) {
          toast.error("Seleziona un membro valido");
          return;
        }
        emailToAssign = selectedMemberData.email;
      }
      
      await ticketAdminApi.assignTicket(condominiumId, assignDialog.ticketId, {
        email: emailToAssign,
      });
      toast.success("Ticket assegnato");
      setAssignDialog({ open: false, ticketId: null });
      setSelectedMember("");
      fetchTickets(queryParams, false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Errore durante l'assegnazione");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtra i membri per escludere l'utente corrente
  const filteredMembers = members.filter(member => 
    member.email?.toLowerCase() !== user?.email?.toLowerCase() && 
    member.email?.toLowerCase() !== profile?.email?.toLowerCase()
  );

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
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  // Render badge priorità
  const PriorityBadge = ({ priority }: { priority: string }) => {
    const config = PRIORITY_CONFIG[priority];
    if (!config) return <Badge variant="outline">{priority}</Badge>;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive font-medium">{error}</p>
        <Button variant="outline" onClick={handleRefresh} className="mt-4 gap-2">
          <RefreshCw className="h-4 w-4" />
          Riprova
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Inbox className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Ticket</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {totalElements} ticket totali
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtri
                {showFilters && <X className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Aggiorna
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Filtri espandibili */}
        {showFilters && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              <div className="space-y-1">
                <Label htmlFor="filter-title" className="text-xs">Titolo</Label>
                <Input
                  id="filter-title"
                  placeholder="Cerca per titolo"
                  value={filterValues.title}
                  onChange={(e) =>
                    setFilterValues((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Categoria</Label>
                <Select
                  value={filterValues.category}
                  onValueChange={(val) =>
                    setFilterValues((prev) => ({ ...prev, category: val }))
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Tutte le categorie" />
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
                <Label className="text-xs">Stato</Label>
                <Select
                  value={filterValues.status}
                  onValueChange={(val) =>
                    setFilterValues((prev) => ({ ...prev, status: val }))
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Tutti gli stati" />
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
                <Label className="text-xs">Priorità</Label>
                <Select
                  value={filterValues.priority}
                  onValueChange={(val) =>
                    setFilterValues((prev) => ({ ...prev, priority: val }))
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Tutte le priorità" />
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
                <Label className="text-xs">Creato da</Label>
                <Input
                  placeholder="Email creatore"
                  value={filterValues.createdByEmail}
                  onChange={(e) =>
                    setFilterValues((prev) => ({ ...prev, createdByEmail: e.target.value }))
                  }
                  className="h-9"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={handleSearch} className="gap-2">
                <Search className="h-4 w-4" /> Cerca
              </Button>
              <Button size="sm" variant="outline" onClick={handleReset} className="gap-2">
                <X className="h-4 w-4" /> Reset
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Tabella */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Titolo</TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">Categoria</TableHead>
                  <TableHead className="font-semibold hidden sm:table-cell">Stato</TableHead>
                  <TableHead className="font-semibold">Priorità</TableHead>
                  <TableHead className="font-semibold hidden lg:table-cell">Creato da</TableHead>
                  <TableHead className="font-semibold hidden xl:table-cell">Assegnato a</TableHead>
                  <TableHead className="font-semibold hidden lg:table-cell">Data</TableHead>
                  <TableHead className="font-semibold text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={8}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : tickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <Inbox className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-muted-foreground font-medium">Nessun ticket trovato</p>
                      <p className="text-sm text-muted-foreground/70 mt-1">
                        Prova a modificare i filtri di ricerca
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.map((ticket) => (
                    <TableRow
                      key={ticket.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => goToDetail(ticket.id)}
                    >
                      <TableCell>
                        <div className="font-medium truncate max-w-[200px]">
                          {ticket.title}
                        </div>
                        {ticket.description && (
                          <div className="text-xs text-muted-foreground truncate max-w-[200px] mt-0.5">
                            {ticket.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">{ticket.category || "—"}</Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <StatusBadge status={ticket.status} />
                      </TableCell>
                      <TableCell>
                        <PriorityBadge priority={ticket.priority} />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {ticket.createdByEmail?.[0]?.toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{ticket.createdByEmail || "—"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {ticket.assignedTo || "—"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {formatDate(ticket.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
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
        </CardContent>
      </Card>

      {/* Paginazione */}
      {totalPages > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-sm text-muted-foreground">
            Mostrati <span className="font-medium">{tickets.length}</span> di{" "}
            <span className="font-medium">{totalElements}</span> ticket
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(queryParams.page - 1)}
              disabled={queryParams.page === 0}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Precedente</span>
            </Button>
            <span className="text-sm px-2 whitespace-nowrap">
              Pagina <span className="font-medium">{queryParams.page + 1}</span> di{" "}
              <span className="font-medium">{totalPages}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(queryParams.page + 1)}
              disabled={queryParams.page === totalPages - 1}
              className="gap-1"
            >
              <span className="hidden sm:inline">Successiva</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="pageSize" className="text-xs whitespace-nowrap">
              Righe per pagina:
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
            <Button onClick={handleChangeStatus} disabled={isSubmitting || !newStatus} className="gap-2">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Aggiorna
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
              Seleziona un amministratore a cui assegnare il ticket.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-2 space-y-4">
            {/* Assegna a me */}
            <button
              onClick={() => setSelectedMember("me")}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                selectedMember === "me"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/50"
              }`}
            >
              <Avatar>
                <AvatarFallback className="bg-primary/10 text-primary">
                  {profile?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="font-medium flex items-center gap-2">
                  Assegna a me
                  <Badge variant="outline" className="text-xs">Tu</Badge>
                </p>
                <p className="text-sm text-muted-foreground">
                  {profile?.email || user?.email}
                </p>
              </div>
              {selectedMember === "me" && (
                <CheckCircle className="h-5 w-5 text-primary" />
              )}
            </button>

            <Separator />

            {/* Lista membri */}
            {membersLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-6">
                <User className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">
                  Nessun altro amministratore disponibile
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[250px] pr-4">
                <div className="space-y-2">
                  {filteredMembers.map((member) => (
                    <button
                      key={member.memberId}
                      onClick={() => setSelectedMember(member.memberId)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        selectedMember === member.memberId
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <Avatar>
                        <AvatarFallback>
                          {member.firstName?.[0]?.toUpperCase()}
                          {member.lastName?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <p className="font-medium">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                      {selectedMember === member.memberId && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignDialog({ open: false, ticketId: null })}
            >
              Annulla
            </Button>
            <Button 
              onClick={handleAssign} 
              disabled={isSubmitting || !selectedMember}
              className="gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Assegna
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}