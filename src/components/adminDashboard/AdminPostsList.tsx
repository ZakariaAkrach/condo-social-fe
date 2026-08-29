// src/components/adminDashboard/AdminPostsList.tsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
    Loader2,
    Plus,
    Search,
    Eye,
    Trash2,
    FileText,
    Clock,
    CheckCircle,
    EyeOff,
    RefreshCw,
    MoreHorizontal,
    Filter,
    AlertCircle,
    Megaphone,
    X,
    ChevronLeft,
    ChevronRight,
    Inbox,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { postAdminApi, type FetchPostsResponseDto } from "@/app/api/postAdmin";
import { Label } from "../ui/label";

interface AdminPostsListProps {
    condominiumId: string;
}

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
    ACTIVE: { label: "Attivo", variant: "default", icon: CheckCircle },
    DRAFT: { label: "Bozza", variant: "secondary", icon: EyeOff },
    DELETED: { label: "Eliminato", variant: "destructive", icon: Trash2 },
};

export function AdminPostsList({ condominiumId }: AdminPostsListProps) {
    const navigate = useNavigate();

    const [posts, setPosts] = useState<FetchPostsResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [filters, setFilters] = useState({
        title: "",
        body: "",
        status: "",
        page: 0,
        size: 10,
        sortBy: "createdAt",
        ascending: false,
    });
    const [filterValues, setFilterValues] = useState({
        title: "",
        status: "",
    });
    const [showFilters, setShowFilters] = useState(false);

    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
    const [selectAll, setSelectAll] = useState(false);

    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        type: "single" | "bulk" | "program-single" | "program-bulk";
        postId?: string;
    }>({ open: false, type: "single" });
    const [actionLoading, setActionLoading] = useState(false);

    const fetchPosts = useCallback(async () => {
        if (!condominiumId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await postAdminApi.fetchPosts(condominiumId, filters);
            setPosts(response.data || []);
            setTotalElements(response.totalElements || 0);
            setTotalPages(response.totalPages || 0);
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Errore nel caricamento dei post";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, [condominiumId, filters]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const toggleSelectAll = () => {
        if (selectAll) {
            setSelectedPosts(new Set());
        } else {
            setSelectedPosts(new Set(posts.map((p) => p.id)));
        }
        setSelectAll(!selectAll);
    };

    const toggleSelectPost = (postId: string) => {
        const newSet = new Set(selectedPosts);
        if (newSet.has(postId)) {
            newSet.delete(postId);
        } else {
            newSet.add(postId);
        }
        setSelectedPosts(newSet);
        setSelectAll(newSet.size === posts.length && posts.length > 0);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchPosts();
        setRefreshing(false);
        toast.success("Lista aggiornata");
    };

    const handleSearch = () => {
        setFilters((prev) => ({
            ...prev,
            title: filterValues.title,
            status: filterValues.status,
            page: 0,
        }));
    };

    const handleReset = () => {
        setFilterValues({ title: "", status: "" });
        setFilters((prev) => ({
            ...prev,
            title: "",
            status: "",
            page: 0,
        }));
    };

    const goToDetail = (postId: string) => {
        navigate(`/admin/condomini/${condominiumId}/posts/${postId}`);
    };

    const goToCreate = () => {
        navigate(`/admin/condomini/${condominiumId}/posts/create`);
    };

    const handleDeleteSingle = (postId: string, program: boolean = false) => {
        setDeleteDialog({
            open: true,
            type: program ? "program-single" : "single",
            postId,
        });
    };

    const handleDeleteBulk = (program: boolean = false) => {
        if (selectedPosts.size === 0) {
            toast.warning("Seleziona almeno un post");
            return;
        }
        setDeleteDialog({
            open: true,
            type: program ? "program-bulk" : "bulk",
        });
    };

    const confirmDelete = async () => {
        if (!condominiumId) return;

        setActionLoading(true);

        try {
            const { type, postId } = deleteDialog;

            if (type === "single" && postId) {
                await postAdminApi.deletePost(condominiumId, postId);
                toast.success("Post eliminato definitivamente");
                setSelectedPosts((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(postId);
                    return newSet;
                });
            }

            if (type === "program-single" && postId) {
                await postAdminApi.programDeletion(condominiumId, postId);
                toast.success("Post programmato per l'eliminazione");
                setSelectedPosts((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(postId);
                    return newSet;
                });
            }

            if (type === "bulk") {
                const response = await postAdminApi.bulkDeletion(condominiumId, {
                    idPosts: Array.from(selectedPosts),
                });
                toast.success(
                    `Eliminati ${response.data?.deletedCount || selectedPosts.size} post`
                );
                if (response.data?.failureId?.length > 0) {
                    toast.warning(`Impossibile eliminare ${response.data.failureId.length} post`);
                }
                setSelectedPosts(new Set());
                setSelectAll(false);
            }

            if (type === "program-bulk") {
                const response = await postAdminApi.bulkProgramDeletion(condominiumId, {
                    idPosts: Array.from(selectedPosts),
                });
                toast.success(
                    `Programmati ${response.data?.countMoveToTrash || selectedPosts.size} post`
                );
                if (response.data?.failureId?.length > 0) {
                    toast.warning(`Impossibile programmare ${response.data.failureId.length} post`);
                }
                setSelectedPosts(new Set());
                setSelectAll(false);
            }

            await fetchPosts();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Errore durante l'operazione");
        } finally {
            setActionLoading(false);
            setDeleteDialog({ open: false, type: "single" });
        }
    };

    const handleChangeStatus = async (postId: string, status: string) => {
        if (!condominiumId) return;

        try {
            await postAdminApi.changeStatus(condominiumId, postId, { status });
            toast.success(`Stato cambiato in ${status === "ACTIVE" ? "Attivo" : "Bozza"}`);
            await fetchPosts();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Errore durante il cambio stato");
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const config = STATUS_MAP[status] || STATUS_MAP.DRAFT;
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className="gap-1">
                <Icon className="h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const goToPage = (page: number) => {
        if (page >= 0 && page < totalPages) {
            setFilters((prev) => ({ ...prev, page }));
        }
    };

    const handlePageSizeChange = (size: number) => {
        setFilters((prev) => ({ ...prev, size, page: 0 }));
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-2">
                                <Megaphone className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Comunicazioni</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    {totalElements} post totali
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
                                variant="outline"
                                size="sm"
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="gap-2"
                            >
                                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                                Aggiorna
                            </Button>
                            <Button size="sm" onClick={goToCreate} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Nuovo Post
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                {/* Filtri espandibili */}
                {showFilters && (
                    <CardContent className="pt-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Titolo</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Cerca per titolo..."
                                        value={filterValues.title}
                                        onChange={(e) => setFilterValues((prev) => ({ ...prev, title: e.target.value }))}
                                        className="pl-9 h-9"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Stato</Label>
                                <Select
                                    value={filterValues.status}
                                    onValueChange={(value) => setFilterValues((prev) => ({ ...prev, status: value }))}
                                >
                                    <SelectTrigger className="h-9">
                                        <SelectValue placeholder="Tutti gli stati" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Tutti</SelectItem>
                                        <SelectItem value="ACTIVE">Attivo</SelectItem>
                                        <SelectItem value="DRAFT">Bozza</SelectItem>
                                        <SelectItem value="DELETED">Eliminato</SelectItem>
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

            {/* Barra selezione */}
            {selectedPosts.size > 0 && (
                <div className="flex flex-wrap items-center justify-between bg-primary/5 border border-primary/20 p-3 rounded-lg gap-2">
                    <span className="text-sm font-medium">
                        {selectedPosts.size} post selezionati
                    </span>
                    <div className="flex gap-2 flex-wrap">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteBulk(true)}
                            disabled={actionLoading}
                            className="gap-2"
                        >
                            <Clock className="h-4 w-4" />
                            Programma
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteBulk(false)}
                            disabled={actionLoading}
                            className="gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            Elimina
                        </Button>
                    </div>
                </div>
            )}

            {/* Tabella */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="w-10">
                                        <Checkbox
                                            checked={selectAll}
                                            onCheckedChange={toggleSelectAll}
                                            aria-label="Seleziona tutti"
                                        />
                                    </TableHead>
                                    <TableHead className="font-semibold">Titolo</TableHead>
                                    <TableHead className="font-semibold hidden md:table-cell">Stato</TableHead>
                                    <TableHead className="font-semibold hidden lg:table-cell">Data</TableHead>
                                    <TableHead className="font-semibold text-right">Azioni</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={5}>
                                                <Skeleton className="h-12 w-full" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : posts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12">
                                            <Inbox className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                                            <p className="text-muted-foreground font-medium">Nessun post trovato</p>
                                            <p className="text-sm text-muted-foreground/70 mt-1">
                                                Crea il tuo primo post o modifica i filtri
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    posts.map((post) => (
                                        <TableRow
                                            key={post.id}
                                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                                            onClick={() => goToDetail(post.id)}
                                        >
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={selectedPosts.has(post.id)}
                                                    onCheckedChange={() => toggleSelectPost(post.id)}
                                                    aria-label={`Seleziona ${post.title}`}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium truncate max-w-[150px] sm:max-w-[250px]">
                                                        {post.title}
                                                    </p>
                                                    <div className="flex gap-1 mt-1 flex-wrap">
                                                        {post.documents > 0 && (
                                                            <Badge variant="outline" className="text-[10px] gap-1">
                                                                <FileText className="h-3 w-3" />
                                                                {post.documents}
                                                            </Badge>
                                                        )}
                                                        {post.poll && (
                                                            <Badge variant="outline" className="text-[10px]">
                                                                Sondaggio
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <StatusBadge status={post.status} />
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell">
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                                    {format(new Date(post.createdAt), "dd MMM yyyy HH:mm", { locale: it })}
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
                                                        <DropdownMenuItem onClick={() => goToDetail(post.id)}>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            Dettaglio
                                                        </DropdownMenuItem>
                                                        {post.status !== "DELETED" && (
                                                            <>
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        handleChangeStatus(
                                                                            post.id,
                                                                            post.status === "ACTIVE" ? "DRAFT" : "ACTIVE"
                                                                        )
                                                                    }
                                                                >
                                                                    {post.status === "ACTIVE" ? (
                                                                        <>
                                                                            <EyeOff className="h-4 w-4 mr-2" />
                                                                            Metti in Bozza
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <CheckCircle className="h-4 w-4 mr-2" />
                                                                            Attiva
                                                                        </>
                                                                    )}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-yellow-600"
                                                                    onClick={() => handleDeleteSingle(post.id, true)}
                                                                >
                                                                    <Clock className="h-4 w-4 mr-2" />
                                                                    Programma Eliminazione
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-destructive"
                                                                    onClick={() => handleDeleteSingle(post.id, false)}
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Elimina
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
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
                        Mostrati <span className="font-medium">{posts.length}</span> di{" "}
                        <span className="font-medium">{totalElements}</span> post
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => goToPage(filters.page - 1)}
                            disabled={filters.page === 0}
                            className="gap-1"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Precedente</span>
                        </Button>
                        <span className="text-sm px-2 whitespace-nowrap">
                            Pagina <span className="font-medium">{filters.page + 1}</span> di{" "}
                            <span className="font-medium">{totalPages}</span>
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => goToPage(filters.page + 1)}
                            disabled={filters.page >= totalPages - 1}
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
                            value={String(filters.size)}
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

            {/* Dialog Eliminazione */}
            <Dialog
                open={deleteDialog.open}
                onOpenChange={(open) =>
                    !actionLoading && setDeleteDialog({ open, type: "single" })
                }
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {deleteDialog.type.includes("program") ? "Programma eliminazione" : "Elimina post"}
                        </DialogTitle>
                        <DialogDescription>
                            {deleteDialog.type.includes("bulk")
                                ? `Stai per ${deleteDialog.type.includes("program") ? "programmare l'eliminazione di" : "eliminare definitivamente"} ${selectedPosts.size} post.`
                                : `Stai per ${deleteDialog.type.includes("program") ? "programmare l'eliminazione del" : "eliminare definitivamente"} post selezionato.`}
                            {deleteDialog.type.includes("program") && (
                                <span className="block mt-2 text-yellow-600 flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    Il post verrà spostato nel cestino e eliminato dopo 7 giorni.
                                </span>
                            )}
                            {!deleteDialog.type.includes("program") && (
                                <span className="block mt-2 text-destructive flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    Questa azione è irreversibile.
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialog({ open: false, type: "single" })}
                            disabled={actionLoading}
                        >
                            Annulla
                        </Button>
                        <Button
                            variant={deleteDialog.type.includes("program") ? "default" : "destructive"}
                            onClick={confirmDelete}
                            disabled={actionLoading}
                            className="gap-2"
                        >
                            {actionLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : deleteDialog.type.includes("program") ? (
                                <Clock className="h-4 w-4" />
                            ) : (
                                <Trash2 className="h-4 w-4" />
                            )}
                            {deleteDialog.type.includes("program") ? "Programma" : "Elimina"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}