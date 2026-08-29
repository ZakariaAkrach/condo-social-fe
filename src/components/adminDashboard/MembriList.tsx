import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  UserPlus,
  Mail,
  Pencil,
  Trash2,
  Info,
  Search,
  X,
  CheckCircle,
  XCircle,
  Users,
  Filter,
  ChevronLeft,
  ChevronRight,
  User,
  Shield,
  Home,
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { condominiumMemberApi } from "@/app/api/condominiumMember";
import { useAuth } from "@/auth/AuthProvider";

interface MembriListProps {
  condominiumId: string;
}

// Mappatura ruoli (enum backend -> visualizzazione italiana)
const ROLE_MAP: Record<string, string> = {
  CONDO_ADMIN: "Amministratore",
  CONDO_SUB_ADMIN: "Sub Admin",
  CONDO_RESIDENT: "Residente",
};

// Mappatura stati invito (enum backend -> visualizzazione italiana)
const INVITATION_STATUS_MAP: Record<string, string> = {
  PENDING: "Invito in corso",
  SUCCESS: "Invitato",
  FAILED: "Fallito",
};

// Stato iniziale dei filtri
const DEFAULT_FILTERS = {
  statusInvitation: "all",
  email: "",
  firstName: "",
  lastName: "",
  role: "",
};

export function MembriList({ condominiumId }: MembriListProps) {
  const { profile } = useAuth();
  const currentUserId = profile?.id;

  // --- Stati per dati e paginazione ---
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Metadati paginazione
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Parametri di query effettivi per il fetch
  const [queryParams, setQueryParams] = useState({
    filters: DEFAULT_FILTERS,
    page: 0,
    size: 10,
    sortBy: "lastName",
    ascending: true,
  });

  // Valori correnti dei campi filtro (non ancora applicati)
  const [filterValues, setFilterValues] = useState(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  // --- Stati per selezione e dialog ---
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [deletingMember, setDeletingMember] = useState<any | null>(null);

  // Form per aggiunta/modifica
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    ruolo: "residente" as "residente" | "subAdmin" | "admin",
  });

  // Stati per operazioni in corso
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  // Stato per i risultati dell'invito
  const [inviteResults, setInviteResults] = useState<string[] | null>(null);
  const [isResultsDialogOpen, setIsResultsDialogOpen] = useState(false);

  // Reset del form di creazione quando il dialog viene aperto
  useEffect(() => {
    if (isAddDialogOpen) {
      setFormData({ firstName: "", lastName: "", email: "", ruolo: "residente" });
    }
  }, [isAddDialogOpen]);

  // Funzione per determinare se un membro è selezionabile/modificabile/eliminabile
  const isMemberSelectable = useCallback(
    (member: any) => {
      if (member.role === "CONDO_ADMIN") return false;
      if (currentUserId && member.id === currentUserId) return false;
      return true;
    },
    [currentUserId]
  );

  // Funzione per caricare i membri dal backend
  const fetchMembers = useCallback(
    async (params: typeof queryParams) => {
      setLoading(true);
      setError(null);
      try {
        const response = await condominiumMemberApi.fetchMembers(
          {
            statusInvitation:
              params.filters.statusInvitation === "all"
                ? ""
                : params.filters.statusInvitation,
            email: params.filters.email,
            firstName: params.filters.firstName,
            lastName: params.filters.lastName,
            role: params.filters.role === "" ? undefined : params.filters.role,
            page: params.page,
            size: params.size,
            sortBy: params.sortBy,
            ascending: params.ascending,
          },
          condominiumId
        );
        setMembers(response.data || []);
        setTotalElements(response.totalElements || 0);
        setTotalPages(response.totalPages || 0);
      } catch (err: any) {
        console.error("Errore fetch membri:", err);
        setError("Impossibile caricare i membri. Riprova più tardi.");
        toast.error("Errore nel caricamento dei membri");
      } finally {
        setLoading(false);
      }
    },
    [condominiumId]
  );

  useEffect(() => {
    fetchMembers(queryParams);
  }, [fetchMembers, queryParams]);

  // Gestione selezione
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const selectableMembers = members.filter(isMemberSelectable);
    const allSelectableSelected = selectableMembers.every((m) =>
      selectedIds.includes(m.id)
    );

    if (allSelectableSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !selectableMembers.some((m) => m.id === id))
      );
    } else {
      const newSelected = [
        ...selectedIds,
        ...selectableMembers
          .map((m) => m.id)
          .filter((id) => !selectedIds.includes(id)),
      ];
      setSelectedIds(newSelected);
    }
  };

  const selectedCount = selectedIds.length;

  // Creazione membro
  const handleAddMember = async () => {
    try {
      setIsSubmitting(true);
      const roleMap: Record<string, string> = {
        residente: "CONDO_RESIDENT",
        subAdmin: "CONDO_SUB_ADMIN",
        admin: "CONDO_ADMIN",
      };

      const payload = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: roleMap[formData.ruolo],
      };

      await condominiumMemberApi.createMember(payload, condominiumId);

      setFormData({ firstName: "", lastName: "", email: "", ruolo: "residente" });
      setIsAddDialogOpen(false);
      toast.success("Membro creato con successo");
      fetchMembers(queryParams);
    } catch (err: any) {
      console.error("Errore creazione membro:", err);
      toast.error(err.response?.data?.message || "Errore durante la creazione");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modifica membro
  const handleEditMember = async () => {
    if (!editingMember) return;
    try {
      setIsSubmitting(true);
      const roleMap: Record<string, string> = {
        residente: "CONDO_RESIDENT",
        subAdmin: "CONDO_SUB_ADMIN",
        admin: "CONDO_ADMIN",
      };

      const payload = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: roleMap[formData.ruolo],
      };

      await condominiumMemberApi.updateMember(
        payload,
        condominiumId,
        editingMember.id
      );

      setEditingMember(null);
      setFormData({ firstName: "", lastName: "", email: "", ruolo: "residente" });
      setIsEditDialogOpen(false);
      toast.success("Membro aggiornato con successo");
      fetchMembers(queryParams);
    } catch (err: any) {
      console.error("Errore modifica membro:", err);
      toast.error(err.response?.data?.message || "Errore durante l'aggiornamento");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Elimina membro
  const handleDeleteMember = async () => {
    if (!deletingMember) return;
    try {
      setIsDeleting(true);
      await condominiumMemberApi.deleteMember(condominiumId, deletingMember.id);

      setDeletingMember(null);
      setIsDeleteDialogOpen(false);
      toast.success("Membro eliminato con successo");
      fetchMembers(queryParams);
    } catch (err: any) {
      console.error("Errore eliminazione membro:", err);
      toast.error(err.response?.data?.message || "Errore durante l'eliminazione");
    } finally {
      setIsDeleting(false);
    }
  };

  // Invito membri
  const handleInvite = async () => {
    if (selectedCount === 0) {
      toast.warning("Seleziona almeno un membro da invitare");
      return;
    }
    try {
      setIsInviting(true);
      const response = await condominiumMemberApi.inviteMembers(
        { idMembers: selectedIds },
        condominiumId
      );

      const results = response?.data?.data ?? response?.data ?? [];
      setInviteResults(Array.isArray(results) ? results : []);
      setIsResultsDialogOpen(true);

      setSelectedIds([]);
      setIsInviteDialogOpen(false);
      toast.success(`Invito inviato a ${selectedCount} membro/i`);
      fetchMembers(queryParams);
    } catch (err: any) {
      console.error("Errore invito membri:", err);
      toast.error(err.response?.data?.message || "Errore durante l'invito");
    } finally {
      setIsInviting(false);
    }
  };

  // Apertura dialog modifica/elimina
  const openEditDialog = (member: any) => {
    if (!isMemberSelectable(member)) {
      toast.warning("Non puoi modificare questo membro");
      return;
    }
    setEditingMember(member);
    setFormData({
      firstName: member.firstName || "",
      lastName: member.lastName || "",
      email: member.email,
      ruolo:
        member.role === "CONDO_ADMIN"
          ? "admin"
          : member.role === "CONDO_SUB_ADMIN"
          ? "subAdmin"
          : "residente",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (member: any) => {
    if (!isMemberSelectable(member)) {
      toast.warning("Non puoi eliminare questo membro");
      return;
    }
    setDeletingMember(member);
    setIsDeleteDialogOpen(true);
  };

  // Utility
  const getFullName = (member: any) =>
    `${member.firstName || ""} ${member.lastName || ""}`.trim() || "N/A";

  const getRoleLabel = (role: string) => ROLE_MAP[role] || role;

  const getInvitationStatusLabel = (member: any) => {
    if (member.role === "CONDO_ADMIN") {
      return "Membro";
    }
    const status = member.invitationStatus;
    if (!status) {
      return "Da invitare";
    }
    return INVITATION_STATUS_MAP[status] || status;
  };

  // Gestione ricerca e reset
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

  // Cambio pagina
  const goToPage = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setQueryParams((prev) => ({ ...prev, page }));
    }
  };

  const handlePageSizeChange = (size: number) => {
    setQueryParams((prev) => ({ ...prev, size, page: 0 }));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Membri</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {totalElements} membri totali
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
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
                size="sm"
                onClick={() => setIsAddDialogOpen(true)}
                className="gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Aggiungi
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsInviteDialogOpen(true)}
                className="gap-2"
              >
                <Mail className="h-4 w-4" />
                Invita
                {selectedCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {selectedCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Filtri espandibili */}
        {showFilters && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="space-y-1">
                <Label htmlFor="filter-firstName" className="text-xs">Nome</Label>
                <Input
                  id="filter-firstName"
                  placeholder="Nome"
                  value={filterValues.firstName}
                  onChange={(e) =>
                    setFilterValues((prev) => ({ ...prev, firstName: e.target.value }))
                  }
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="filter-lastName" className="text-xs">Cognome</Label>
                <Input
                  id="filter-lastName"
                  placeholder="Cognome"
                  value={filterValues.lastName}
                  onChange={(e) =>
                    setFilterValues((prev) => ({ ...prev, lastName: e.target.value }))
                  }
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="filter-email" className="text-xs">Email</Label>
                <Input
                  id="filter-email"
                  placeholder="Email"
                  value={filterValues.email}
                  onChange={(e) =>
                    setFilterValues((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Ruolo</Label>
                <Select
                  value={filterValues.role}
                  onValueChange={(val) =>
                    setFilterValues((prev) => ({ ...prev, role: val }))
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Tutti" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tutti</SelectItem>
                    <SelectItem value="CONDO_ADMIN">Amministratore</SelectItem>
                    <SelectItem value="CONDO_SUB_ADMIN">Sub Admin</SelectItem>
                    <SelectItem value="CONDO_RESIDENT">Residente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Stato invito</Label>
                <Select
                  value={filterValues.statusInvitation}
                  onValueChange={(val) =>
                    setFilterValues((prev) => ({ ...prev, statusInvitation: val }))
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Tutti" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti</SelectItem>
                    <SelectItem value="PENDING">In attesa</SelectItem>
                    <SelectItem value="SUCCESS">Completato</SelectItem>
                    <SelectItem value="FAILED">Fallito</SelectItem>
                  </SelectContent>
                </Select>
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
                  <TableHead className="w-10">
                    <Checkbox
                      checked={
                        members.length > 0 &&
                        members.filter(isMemberSelectable).every((m) =>
                          selectedIds.includes(m.id)
                        ) &&
                        members.some(isMemberSelectable)
                      }
                      onCheckedChange={toggleSelectAll}
                      aria-label="Seleziona tutti"
                    />
                  </TableHead>
                  <TableHead className="font-semibold">Membro</TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">Email</TableHead>
                  <TableHead className="font-semibold">Ruolo</TableHead>
                  <TableHead className="font-semibold hidden sm:table-cell">Stato invito</TableHead>
                  <TableHead className="font-semibold text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6}>
                        <Skeleton className="h-12 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-muted-foreground font-medium">Nessun membro trovato</p>
                      <p className="text-sm text-muted-foreground/70 mt-1">
                        Prova a modificare i filtri di ricerca
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((m) => {
                    const selectable = isMemberSelectable(m);
                    const statusLabel = getInvitationStatusLabel(m);
                    let statusVariant: "default" | "secondary" | "destructive" | "outline" = "outline";
                    
                    if (m.role === "CONDO_ADMIN") {
                      statusVariant = "default";
                    } else if (m.invitationStatus === "SUCCESS") {
                      statusVariant = "default";
                    } else if (m.invitationStatus === "PENDING") {
                      statusVariant = "secondary";
                    } else if (m.invitationStatus === "FAILED") {
                      statusVariant = "destructive";
                    } else {
                      statusVariant = "outline";
                    }

                    const RoleIcon = m.role === "CONDO_ADMIN" ? Shield : m.role === "CONDO_SUB_ADMIN" ? User : Home;

                    return (
                      <TableRow key={m.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(m.id)}
                            onCheckedChange={() => toggleSelect(m.id)}
                            disabled={!selectable}
                            aria-label={`Seleziona ${getFullName(m)}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {m.firstName?.[0]?.toUpperCase()}
                                {m.lastName?.[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {m.firstName} {m.lastName}
                              </div>
                              <div className="text-xs text-muted-foreground sm:hidden">
                                {m.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {m.email}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              m.role === "CONDO_ADMIN"
                                ? "default"
                                : m.role === "CONDO_SUB_ADMIN"
                                ? "secondary"
                                : "outline"
                            }
                            className="gap-1"
                          >
                            <RoleIcon className="h-3 w-3" />
                            {getRoleLabel(m.role)}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant={statusVariant}>
                            {statusLabel}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditDialog(m)}
                              disabled={!selectable}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => openDeleteDialog(m)}
                              disabled={!selectable}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
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
            Mostrati <span className="font-medium">{members.length}</span> di{" "}
            <span className="font-medium">{totalElements}</span> membri
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

      {/* Dialog Aggiungi */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Aggiungi membro</DialogTitle>
            <DialogDescription>
              Inserisci i dati del nuovo membro.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="firstName">Nome</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                  }
                  placeholder="Mario"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Cognome</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                  }
                  placeholder="Rossi"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="mario@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ruolo">Ruolo</Label>
              <Select
                value={formData.ruolo}
                onValueChange={(val: any) =>
                  setFormData((prev) => ({ ...prev, ruolo: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona ruolo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residente">Residente</SelectItem>
                  <SelectItem value="subAdmin">Sub Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.ruolo === "subAdmin" && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-800/50">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <span className="font-medium">Sub Admin</span> – Permessi di
                  amministratore per questo condominio.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleAddMember} disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Aggiungi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Modifica */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifica membro</DialogTitle>
            <DialogDescription>
              Aggiorna i dati del membro.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="edit-firstName">Nome</Label>
                <Input
                  id="edit-firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-lastName">Cognome</Label>
                <Input
                  id="edit-lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                disabled
              />
              <p className="text-xs text-muted-foreground">
                L'email non può essere modificata. Per cambiarla, elimina il
                membro e creane uno nuovo con l'email corretta.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-ruolo">Ruolo</Label>
              <Select
                value={formData.ruolo}
                onValueChange={(val: any) =>
                  setFormData((prev) => ({ ...prev, ruolo: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona ruolo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residente">Residente</SelectItem>
                  <SelectItem value="subAdmin">Sub Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.ruolo === "subAdmin" && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-800/50">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <span className="font-medium">Sub Admin</span> – Permessi di
                  amministratore per questo condominio.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleEditMember} disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Salva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Elimina */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Questa azione eliminerà permanentemente il membro{" "}
                <strong className="text-foreground">
                  {getFullName(deletingMember || {})}
                </strong>
                .
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Invita */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invita membri</DialogTitle>
            <DialogDescription>
              {selectedCount === 0 ? (
                "Nessun membro selezionato. Seleziona almeno una riga dalla tabella."
              ) : (
                <>
                  Stai per inviare un invito a <strong>{selectedCount}</strong>{" "}
                  membro{selectedCount > 1 ? "i" : ""} selezionato
                  {selectedCount > 1 ? "i" : ""}.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
              Annulla
            </Button>
            <Button
              onClick={handleInvite}
              disabled={selectedCount === 0 || isInviting}
              className="gap-2"
            >
              {isInviting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              Invita
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Risultati Invito */}
      <Dialog open={isResultsDialogOpen} onOpenChange={setIsResultsDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Esito inviti</DialogTitle>
            <DialogDescription>
              Di seguito i dettagli per ogni membro invitato.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            {inviteResults && inviteResults.length > 0 ? (
              inviteResults.map((msg, index) => {
                const isSuccess =
                  !msg.toLowerCase().includes("non trovato") &&
                  !msg.toLowerCase().includes("già attivo") &&
                  !msg.toLowerCase().includes("fallito") &&
                  !msg.toLowerCase().includes("errore");
                return (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-2 rounded-md border bg-muted/30"
                  >
                    {isSuccess ? (
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <span className="text-sm">{msg}</span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">
                Nessun dettaglio ricevuto.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsResultsDialogOpen(false)}>Chiudi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}