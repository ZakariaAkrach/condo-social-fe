// src/pages/private/AdminPostDetailPage.tsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Loader2,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle,
  RefreshCw,
  MoreHorizontal,
  Trash2,
  Clock,
  FileText,
  Users,
  BarChart3,
  MessageSquare,
  Calendar,
  User,
  X,
  ChevronLeft,
  ChevronRight,
  Inbox,
  AlertCircle,
  Search,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  postAdminApi,
  type FetchDetailPostResponseDto,
  type FetchPostDocumentsResponseDto,
  type PollOptionVotesResponseDto,
  type PollVotesAdminResponseDto,
} from "@/app/api/postAdmin";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
  ACTIVE: { label: "Attivo", variant: "default", icon: CheckCircle },
  DRAFT: { label: "Bozza", variant: "secondary", icon: EyeOff },
  DELETED: { label: "Eliminato", variant: "destructive", icon: Trash2 },
  POLL_CLOSED: { label: "Sondaggio chiuso", variant: "outline", icon: Lock },
};

export default function AdminPostDetailPage() {
  const navigate = useNavigate();
  const { condominiumId, postId } = useParams<{
    condominiumId: string;
    postId: string;
  }>();

  const [post, setPost] = useState<FetchDetailPostResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [documents, setDocuments] = useState<FetchPostDocumentsResponseDto[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsTotal, setDocumentsTotal] = useState(0);
  const [documentsPage, setDocumentsPage] = useState(0);

  const [pollVotes, setPollVotes] = useState<PollVotesAdminResponseDto[]>([]);
  const [pollVotesLoading, setPollVotesLoading] = useState(false);
  const [pollVotesTotal, setPollVotesTotal] = useState(0);
  const [pollVotesPage, setPollVotesPage] = useState(0);

  const [optionVotes, setOptionVotes] = useState<PollOptionVotesResponseDto[]>([]);
  const [optionVotesLoading, setOptionVotesLoading] = useState(false);

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: "delete" | "program";
  }>({ open: false, type: "program" });
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [tempStatus, setTempStatus] = useState<"ACTIVE" | "DRAFT" | "POLL_CLOSED">("DRAFT");
  const [actionLoading, setActionLoading] = useState(false);

  const [voteFilters, setVoteFilters] = useState({
    firstName: "",
    lastName: "",
    email: "",
    page: 0,
    size: 10,
    sortBy: "createdAt",
    ascending: false,
  });

  const fetchPostDetail = useCallback(async () => {
    if (!condominiumId || !postId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await postAdminApi.fetchPostDetail(condominiumId, postId);
      setPost(response.data);
      if (response.data.status !== "DELETED") {
        setTempStatus(response.data.status as "ACTIVE" | "DRAFT" | "POLL_CLOSED");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Errore nel caricamento del post";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [condominiumId, postId]);

  const fetchDocuments = useCallback(async () => {
    if (!condominiumId || !postId) return;

    setDocumentsLoading(true);
    try {
      const response = await postAdminApi.fetchPostDocuments(condominiumId, postId, {
        page: documentsPage,
        size: 10,
        sortBy: "createdAt",
        ascending: false,
      });
      setDocuments(response.data || []);
      setDocumentsTotal(response.totalElements || 0);
    } catch (err: any) {
      toast.error("Errore nel caricamento dei documenti");
    } finally {
      setDocumentsLoading(false);
    }
  }, [condominiumId, postId, documentsPage]);

  const fetchPollVotes = useCallback(async () => {
    if (!condominiumId || !postId) return;

    setPollVotesLoading(true);
    try {
      const response = await postAdminApi.fetchPollVotes(condominiumId, postId, {
        ...voteFilters,
        page: pollVotesPage,
        size: 10,
      });
      setPollVotes(response.data || []);
      setPollVotesTotal(response.totalElements || 0);
    } catch (err: any) {
      toast.error("Errore nel caricamento dei voti");
    } finally {
      setPollVotesLoading(false);
    }
  }, [condominiumId, postId, voteFilters, pollVotesPage]);

  const fetchOptionVotes = useCallback(async () => {
    if (!condominiumId || !postId) return;

    setOptionVotesLoading(true);
    try {
      const response = await postAdminApi.fetchPollOptionVotes(condominiumId, postId);
      setOptionVotes(response.data || []);
    } catch (err: any) {
      toast.error("Errore nel caricamento del conteggio voti");
    } finally {
      setOptionVotesLoading(false);
    }
  }, [condominiumId, postId]);

  useEffect(() => {
    fetchPostDetail();
  }, [fetchPostDetail]);

  useEffect(() => {
    if (post) {
      fetchDocuments();
      if (post.poll) {
        fetchPollVotes();
        fetchOptionVotes();
      }
    }
  }, [post, fetchDocuments, fetchPollVotes, fetchOptionVotes]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPostDetail();
    await fetchDocuments();
    if (post?.poll) {
      await fetchPollVotes();
      await fetchOptionVotes();
    }
    setRefreshing(false);
    toast.success("Dettaglio aggiornato");
  };

  const goBack = () => {
    navigate(`/admin/condomini/${condominiumId}/posts`);
  };

  const handleStatusChange = async (newStatus: "ACTIVE" | "DRAFT" | "POLL_CLOSED") => {
    if (!condominiumId || !postId || !post) return;

    setActionLoading(true);
    try {
      await postAdminApi.changeStatus(condominiumId, postId, { status: newStatus });
      toast.success(`Stato cambiato in ${STATUS_MAP[newStatus]?.label || newStatus}`);
      await fetchPostDetail();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Errore durante il cambio stato");
    } finally {
      setActionLoading(false);
      setStatusDialogOpen(false);
    }
  };

  const handleDelete = async (type: "delete" | "program") => {
    if (!condominiumId || !postId) return;

    setActionLoading(true);
    try {
      if (type === "delete") {
        await postAdminApi.deletePost(condominiumId, postId);
        toast.success("Post eliminato definitivamente");
        navigate(`/admin/condomini/${condominiumId}/posts`);
      } else {
        await postAdminApi.programDeletion(condominiumId, postId);
        toast.success("Post programmato per l'eliminazione");
        await fetchPostDetail();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Errore durante l'operazione");
    } finally {
      setActionLoading(false);
      setDeleteDialog({ open: false, type: "program" });
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground font-medium mb-4">{error || "Post non trovato"}</p>
        <Button variant="outline" onClick={goBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Torna indietro
        </Button>
      </div>
    );
  }

  const isDeleted = post.status === "DELETED";
  const totalVotes = optionVotes.reduce((sum, o) => sum + o.countVotes, 0);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col gap-4">

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2 mt-1">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">{post.title}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <button
                  className="focus:outline-none"
                  onClick={() => setStatusDialogOpen(true)}
                  disabled={isDeleted}
                >
                  <StatusBadge status={post.status} />
                </button>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(new Date(post.createdAt), "dd MMM yyyy HH:mm", { locale: it })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
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

            {!isDeleted && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <MoreHorizontal className="h-4 w-4" />
                    Azioni
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    onClick={() =>
                      handleStatusChange(post.status === "ACTIVE" ? "DRAFT" : "ACTIVE")
                    }
                  >
                    {post.status === "ACTIVE" ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Imposta Bozza
                      </>
                    ) : post.status === "POLL_CLOSED" ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Riapri post
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Imposta Attivo
                      </>
                    )}
                  </DropdownMenuItem>
                  {post.poll && post.status === "ACTIVE" && (
                    <DropdownMenuItem
                      onClick={() => handleStatusChange("POLL_CLOSED")}
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Chiudi sondaggio
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="text-yellow-600"
                    onClick={() => setDeleteDialog({ open: true, type: "program" })}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Programma eliminazione
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setDeleteDialog({ open: true, type: "delete" })}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Elimina definitivamente
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {isDeleted && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange("DRAFT")}
                disabled={actionLoading}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Ripristina
              </Button>
            )}
          </div>
        </div>
      </div>

      {isDeleted && (
        <Alert className="border-orange-500 bg-orange-50 text-orange-800 dark:bg-orange-950/30 dark:border-orange-700 dark:text-orange-300">
          <Clock className="h-4 w-4" />
          <AlertTitle>Post nel cestino</AlertTitle>
          <AlertDescription>
            Questo post verrà eliminato definitivamente dopo 7 giorni.
          </AlertDescription>
        </Alert>
      )}

      {/* Contenuto */}
      <Card>
        <CardContent className="pt-6">
          <div 
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />
        </CardContent>
      </Card>

      {/* Statistiche */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-2">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Documenti</p>
                <p className="text-xl font-bold">{post.documents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-2">
                <BarChart3 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sondaggio</p>
                <p className="text-xl font-bold">
                  {post.status === "POLL_CLOSED" ? "Chiuso" : post.poll ? "Attivo" : "Nessuno"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-2">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Creato da</p>
                <p className="text-sm font-medium truncate">
                  {post.createdByFirstName} {post.createdByLastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {post.createdByEmail}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-2">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Aggiornato</p>
                <p className="text-sm font-medium">
                  {format(new Date(post.updatedAt), "dd MMM yyyy", { locale: it })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(post.updatedAt), "HH:mm", { locale: it })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <Tabs defaultValue="documents" className="w-full">
            <TabsList className="w-full sm:w-auto flex-wrap h-auto gap-1">
              <TabsTrigger value="documents" className="flex items-center gap-2 flex-1 sm:flex-none justify-center">
                <FileText className="h-4 w-4" />
                Documenti
                <Badge variant="secondary" className="ml-1 text-xs">
                  {post.documents}
                </Badge>
              </TabsTrigger>
              {post.poll && (
                <>
                  <TabsTrigger value="poll" className="flex items-center gap-2 flex-1 sm:flex-none justify-center">
                    <BarChart3 className="h-4 w-4" />
                    Sondaggio
                  </TabsTrigger>
                  <TabsTrigger value="votes" className="flex items-center gap-2 flex-1 sm:flex-none justify-center">
                    <Users className="h-4 w-4" />
                    Voti
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {pollVotesTotal}
                    </Badge>
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            <TabsContent value="documents" className="space-y-4 pt-4">
              {documentsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Nessun documento associato</p>
                  <p className="text-sm">Questo post non ha documenti allegati.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead className="hidden md:table-cell">Tipo</TableHead>
                          <TableHead className="hidden lg:table-cell">Versione</TableHead>
                          <TableHead className="hidden lg:table-cell">Stato</TableHead>
                          <TableHead className="text-right">Azioni</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {documents.map((doc) => (
                          <TableRow key={doc.documentId} className="hover:bg-muted/50">
                            <TableCell>
                              <p className="font-medium truncate max-w-[200px]">
                                {doc.originalName}
                              </p>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge variant="outline">{doc.contentType}</Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              v{doc.currentVersion}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <StatusBadge status={doc.status} />
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  navigate(
                                    `/admin/condomini/${condominiumId}/documenti/${doc.documentId}`
                                  );
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {documentsTotal > 10 && (
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDocumentsPage(Math.max(0, documentsPage - 1))}
                        disabled={documentsPage === 0}
                        className="gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Precedente</span>
                      </Button>
                      <span className="text-sm px-2">
                        Pagina {documentsPage + 1}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDocumentsPage(documentsPage + 1)}
                        className="gap-1"
                      >
                        <span className="hidden sm:inline">Successiva</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {post.poll && (
              <TabsContent value="poll" className="space-y-4 pt-4">
                {optionVotesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : optionVotes.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Nessun voto registrato</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Risultati del sondaggio</h3>
                    <div className="space-y-4">
                      {optionVotes.map((option) => {
                        const percentage = totalVotes > 0 ? (option.countVotes / totalVotes) * 100 : 0;

                        return (
                          <div key={option.optionId} className="space-y-2">
                            <div className="flex justify-between items-center text-sm flex-wrap gap-1">
                              <span className="font-medium">{option.optionText}</span>
                              <Badge variant="secondary">
                                {option.countVotes} voti ({Math.round(percentage)}%)
                              </Badge>
                            </div>
                            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-sm text-muted-foreground mt-4 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Totale voti: <span className="font-semibold">{totalVotes}</span>
                    </div>
                  </div>
                )}
              </TabsContent>
            )}

            {post.poll && (
              <TabsContent value="votes" className="space-y-4 pt-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Input
                      placeholder="Cerca per nome..."
                      value={voteFilters.firstName}
                      onChange={(e) =>
                        setVoteFilters((prev) => ({ ...prev, firstName: e.target.value, page: 0 }))
                      }
                      className="pl-3"
                    />
                  </div>
                  <div className="relative flex-1">
                    <Input
                      placeholder="Cerca per email..."
                      value={voteFilters.email}
                      onChange={(e) =>
                        setVoteFilters((prev) => ({ ...prev, email: e.target.value, page: 0 }))
                      }
                      className="pl-3"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setVoteFilters((prev) => ({ ...prev, page: 0 }));
                      fetchPollVotes();
                    }}
                    className="gap-2"
                  >
                    <Search className="h-4 w-4" />
                    Filtra
                  </Button>
                </div>

                {pollVotesLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : pollVotes.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Nessun voto trovato</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Opzione</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead className="hidden md:table-cell">Email</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pollVotes.map((vote, index) => (
                            <TableRow key={index} className="hover:bg-muted/50">
                              <TableCell>
                                <Badge variant="outline">{vote.optionText}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-xs">
                                      {vote.firstName?.[0]?.toUpperCase()}
                                      {vote.lastName?.[0]?.toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{vote.firstName} {vote.lastName}</span>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {vote.email}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {pollVotesTotal > 10 && (
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPollVotesPage(Math.max(0, pollVotesPage - 1))}
                          disabled={pollVotesPage === 0}
                          className="gap-1"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span className="hidden sm:inline">Precedente</span>
                        </Button>
                        <span className="text-sm px-2">
                          Pagina {pollVotesPage + 1}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPollVotesPage(pollVotesPage + 1)}
                          className="gap-1"
                        >
                          <span className="hidden sm:inline">Successiva</span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog Cambio stato */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cambia stato del post</DialogTitle>
            <DialogDescription>
              Scegli il nuovo stato per il post.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <RadioGroup
              value={tempStatus}
              onValueChange={(val) => setTempStatus(val as "ACTIVE" | "DRAFT" | "POLL_CLOSED")}
              className="space-y-3"
            >
              <div className="flex items-start space-x-3 p-3 rounded-lg border">
                <RadioGroupItem value="DRAFT" id="status-draft" />
                <div>
                  <Label htmlFor="status-draft" className="font-medium flex items-center gap-2">
                    <EyeOff className="h-4 w-4" />
                    Bozza
                  </Label>
                  <p className="text-sm text-muted-foreground mt-0.5">Visibile solo agli amministratori.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-lg border">
                <RadioGroupItem value="ACTIVE" id="status-active" />
                <div>
                  <Label htmlFor="status-active" className="font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Attivo
                  </Label>
                  <p className="text-sm text-muted-foreground mt-0.5">Visibile a tutti i residenti.</p>
                </div>
              </div>
              {post?.poll && (
                <div className="flex items-start space-x-3 p-3 rounded-lg border">
                  <RadioGroupItem value="POLL_CLOSED" id="status-poll-closed" />
                  <div>
                    <Label htmlFor="status-poll-closed" className="font-medium flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Sondaggio chiuso
                    </Label>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Chiude il sondaggio ma mantiene il post visibile.
                    </p>
                  </div>
                </div>
              )}
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)} disabled={actionLoading}>
              Annulla
            </Button>
            <Button
              onClick={() => handleStatusChange(tempStatus)}
              disabled={actionLoading || tempStatus === post.status}
              className="gap-2"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Aggiorna
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Eliminazione */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => !actionLoading && setDeleteDialog({ open, type: "program" })}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {deleteDialog.type === "program" ? "Programma eliminazione" : "Elimina post"}
            </DialogTitle>
            <DialogDescription>
              {deleteDialog.type === "program" ? (
                <>
                  Il post verrà spostato nel cestino e eliminato definitivamente dopo 7 giorni.
                  <span className="block mt-2 text-yellow-600 flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Puoi ripristinarlo in qualsiasi momento prima della scadenza.
                  </span>
                </>
              ) : (
                <>
                  Questa azione è irreversibile e eliminerà definitivamente il post.
                  <span className="block mt-2 text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Tutti i dati associati verranno persi.
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, type: "program" })}
              disabled={actionLoading}
            >
              Annulla
            </Button>
            <Button
              variant={deleteDialog.type === "program" ? "default" : "destructive"}
              onClick={() => handleDelete(deleteDialog.type)}
              disabled={actionLoading}
              className="gap-2"
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : deleteDialog.type === "program" ? (
                <Clock className="h-4 w-4" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {deleteDialog.type === "program" ? "Programma" : "Elimina"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}