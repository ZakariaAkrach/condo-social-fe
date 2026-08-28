// src/pages/private/resident/ResidentPostsPage.tsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Loader2,
  Search,
  Eye,
  FileText,
  RefreshCw,
  Filter,
  AlertCircle,
  Megaphone,
  Calendar,
  User,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useCondominium } from "@/components/residentDashboard/CondominiumContext";
import type { FetchPostsResponseDto } from "@/app/api/postAdmin";
import { postResidentApi } from "@/app/api/postResident";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  ACTIVE: { label: "Attivo", variant: "default" },
  DRAFT: { label: "Bozza", variant: "secondary" },
  DELETED: { label: "Eliminato", variant: "outline" },
};

export default function ResidentPostsPage() {
  const navigate = useNavigate();
  const { condominiumId } = useCondominium();

  const [posts, setPosts] = useState<FetchPostsResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTitle, setSearchTitle] = useState("");
  const [filters, setFilters] = useState({
    page: 0,
    size: 10,
    sortBy: "createdAt",
    ascending: false,
  });

  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchPosts = useCallback(async () => {
    if (!condominiumId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await postResidentApi.fetchPosts(condominiumId, {
        title: searchTitle,
        page: filters.page,
        size: filters.size,
        sortBy: filters.sortBy,
        ascending: filters.ascending,
      });
      setPosts(response.data || []);
      setTotalElements(response.totalElements || 0);
      setTotalPages(response.totalPages || 0);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Errore nel caricamento degli annunci";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [condominiumId, searchTitle, filters]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
    toast.info("Annunci aggiornati");
  };

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, page: 0 }));
    fetchPosts();
  };

  const goToDetail = (postId: string) => {
    navigate(`/resident/post/${postId}`);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMM yyyy • HH:mm", { locale: it });
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const config = STATUS_MAP[status] || STATUS_MAP.DRAFT;
    return (
      <Badge variant={config.variant} className="text-[10px] px-2 py-0">
        {config.label}
      </Badge>
    );
  };

  if (loading && posts.length === 0) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-primary" />
            Annunci
          </h1>
          <p className="text-sm text-muted-foreground">
            Leggi le comunicazioni dell'amministratore
          </p>
        </div>
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

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca negli annunci..."
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-9"
          />
        </div>
        <Button onClick={handleSearch} size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Cerca
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Errore</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Posts List */}
      {posts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Megaphone className="h-12 w-12 text-muted-foreground mb-3 opacity-30" />
            <p className="font-medium text-muted-foreground">Nessun annuncio disponibile</p>
            <p className="text-sm text-muted-foreground">
              Non ci sono comunicazioni da mostrare al momento.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {posts.map((post) => (
              <Card
                key={post.id}
                className="cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
                onClick={() => goToDetail(post.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base md:text-lg line-clamp-2">
                      {post.title}
                    </CardTitle>
                    <StatusBadge status={post.status} />
                  </div>
                  <CardDescription className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {post.createdByFirstName} {post.createdByLastName}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(post.createdAt)}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {post.body.replace(/<[^>]*>/g, '')}
                  </p>
                </CardContent>
                <CardFooter className="flex flex-wrap items-center justify-between gap-2 pt-0">
                  <div className="flex gap-2">
                    {post.documents > 0 && (
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <FileText className="h-3 w-3" />
                        {post.documents}
                      </Badge>
                    )}
                    {post.poll && (
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <BarChart3 className="h-3 w-3" />
                        Sondaggio
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1 text-primary">
                    Leggi
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
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
        </>
      )}
    </div>
  );
}