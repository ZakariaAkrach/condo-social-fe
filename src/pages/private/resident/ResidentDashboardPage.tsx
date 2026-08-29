// src/pages/private/resident/ResidentDashboardPage.tsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Loader2,
  Search,
  RefreshCw,
  AlertCircle,
  Megaphone,
  X,
  Paperclip,
  Vote,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useCondominium } from "@/components/residentDashboard/CondominiumContext";
import type { FetchPostsResponseDto } from "@/app/api/postAdmin";
import { postResidentApi } from "@/app/api/postResident";

export default function ResidentDashboardPage() {
  const navigate = useNavigate();
  const { condominiumId, condominiumName } = useCondominium();

  const [posts, setPosts] = useState<FetchPostsResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());

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
    toast.success("Annunci aggiornati");
  };

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, page: 0 }));
    fetchPosts();
  };

  const goToDetail = (postId: string) => {
    navigate(`/resident/post/${postId}`);
  };

  const toggleExpand = (postId: string) => {
    setExpandedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const formatRelativeDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: it });
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "?";
  };

  const getPlainText = (html: string) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  const isLongPost = (html: string) => {
    return getPlainText(html).length > 200;
  };

  if (!condominiumId) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Seleziona un condominio per visualizzare gli annunci.
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Ciao! 👋</h1>
        <p className="text-sm text-muted-foreground">
          Ecco le ultime comunicazioni da {condominiumName}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSearch(!showSearch)}
          className="gap-2 flex-1 sm:flex-none"
        >
          {showSearch ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          {showSearch ? "Chiudi" : "Cerca"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-2 flex-1 sm:flex-none"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Aggiorna
        </Button>
      </div>

      {/* Search */}
      {showSearch && (
        <Card>
          <CardContent className="p-3">
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
                <Search className="h-4 w-4" />
                Cerca
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Errore</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading */}
      {loading && posts.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3 mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-3">
              <Megaphone className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-medium text-muted-foreground">Nessun annuncio disponibile</p>
            <p className="text-sm text-muted-foreground mt-1">
              Non ci sono comunicazioni da mostrare al momento
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {posts.map((post) => {
              const hasAttachments = post.documents > 0;
              const hasPoll = post.poll;
              const isExpanded = expandedPosts.has(post.id);
              const isLong = isLongPost(post.body);
              const plainText = getPlainText(post.body);

              return (
                <Card
                  key={post.id}
                  className="overflow-hidden hover:shadow-md transition-all cursor-pointer"
                  onClick={() => goToDetail(post.id)}
                >
                  {/* Post header */}
                  <CardContent className="p-4 pb-0">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                          {getInitials(post.createdByFirstName, post.createdByLastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {post.createdByFirstName} {post.createdByLastName}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatRelativeDate(post.createdAt)}
                        </p>
                      </div>
                    </div>
                  </CardContent>

                  {/* Post body */}
                  <CardContent className="p-4 pt-3">
                    <h2 className="font-bold text-lg mb-2 leading-snug">
                      {post.title}
                    </h2>
                    
                    {isLong && !isExpanded ? (
                      <>
                        {/* Testo compresso */}
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {plainText.slice(0, 150)}...
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary mt-1 p-0 h-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(post.id);
                          }}
                        >
                          <span className="flex items-center gap-1 text-xs font-medium">
                            Espandi
                            <ChevronDown className="h-3.5 w-3.5" />
                          </span>
                        </Button>
                      </>
                    ) : isLong && isExpanded ? (
                      <>
                        {/* Testo completo */}
                        <div
                          className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: post.body }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary mt-1 p-0 h-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(post.id);
                          }}
                        >
                          <span className="flex items-center gap-1 text-xs font-medium">
                            Comprimi
                            <ChevronUp className="h-3.5 w-3.5" />
                          </span>
                        </Button>
                      </>
                    ) : (
                      /* Testo corto - mostrato completo */
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: post.body }}
                      />
                    )}
                  </CardContent>

                  {/* Post footer */}
                  <Separator />
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex gap-2">
                      {hasAttachments && (
                        <Badge variant="outline" className="text-[10px] gap-1">
                          <Paperclip className="h-3 w-3" />
                          {post.documents} allegati
                        </Badge>
                      )}
                      {hasPoll && (
                        <Badge variant="outline" className="text-[10px] gap-1 bg-primary/5">
                          <Vote className="h-3 w-3" />
                          Sondaggio
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToDetail(post.id);
                      }}
                    >
                      Vai al dettaglio
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={filters.page === 0}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: Math.max(0, prev.page - 1),
                  }))
                }
              >
                Precedente
              </Button>
              <span className="text-sm">
                Pagina {filters.page + 1} di {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={filters.page >= totalPages - 1}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: Math.min(totalPages - 1, prev.page + 1),
                  }))
                }
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