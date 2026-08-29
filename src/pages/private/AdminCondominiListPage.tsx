import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Loader2,
    Search,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Home,
    Trash2,
    XCircle,
    Filter,
    X,
    ChevronLeft,
    ChevronRight,
    Building2,
    Plus,
} from "lucide-react";
import {
    condominiumApi,
    type CondominiumDto,
} from "@/app/api/condominium";
import CreateCondominium from "@/components/adminDashboard/CreateCondominium";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type SortField =
    | "name"
    | "address"
    | "city"
    | "cap"
    | "condominiumEmail";

type SortDirection = "asc" | "desc";

const SEARCH_DEBOUNCE_MS = 600;

export default function AdminCondominiListPage() {
    const navigate = useNavigate();

    // Data
    const [condomini, setCondomini] = useState<CondominiumDto[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [nameFilter, setNameFilter] = useState("");
    const [addressFilter, setAddressFilter] = useState("");
    const [debouncedNameFilter, setDebouncedNameFilter] = useState("");
    const [debouncedAddressFilter, setDebouncedAddressFilter] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    // Pagination & sorting
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [sortField, setSortField] = useState<SortField>("name");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

    // Delete dialog states
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
    const [deleteTargetName, setDeleteTargetName] = useState("");
    const [deleteInputValue, setDeleteInputValue] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // Debounce ricerca
    useEffect(() => {
        const timer = window.setTimeout(() => {
            setDebouncedNameFilter(nameFilter.trim());
            setDebouncedAddressFilter(addressFilter.trim());
            setPage(0);
        }, SEARCH_DEBOUNCE_MS);

        return () => {
            window.clearTimeout(timer);
        };
    }, [nameFilter, addressFilter]);

    // Fetch condomini
    const fetchCondomini = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await condominiumApi.fetchCondominiums({
                page,
                size,
                sortBy: sortField,
                ascending: sortDirection === "asc",
                name: debouncedNameFilter || undefined,
                address: debouncedAddressFilter || undefined,
            });

            setCondomini(response.data ?? []);
            setTotalElements(response.totalElements ?? 0);
        } catch (err: unknown) {
            console.error("Errore caricamento condomini:", err);
            const message =
                err instanceof Error
                    ? err.message
                    : "Errore nel caricamento dei condomini";
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [
        page,
        size,
        sortField,
        sortDirection,
        debouncedNameFilter,
        debouncedAddressFilter,
    ]);

    useEffect(() => {
        fetchCondomini();
    }, [fetchCondomini]);

    // Sorting
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection((currentDirection) =>
                currentDirection === "asc" ? "desc" : "asc"
            );
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
        setPage(0);
    };

    const renderSortIcon = (field: SortField) => {
        if (sortField !== field) {
            return <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />;
        }
        return sortDirection === "asc" ? (
            <ArrowUp className="ml-2 h-3 w-3" />
        ) : (
            <ArrowDown className="ml-2 h-3 w-3" />
        );
    };

    // Pagination
    const totalPages = Math.ceil(totalElements / size);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage < totalPages) {
            setPage(newPage);
        }
    };

    const handleSizeChange = (newSize: string) => {
        const parsedSize = Number(newSize);
        setSize(parsedSize);
        setPage(0);
    };

    // Filters
    const handleClearFilters = () => {
        setNameFilter("");
        setAddressFilter("");
    };

    const hasActiveFilters = nameFilter.trim() !== "" || addressFilter.trim() !== "";

    // Delete handlers
    const handleDeleteClick = (id: string, name: string) => {
        setDeleteTargetId(id);
        setDeleteTargetName(name);
        setDeleteInputValue("");
        setDeleteError(null);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTargetId || deleteInputValue !== deleteTargetName) return;

        setIsDeleting(true);
        setDeleteError(null);

        try {
            await condominiumApi.deleteCondominium(deleteTargetId);
            setDeleteDialogOpen(false);

            const response = await condominiumApi.fetchCondominiums({
                page,
                size,
                sortBy: sortField,
                ascending: sortDirection === "asc",
                name: debouncedNameFilter || undefined,
                address: debouncedAddressFilter || undefined,
            });

            setCondomini(response.data ?? []);
            setTotalElements(response.totalElements ?? 0);

            if ((response.data?.length ?? 0) === 0 && page > 0) {
                setPage(page - 1);
            }
        } catch (err: any) {
            setDeleteError(err.message || "Errore durante l'eliminazione");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                        <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                            Condomini
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {totalElements} condomini totali
                        </p>
                    </div>
                </div>
                 <CreateCondominium onCondominiumCreated={fetchCondomini} />
            </div>

            {/* Filtri */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Filter className="h-5 w-5 text-primary" />
                                Filtri di ricerca
                            </CardTitle>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className="gap-2"
                        >
                            {showFilters ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
                            {showFilters ? "Nascondi" : "Mostra"}
                        </Button>
                    </div>
                </CardHeader>
                {showFilters && (
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <Label className="text-xs">Nome condominio</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Es. Condominio Milano"
                                    value={nameFilter}
                                    onChange={(event) => setNameFilter(event.target.value)}
                                    className="pl-9 h-9"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Indirizzo</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Es. Via Roma, 12"
                                    value={addressFilter}
                                    onChange={(event) => setAddressFilter(event.target.value)}
                                    className="pl-9 h-9"
                                />
                            </div>
                        </div>
                        {hasActiveFilters && (
                            <div className="sm:col-span-2 flex justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClearFilters}
                                    className="gap-2"
                                >
                                    <XCircle className="h-4 w-4" />
                                    Cancella filtri
                                </Button>
                            </div>
                        )}
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
                                    <TableHead
                                        className="font-semibold cursor-pointer hover:text-primary"
                                        onClick={() => handleSort("name")}
                                    >
                                        <div className="flex items-center">
                                            Nome
                                            {renderSortIcon("name")}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="font-semibold cursor-pointer hover:text-primary hidden md:table-cell"
                                        onClick={() => handleSort("address")}
                                    >
                                        <div className="flex items-center">
                                            Indirizzo
                                            {renderSortIcon("address")}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="font-semibold cursor-pointer hover:text-primary hidden lg:table-cell"
                                        onClick={() => handleSort("city")}
                                    >
                                        <div className="flex items-center">
                                            Città
                                            {renderSortIcon("city")}
                                        </div>
                                    </TableHead>
                                    <TableHead className="font-semibold text-right">Azioni</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={4}>
                                                <Skeleton className="h-12 w-full" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : condomini.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-12">
                                            <Building2 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                                            <p className="text-muted-foreground font-medium">Nessun condominio trovato</p>
                                            {hasActiveFilters && (
                                                <Button variant="link" onClick={handleClearFilters} className="mt-2">
                                                    Rimuovi filtri
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    condomini.map((condominium) => (
                                        <TableRow
                                            key={condominium.id}
                                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                                            onClick={() => navigate(`/admin/condomini/${condominium.id}`)}
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="rounded-lg bg-primary/10 p-2">
                                                        <Building2 className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-medium truncate">{condominium.name}</p>
                                                        <p className="text-xs text-muted-foreground truncate sm:hidden">
                                                            {condominium.address}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                {condominium.address}
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell">
                                                {condominium.city}
                                            </TableCell>
                                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => navigate(`/admin/condomini/${condominium.id}`)}
                                                        className="gap-1"
                                                    >
                                                        <Home className="h-4 w-4" />
                                                        <span className="hidden sm:inline">Entra</span>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDeleteClick(condominium.id, condominium.name)
                                                        }
                                                        className="gap-1 text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="hidden sm:inline">Elimina</span>
                                                    </Button>
                                                </div>
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
                        Mostrati <span className="font-medium">{condomini.length}</span> di{" "}
                        <span className="font-medium">{totalElements}</span> condomini
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 0}
                            className="gap-1"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Precedente</span>
                        </Button>
                        <span className="text-sm px-2 whitespace-nowrap">
                            Pagina <span className="font-medium">{page + 1}</span> di{" "}
                            <span className="font-medium">{totalPages}</span>
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page >= totalPages - 1}
                            className="gap-1"
                        >
                            <span className="hidden sm:inline">Successiva</span>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Label className="text-xs whitespace-nowrap">
                            Righe per pagina:
                        </Label>
                        <Select value={String(size)} onValueChange={handleSizeChange}>
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

            {/* Dialog di conferma eliminazione */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <Trash2 className="h-5 w-5" />
                            Elimina condominio
                        </DialogTitle>
                        <DialogDescription>
                            Questa azione è <span className="font-semibold text-destructive">irreversibile</span>.
                            Tutti i dati associati verranno cancellati definitivamente.
                            <br />
                            <br />
                            Per confermare, digita il nome del condominio:{' '}
                            <span className="font-mono font-semibold text-foreground">
                                {deleteTargetName}
                            </span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1">
                            <Label htmlFor="delete-confirm-input" className="text-sm font-medium">
                                Nome condominio
                            </Label>
                            <Input
                                id="delete-confirm-input"
                                type="text"
                                value={deleteInputValue}
                                onChange={(e) => setDeleteInputValue(e.target.value)}
                                placeholder="Inserisci il nome del condominio"
                                className="font-mono"
                                autoFocus
                            />
                            {deleteError && (
                                <p className="text-sm text-destructive mt-1">{deleteError}</p>
                            )}
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-between">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={isDeleting}
                        >
                            Annulla
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDelete}
                            disabled={isDeleting || deleteInputValue !== deleteTargetName || !deleteTargetId}
                            className="min-w-[100px] gap-2"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Eliminazione...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4" />
                                    Elimina
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}