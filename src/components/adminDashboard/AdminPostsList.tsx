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
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { postAdminApi, type FetchPostsResponseDto } from "@/app/api/postAdmin";

interface AdminPostsListProps {
    condominiumId: string;
}

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    ACTIVE: { label: "Attivo", variant: "default" },
    DRAFT: { label: "Bozza", variant: "secondary" },
    DELETED: { label: "Eliminato", variant: "destructive" },
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
        setSelectAll(newSet.size === posts.length);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchPosts();
        setRefreshing(false);
        toast.info("Lista aggiornata");
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
        const icons = {
            ACTIVE: <CheckCircle className="h-3 w-3 mr-1" />,
            DRAFT: <EyeOff className="h-3 w-3 mr-1" />,
            DELETED: <Trash2 className="h-3 w-3 mr-1" />,
        };

        return (
            <Badge variant={config.variant} className="flex items-center gap-0.5">
                {icons[status as keyof typeof icons] || icons.DRAFT}
                {config.label}
            </Badge>
        );
    };

    if (loading && posts.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center h-64 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Caricamento post...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Megaphone className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Post</h3>
                    <Badge variant="secondary" className="ml-1">
                        {totalElements}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                        Aggiorna
                    </Button>
                    <Button size="sm" onClick={goToCreate}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nuovo Post
                    </Button>
                </div>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Errore</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cerca per titolo..."
                            value={filters.title}
                            onChange={(e) => setFilters((prev) => ({ ...prev, title: e.target.value }))}
                            className="pl-9"
                        />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Select
                        value={filters.status}
                        onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
                    >
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Stato" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">Tutti</SelectItem>
                            <SelectItem value="ACTIVE">Attivo</SelectItem>
                            <SelectItem value="DRAFT">Bozza</SelectItem>
                            <SelectItem value="DELETED">Eliminato</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilters((prev) => ({ ...prev, page: 0 }))}
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        Filtra
                    </Button>
                </div>
            </div>

            {selectedPosts.size > 0 && (
                <div className="flex flex-wrap items-center justify-between bg-muted/50 p-3 rounded-lg gap-2">
                    <span className="text-sm font-medium">
                        {selectedPosts.size} post selezionati
                    </span>
                    <div className="flex gap-2 flex-wrap">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteBulk(true)}
                            disabled={actionLoading}
                        >
                            <Clock className="h-4 w-4 mr-2" />
                            Programma
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteBulk(false)}
                            disabled={actionLoading}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Elimina
                        </Button>
                    </div>
                </div>
            )}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40px]">
                                <Checkbox
                                    checked={selectAll}
                                    onCheckedChange={toggleSelectAll}
                                />
                            </TableHead>
                            <TableHead>Titolo</TableHead>
                            <TableHead className="hidden md:table-cell">Stato</TableHead>
                            <TableHead className="hidden lg:table-cell">Data</TableHead>
                            <TableHead className="text-right">Azioni</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {posts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                    <p className="font-medium">Nessun post trovato</p>
                                    <p className="text-sm">Crea il tuo primo post</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            posts.map((post) => (
                                <TableRow
                                    key={post.id}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => goToDetail(post.id)}
                                >
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <Checkbox
                                            checked={selectedPosts.has(post.id)}
                                            onCheckedChange={() => toggleSelectPost(post.id)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium truncate max-w-[150px] sm:max-w-[200px]">
                                                {post.title}
                                            </p>
                                            <div className="flex gap-1 mt-1 flex-wrap">
                                                {post.documents > 0 && (
                                                    <Badge variant="outline" className="text-[10px]">
                                                        <FileText className="h-3 w-3 mr-1" />
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
                                        <div className="text-sm">
                                            {format(new Date(post.createdAt), "dd MMM yyyy", { locale: it })}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {format(new Date(post.createdAt), "HH:mm", { locale: it })}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
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
                                                                    Bozza
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                                    Attivo
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

            {totalPages > 0 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        page: Math.max(0, prev.page - 1),
                                    }))
                                }
                                className={filters.page === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pageNum = i;
                            return (
                                <PaginationItem key={pageNum}>
                                    <PaginationLink
                                        onClick={() =>
                                            setFilters((prev) => ({ ...prev, page: pageNum }))
                                        }
                                        isActive={filters.page === pageNum}
                                    >
                                        {pageNum + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            );
                        })}
                        {totalPages > 5 && (
                            <PaginationItem>
                                <PaginationLink>...</PaginationLink>
                            </PaginationItem>
                        )}
                        <PaginationItem>
                            <PaginationNext
                                onClick={() =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        page: Math.min(totalPages - 1, prev.page + 1),
                                    }))
                                }
                                className={
                                    filters.page >= totalPages - 1
                                        ? "pointer-events-none opacity-50"
                                        : "cursor-pointer"
                                }
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}

            <Dialog
                open={deleteDialog.open}
                onOpenChange={(open) =>
                    !actionLoading && setDeleteDialog({ open, type: "single" })
                }
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {deleteDialog.type.includes("program") ? "Programma eliminazione" : "Elimina post"}
                        </DialogTitle>
                        <DialogDescription>
                            {deleteDialog.type.includes("bulk")
                                ? `Stai per ${deleteDialog.type.includes("program") ? "programmare l'eliminazione di" : "eliminare definitivamente"} ${selectedPosts.size} post.`
                                : `Stai per ${deleteDialog.type.includes("program") ? "programmare l'eliminazione del" : "eliminare definitivamente"} post selezionato.`}
                            {deleteDialog.type.includes("program") && (
                                <span className="block mt-2 text-yellow-600">
                                    ⚠️ Il post verrà spostato nel cestino e eliminato dopo 7 giorni.
                                </span>
                            )}
                            {!deleteDialog.type.includes("program") && (
                                <span className="block mt-2 text-destructive">
                                    ⚠️ Questa azione è irreversibile.
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
                        >
                            {actionLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : deleteDialog.type.includes("program") ? (
                                "Programma"
                            ) : (
                                "Elimina"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}