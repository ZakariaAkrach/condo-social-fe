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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  postAdminApi,
  type FetchDetailPostResponseDto,
  type FetchPostDocumentsResponseDto,
  type PollOptionVotesResponseDto,
  type PollVotesAdminResponseDto,
} from "@/app/api/postAdmin";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  ACTIVE: { label: "Attivo", variant: "default" },
  DRAFT: { label: "Bozza", variant: "secondary" },
  DELETED: { label: "Eliminato", variant: "destructive" },
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
  const [tempStatus, setTempStatus] = useState<"ACTIVE" | "DRAFT">("DRAFT");
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
        setTempStatus(response.data.status as "ACTIVE" | "DRAFT");
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
    toast.info("Dettaglio aggiornato");
  };

  const goBack = () => {
    navigate(`/admin/condomini/${condominiumId}`);
  };

  const handleStatusChange = async (newStatus: "ACTIVE" | "DRAFT") => {
    if (!condominiumId || !postId || !post) return;

    setActionLoading(true);
    try {
      await postAdminApi.changeStatus(condominiumId, postId, { status: newStatus });
      toast.success(`Stato cambiato in ${newStatus === "ACTIVE" ? "Attivo" : "Bozza"}`);
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

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Caricamento dettaglio post...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="p-6 text-center max-w-md mx-auto">
        <div className="mb-4 text-destructive">
          <MessageSquare className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Impossibile caricare il post</h3>
        <p className="text-muted-foreground mb-4">{error || "Post non trovato"}</p>
        <Button variant="outline" onClick={goBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Torna indietro
        </Button>
      </div>
    );
  }

  const isDeleted = post.status === "DELETED";

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={goBack} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold truncate max-w-[300px]">{post.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <button
                className="focus:outline-none"
                onClick={() => setStatusDialogOpen(true)}
                disabled={isDeleted}
              >
                <StatusBadge status={post.status} />
              </button>
              <span className="text-xs text-muted-foreground">
                Creato il {format(new Date(post.createdAt), "dd MMM yyyy HH:mm", { locale: it })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>

          {!isDeleted && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Imposta Attivo
                    </>
                  )}
                </DropdownMenuItem>
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
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Ripristina
            </Button>
          )}
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

      <Separator />

      <Card>
        <CardContent className="pt-6">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap">{post.body}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Documenti</span>
            </div>
            <p className="text-2xl font-bold mt-1">{post.documents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Sondaggio</span>
            </div>
            <p className="text-2xl font-bold mt-1">{post.poll ? "Sì" : "No"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Creato da</span>
            </div>
            <p className="text-sm font-medium mt-1 truncate">
              {post.createdByFirstName} {post.createdByLastName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {post.createdByEmail}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Aggiornato</span>
            </div>
            <p className="text-sm font-medium mt-1">
              {format(new Date(post.updatedAt), "dd MMM yyyy", { locale: it })}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(post.updatedAt), "HH:mm", { locale: it })}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="documents" className="w-full">
        <TabsList>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documenti
            <Badge variant="secondary" className="ml-1 text-xs">
              {post.documents}
            </Badge>
          </TabsTrigger>
          {post.poll && (
            <>
              <TabsTrigger value="poll" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Sondaggio
              </TabsTrigger>
              <TabsTrigger value="votes" className="flex items-center gap-2">
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
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Nessun documento associato</p>
              <p className="text-sm">Questo post non ha documenti allegati.</p>
            </div>
          ) : (
            <>
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
                    <TableRow key={doc.documentId}>
                      <TableCell>
                        <div>
                          <p className="font-medium truncate max-w-[200px]">
                            {doc.originalName}
                          </p>
                        </div>
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
                          size="sm"
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

              {documentsTotal > 10 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setDocumentsPage(Math.max(0, documentsPage - 1))
                        }
                        className={documentsPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink isActive>
                        {documentsPage + 1}
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setDocumentsPage(documentsPage + 1)
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
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
                <div className="space-y-3">
                  {optionVotes.map((option) => {
                    const total = optionVotes.reduce((sum, o) => sum + o.countVotes, 0);
                    const percentage = total > 0 ? (option.countVotes / total) * 100 : 0;

                    return (
                      <div key={option.optionId} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{option.optionText}</span>
                          <span className="font-medium">
                            {option.countVotes} voti ({Math.round(percentage)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-sm text-muted-foreground mt-4">
                  Totale voti: {optionVotes.reduce((sum, o) => sum + o.countVotes, 0)}
                </div>
              </div>
            )}
          </TabsContent>
        )}

        {post.poll && (
          <TabsContent value="votes" className="space-y-4 pt-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Cerca per nome..."
                value={voteFilters.firstName}
                onChange={(e) =>
                  setVoteFilters((prev) => ({ ...prev, firstName: e.target.value, page: 0 }))
                }
                className="flex-1"
              />
              <Input
                placeholder="Cerca per email..."
                value={voteFilters.email}
                onChange={(e) =>
                  setVoteFilters((prev) => ({ ...prev, email: e.target.value, page: 0 }))
                }
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setVoteFilters((prev) => ({ ...prev, page: 0 }));
                  fetchPollVotes();
                }}
              >
                Filtra
              </Button>
            </div>

            {pollVotesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : pollVotes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Nessun voto trovato</p>
              </div>
            ) : (
              <>
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
                      <TableRow key={index}>
                        <TableCell>
                          <Badge variant="outline">{vote.optionText}</Badge>
                        </TableCell>
                        <TableCell>
                          {vote.firstName} {vote.lastName}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {vote.email}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {pollVotesTotal > 10 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            setPollVotesPage(Math.max(0, pollVotesPage - 1))
                          }
                          className={pollVotesPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink isActive>
                          {pollVotesPage + 1}
                        </PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setPollVotesPage(pollVotesPage + 1)}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambia stato del post</DialogTitle>
            <DialogDescription>
              Scegli il nuovo stato per il post.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <RadioGroup
              value={tempStatus}
              onValueChange={(val) => setTempStatus(val as "ACTIVE" | "DRAFT")}
              className="space-y-2"
            >
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="DRAFT" id="status-draft" />
                <div>
                  <Label htmlFor="status-draft" className="font-medium">Bozza</Label>
                  <p className="text-sm text-muted-foreground">Visibile solo agli amministratori.</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="ACTIVE" id="status-active" />
                <div>
                  <Label htmlFor="status-active" className="font-medium">Attivo</Label>
                  <p className="text-sm text-muted-foreground">Visibile a tutti i residenti.</p>
                </div>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)} disabled={actionLoading}>
              Annulla
            </Button>
            <Button
              onClick={() => handleStatusChange(tempStatus)}
              disabled={actionLoading || tempStatus === post.status}
            >
              {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Aggiorna"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => !actionLoading && setDeleteDialog({ open, type: "program" })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {deleteDialog.type === "program" ? "Programma eliminazione" : "Elimina post"}
            </DialogTitle>
            <DialogDescription>
              {deleteDialog.type === "program" ? (
                <>
                  Il post verrà spostato nel cestino e eliminato definitivamente dopo 7 giorni.
                  <span className="block mt-2 text-yellow-600">
                    ⚠️ Puoi ripristinarlo in qualsiasi momento prima della scadenza.
                  </span>
                </>
              ) : (
                <>
                  Questa azione è irreversibile e eliminerà definitivamente il post.
                  <span className="block mt-2 text-destructive">
                    ⚠️ Tutti i dati associati verranno persi.
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
            >
              {actionLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : deleteDialog.type === "program" ? (
                "Programma eliminazione"
              ) : (
                "Elimina definitivamente"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}