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
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Loader2,
    Search,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Home,
    Trash2,
    XCircle,
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

    // -------------------------------------------------------------------------
    // Data
    // -------------------------------------------------------------------------

    const [condomini, setCondomini] = useState<CondominiumDto[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // -------------------------------------------------------------------------
    // Filters
    // -------------------------------------------------------------------------

    const [nameFilter, setNameFilter] = useState("");
    const [addressFilter, setAddressFilter] = useState("");
    const [debouncedNameFilter, setDebouncedNameFilter] = useState("");
    const [debouncedAddressFilter, setDebouncedAddressFilter] = useState("");

    // -------------------------------------------------------------------------
    // Pagination & sorting
    // -------------------------------------------------------------------------

    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [sortField, setSortField] = useState<SortField>("name");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

    // -------------------------------------------------------------------------
    // Delete dialog states
    // -------------------------------------------------------------------------

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
    const [deleteTargetName, setDeleteTargetName] = useState("");
    const [deleteInputValue, setDeleteInputValue] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // -------------------------------------------------------------------------
    // Debounce ricerca
    // -------------------------------------------------------------------------

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

    // -------------------------------------------------------------------------
    // Fetch condomini
    // -------------------------------------------------------------------------

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

    // -------------------------------------------------------------------------
    // Sorting
    // -------------------------------------------------------------------------

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

    // -------------------------------------------------------------------------
    // Pagination
    // -------------------------------------------------------------------------

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

    // -------------------------------------------------------------------------
    // Filters
    // -------------------------------------------------------------------------

    const handleClearFilters = () => {
        setNameFilter("");
        setAddressFilter("");
    };

    const hasActiveFilters = nameFilter.trim() !== "" || addressFilter.trim() !== "";

    // -------------------------------------------------------------------------
    // Delete handlers
    // -------------------------------------------------------------------------

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

            // Chiudi il dialog
            setDeleteDialogOpen(false);

            // Ricarica i dati per la pagina corrente
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

            // Se la pagina corrente è vuota e non siamo alla prima, vai indietro
            if ((response.data?.length ?? 0) === 0 && page > 0) {
                setPage(page - 1);
                // L'effect su page farà il fetch automaticamente
            }
        } catch (err: any) {
            setDeleteError(err.message || "Errore durante l'eliminazione");
        } finally {
            setIsDeleting(false);
        }
    };

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
        <section className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="flex items-center gap-2.5 text-2xl font-bold text-foreground">
                        <Home className="h-6 w-6 text-primary" />
                        Condomini
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Ricerca e gestione di tutti i condomini
                    </p>
                </div>
                <CreateCondominium />
            </div>

            {/* Filtri */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base">Filtri di ricerca</CardTitle>
                            <CardDescription>Cerca per nome o indirizzo</CardDescription>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearFilters}
                            disabled={!hasActiveFilters}
                            className="gap-1"
                        >
                            <XCircle className="h-4 w-4" />
                            Cancella filtri
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                        <label htmlFor="filter-name" className="text-sm font-medium">
                            Nome condominio
                        </label>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="filter-name"
                                placeholder="Es. Condominio Milano"
                                value={nameFilter}
                                onChange={(event) => setNameFilter(event.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="filter-address" className="text-sm font-medium">
                            Indirizzo
                        </label>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="filter-address"
                                placeholder="Es. Via Roma, 12"
                                value={addressFilter}
                                onChange={(event) => setAddressFilter(event.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabella */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="text-base">
                            Risultati ({totalElements})
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                Righe per pagina
                            </span>
                            <Select value={String(size)} onValueChange={handleSizeChange}>
                                <SelectTrigger className="w-[70px]">
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
                </CardHeader>

                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : error ? (
                        <div className="py-12 text-center text-destructive">
                            <p>Errore: {error}</p>
                        </div>
                    ) : condomini.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            <p>Nessun condominio trovato.</p>
                            {hasActiveFilters && (
                                <Button variant="link" onClick={handleClearFilters} className="mt-2">
                                    Rimuovi filtri
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead
                                                className="cursor-pointer transition-colors hover:bg-muted/50"
                                                onClick={() => handleSort("name")}
                                            >
                                                <div className="flex items-center">
                                                    Nome
                                                    {renderSortIcon("name")}
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer transition-colors hover:bg-muted/50"
                                                onClick={() => handleSort("address")}
                                            >
                                                <div className="flex items-center">
                                                    Indirizzo
                                                    {renderSortIcon("address")}
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer transition-colors hover:bg-muted/50"
                                                onClick={() => handleSort("city")}
                                            >
                                                <div className="flex items-center">
                                                    Città
                                                    {renderSortIcon("city")}
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="hidden cursor-pointer transition-colors hover:bg-muted/50 md:table-cell"
                                                onClick={() => handleSort("cap")}
                                            >
                                                <div className="flex items-center">
                                                    CAP
                                                    {renderSortIcon("cap")}
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="hidden cursor-pointer transition-colors hover:bg-muted/50 lg:table-cell"
                                                onClick={() => handleSort("condominiumEmail")}
                                            >
                                                <div className="flex items-center">
                                                    Email
                                                    {renderSortIcon("condominiumEmail")}
                                                </div>
                                            </TableHead>
                                            <TableHead className="text-right">Azioni</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {condomini.map((condominium) => (
                                            <TableRow
                                                key={condominium.id}
                                                className="transition-colors hover:bg-muted/50"
                                            >
                                                <TableCell className="font-medium">
                                                    {condominium.name}
                                                </TableCell>
                                                <TableCell>{condominium.address}</TableCell>
                                                <TableCell>{condominium.city}</TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    {condominium.cap || "-"}
                                                </TableCell>
                                                <TableCell className="hidden lg:table-cell">
                                                    {condominium.condominiumEmail || "-"}
                                                </TableCell>
                                                <TableCell className="text-right space-x-2 whitespace-nowrap">
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        onClick={() => navigate(`/admin/condomini/${condominium.id}`)}
                                                        className="gap-1"
                                                    >
                                                        <Home className="h-4 w-4" />
                                                        <span className="hidden sm:inline">Entra</span>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDeleteClick(condominium.id, condominium.name)
                                                        }
                                                        className="gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                        title="Elimina condominio"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="hidden sm:inline">Elimina</span>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 0 && (
                                <div className="flex flex-col gap-2 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        Mostrati {condomini.length} di {totalElements} condomini
                                        <span className="ml-2 hidden sm:inline">
                                            – Pagina {page + 1} di {totalPages}
                                        </span>
                                    </div>
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    onClick={() => handlePageChange(page - 1)}
                                                    className={
                                                        page === 0
                                                            ? "pointer-events-none opacity-50"
                                                            : "cursor-pointer"
                                                    }
                                                />
                                            </PaginationItem>
                                            {Array.from(
                                                {
                                                    length: Math.min(5, totalPages),
                                                },
                                                (_, index) => {
                                                    let pageNum = index;
                                                    if (totalPages > 5) {
                                                        if (page < 2) {
                                                            pageNum = index;
                                                        } else if (page > totalPages - 3) {
                                                            pageNum = totalPages - 5 + index;
                                                        } else {
                                                            pageNum = page - 2 + index;
                                                        }
                                                    }
                                                    return (
                                                        <PaginationItem key={pageNum}>
                                                            <PaginationLink
                                                                onClick={() => handlePageChange(pageNum)}
                                                                isActive={page === pageNum}
                                                            >
                                                                {pageNum + 1}
                                                            </PaginationLink>
                                                        </PaginationItem>
                                                    );
                                                }
                                            )}
                                            <PaginationItem>
                                                <PaginationNext
                                                    onClick={() => handlePageChange(page + 1)}
                                                    className={
                                                        page >= totalPages - 1
                                                            ? "pointer-events-none opacity-50"
                                                            : "cursor-pointer"
                                                    }
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

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
                            className="min-w-[100px]"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Eliminazione...
                                </>
                            ) : (
                                "Elimina condominio"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </section>
    );
}