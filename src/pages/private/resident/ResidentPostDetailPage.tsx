// src/pages/private/resident/ResidentPostDetailPage.tsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Loader2,
  ArrowLeft,
  FileText,
  BarChart3,
  User,
  Download,
  CheckCircle,
  AlertCircle,
  RefreshCw,
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

import { downloadFileFromStorage } from "@/auth/downloadFileFromStorage";
import { useCondominium } from "@/components/residentDashboard/CondominiumContext";
import type { FetchDetailPostResponseDto, FetchPostDocumentsResponseDto } from "@/app/api/postAdmin";
import { postResidentApi, type PollQuestionResidentResponseDto } from "@/app/api/postResident";
import { documentResidentApi } from "@/app/api/documentResident";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  ACTIVE: { label: "Attivo", variant: "default" },
  DRAFT: { label: "Bozza", variant: "secondary" },
  DELETED: { label: "Eliminato", variant: "outline" },
};

export default function ResidentPostDetailPage() {
  const navigate = useNavigate();
  const { condominiumId } = useCondominium();
  const { postId } = useParams<{ postId: string }>();

  const [post, setPost] = useState<FetchDetailPostResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [documents, setDocuments] = useState<FetchPostDocumentsResponseDto[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);

  const [poll, setPoll] = useState<PollQuestionResidentResponseDto | null>(null);
  const [pollLoading, setPollLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [voting, setVoting] = useState(false);
  const [voteDialogOpen, setVoteDialogOpen] = useState(false);

  const [downloading, setDownloading] = useState(false);

  const fetchPostDetail = useCallback(async () => {
    if (!condominiumId || !postId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await postResidentApi.fetchPostDetail(condominiumId, postId);
      setPost(response.data);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Errore nel caricamento dell'annuncio";
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
      const response = await postResidentApi.fetchPostDocuments(condominiumId, postId, {
        page: 0,
        size: 100,
        sortBy: "createdAt",
        ascending: false,
      });
      setDocuments(response.data || []);
    } catch (err: any) {
      toast.error("Errore nel caricamento dei documenti");
    } finally {
      setDocumentsLoading(false);
    }
  }, [condominiumId, postId]);

  const fetchPoll = useCallback(async () => {
    if (!condominiumId || !postId) return;

    setPollLoading(true);
    try {
      const response = await postResidentApi.fetchPostPoll(condominiumId, postId);
      setPoll(response.data);
      if (response.data?.userOptionId) {
        setSelectedOption(response.data.userOptionId);
      }
    } catch (err: any) {
      toast.error("Errore nel caricamento del sondaggio");
    } finally {
      setPollLoading(false);
    }
  }, [condominiumId, postId]);

  useEffect(() => {
    fetchPostDetail();
  }, [fetchPostDetail]);

  useEffect(() => {
    if (post) {
      fetchDocuments();
      if (post.poll) {
        fetchPoll();
      }
    }
  }, [post, fetchDocuments, fetchPoll]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPostDetail();
    await fetchDocuments();
    if (post?.poll) {
      await fetchPoll();
    }
    setRefreshing(false);
    toast.info("Dettaglio aggiornato");
  };

  const goBack = () => {
    navigate("/resident/posts");
  };

  const handleDownload = async (documentId: string) => {
    if (!condominiumId) return;

    setDownloading(true);
    try {
      const response = await documentResidentApi.download(condominiumId, documentId);
      const downloadUrl = response.data.downloadURL;

      if (!downloadUrl) {
        toast.error("URL di download non disponibile");
        return;
      }

      const blob = await downloadFileFromStorage(downloadUrl);
      const blobUrl = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = blobUrl;
      link.download = response.data.fileName;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);

      toast.success("Download completato");
    } catch (error: any) {
      toast.error(error?.message || "Errore durante il download");
    } finally {
      setDownloading(false);
    }
  };

  const handleVote = async () => {
    if (!condominiumId || !postId || !selectedOption) {
      toast.error("Seleziona un'opzione");
      return;
    }

    setVoting(true);
    try {
      await postResidentApi.pollVote(condominiumId, postId, { optionId: selectedOption });
      toast.success("Voto registrato con successo!");
      setVoteDialogOpen(false);
      await fetchPoll();
      await fetchPostDetail();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Errore durante il voto");
    } finally {
      setVoting(false);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const config = STATUS_MAP[status] || STATUS_MAP.DRAFT;
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMM yyyy HH:mm", { locale: it });
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="p-6 text-center max-w-md mx-auto">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Impossibile caricare l'annuncio</h3>
        <p className="text-muted-foreground mb-4">{error || "Annuncio non trovato"}</p>
        <Button variant="outline" onClick={goBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Torna indietro
        </Button>
      </div>
    );
  }

  const totalVotes = poll?.optionTexts?.reduce((sum, opt) => sum + (opt.numberVotes || 0), 0) || 0;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={goBack} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <StatusBadge status={post.status} />
              <span className="text-xs text-muted-foreground">
                {formatDate(post.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Author */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
        <User className="h-4 w-4" />
        <span>
          Pubblicato da <strong>{post.createdByFirstName} {post.createdByLastName}</strong>
        </span>
        <span>•</span>
        <span>{post.createdByEmail}</span>
      </div>

      <Separator />

      {/* Body */}
      <Card>
        <CardContent className="pt-6">
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{post.documents}</p>
              <p className="text-xs text-muted-foreground">Documenti</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{post.poll ? "Sì" : "No"}</p>
              <p className="text-xs text-muted-foreground">Sondaggio</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documenti
            {post.documents > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {post.documents}
              </Badge>
            )}
          </TabsTrigger>
          {post.poll && (
            <TabsTrigger value="poll" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Sondaggio
            </TabsTrigger>
          )}
        </TabsList>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4 pt-4">
          {documentsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Nessun documento allegato</p>
              <p className="text-sm">Questo annuncio non ha documenti.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.documentId}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{doc.originalName}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{doc.contentType}</span>
                        <span>•</span>
                        <span>v{doc.currentVersion}</span>
                        {doc.publicForCondominium && (
                          <>
                            <span>•</span>
                            <Badge variant="outline" className="text-[10px]">
                              Pubblico
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(doc.documentId)}
                    disabled={downloading}
                    className="gap-2 self-start sm:self-center"
                  >
                    <Download className="h-4 w-4" />
                    Scarica
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Poll Tab */}
        {post.poll && (
          <TabsContent value="poll" className="space-y-4 pt-4">
            {pollLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !poll ? (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Nessun sondaggio disponibile</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold">{poll.question}</h3>
                  <p className="text-sm text-muted-foreground">
                    {poll.userVoted ? "Hai già votato" : "Esprimi il tuo voto"}
                  </p>
                </div>

                <div className="space-y-3">
                  {poll.optionTexts.map((option) => {
                    const percentage = totalVotes > 0
                      ? Math.round((option.numberVotes / totalVotes) * 100)
                      : 0;
                    const isSelected = poll.userVoted && option.optionId === poll.userOptionId;

                    return (
                      <div
                        key={option.optionId}
                        className={`p-3 border rounded-lg transition-colors ${
                          isSelected ? "border-primary bg-primary/5" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {poll.userVoted && isSelected && (
                              <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                            )}
                            <span className="font-medium truncate">{option.optionText}</span>
                          </div>
                          <span className="text-sm font-medium whitespace-nowrap">
                            {option.numberVotes} voti ({percentage}%)
                          </span>
                        </div>
                        <div className="mt-2">
                          <Progress value={percentage} className="h-2" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Totale voti: {totalVotes}</span>
                  {poll.userVoted && (
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Voto registrato
                    </Badge>
                  )}
                </div>

                {!poll.userVoted && (
                  <Button
                    className="w-full"
                    onClick={() => setVoteDialogOpen(true)}
                  >
                    Partecipa al sondaggio
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* Vote Dialog */}
      <Dialog open={voteDialogOpen} onOpenChange={setVoteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Partecipa al sondaggio</DialogTitle>
            <DialogDescription>
              Scegli un'opzione e conferma il tuo voto.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <RadioGroup
              value={selectedOption}
              onValueChange={setSelectedOption}
              className="space-y-2"
            >
              {poll?.optionTexts.map((option) => (
                <div
                  key={option.optionId}
                  className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-muted/30 transition-colors"
                >
                  <RadioGroupItem value={option.optionId} id={option.optionId} />
                  <Label htmlFor={option.optionId} className="flex-1 cursor-pointer">
                    {option.optionText}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setVoteDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleVote} disabled={!selectedOption || voting}>
              {voting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Voto in corso...
                </>
              ) : (
                "Vota"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}