// src/pages/private/resident/ResidentPostDetailPage.tsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Loader2,
  ArrowLeft,
  FileText,
  BarChart3,
  Download,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Paperclip,
  Vote,
  Calendar,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

import { downloadFileFromStorage } from "@/auth/downloadFileFromStorage";
import { useCondominium } from "@/components/residentDashboard/CondominiumContext";
import type { FetchDetailPostResponseDto, FetchPostDocumentsResponseDto } from "@/app/api/postAdmin";
import { postResidentApi, type PollQuestionResidentResponseDto } from "@/app/api/postResident";
import { documentResidentApi } from "@/app/api/documentResident";

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
  const [isModifyingVote, setIsModifyingVote] = useState(false);

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

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
    } catch {
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
    } catch {
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
    toast.success("Dettaglio aggiornato");
  };

  const goBack = () => {
    navigate(-1);
  };

  const handleDownload = async (documentId: string) => {
    if (!condominiumId) return;

    setDownloadingId(documentId);
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
      setDownloadingId(null);
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
      toast.success(isModifyingVote ? "Voto modificato con successo!" : "Voto registrato con successo!");
      setVoteDialogOpen(false);
      setIsModifyingVote(false);
      await fetchPoll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Errore durante il voto");
    } finally {
      setVoting(false);
    }
  };

  const openModifyVote = () => {
    setIsModifyingVote(true);
    setVoteDialogOpen(true);
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "?";
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4 max-w-3xl mx-auto">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="p-6 text-center max-w-md mx-auto">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Impossibile caricare l'annuncio</h3>
        <p className="text-muted-foreground mb-4">{error || "Annuncio non trovato"}</p>
        <Button variant="outline" onClick={goBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Torna indietro
        </Button>
      </div>
    );
  }

  const totalVotes = poll?.optionTexts?.reduce((sum, opt) => sum + (opt.numberVotes || 0), 0) || 0;
  const fullName = `${post.createdByFirstName} ${post.createdByLastName}`.trim();

  return (
    <div className="max-w-3xl mx-auto">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-base font-semibold truncate flex-1 text-left">
            Dettaglio annuncio
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-9 w-9 shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-5">
        {/* Author header */}
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(post.createdByFirstName, post.createdByLastName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{fullName}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: it })}
            </p>
          </div>
          <Badge variant="secondary" className="text-[10px]">
            Admin
          </Badge>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-bold leading-snug">
          {post.title}
        </h1>

        {/* Body */}
        <Card>
          <CardContent className="p-5">
            <div
              className="prose prose-sm dark:prose-invert max-w-none text-foreground/80 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.body }}
            />
          </CardContent>
        </Card>

        {/* Indicators */}
        {(post.documents > 0 || post.poll) && (
          <div className="flex gap-2 flex-wrap">
            {post.documents > 0 && (
              <Badge variant="outline" className="gap-1 text-xs py-1">
                <Paperclip className="h-3.5 w-3.5" />
                {post.documents} allegati
              </Badge>
            )}
            {post.poll && (
              <Badge variant="outline" className="gap-1 text-xs py-1 bg-primary/5 border-primary/20">
                <Vote className="h-3.5 w-3.5" />
                Sondaggio
              </Badge>
            )}
          </div>
        )}

        {/* Documents section with scroll */}
        {post.documents > 0 && (
          <section className="space-y-3">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Paperclip className="h-5 w-5 text-primary" />
              Documenti allegati
              <Badge variant="secondary" className="text-xs">
                {documents.length}
              </Badge>
            </h2>
            
            {documentsLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : documents.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Nessun documento disponibile</p>
                </CardContent>
              </Card>
            ) : documents.length > 3 ? (
              <ScrollArea className="h-[280px] rounded-lg border">
                <div className="p-2 space-y-2">
                  {documents.map((doc) => (
                    <Card key={doc.documentId} className="hover:bg-muted/30 transition-colors">
                      <CardContent className="p-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">{doc.originalName}</p>
                            <p className="text-xs text-muted-foreground">
                              v{doc.currentVersion} • {doc.contentType}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(doc.documentId)}
                          disabled={downloadingId === doc.documentId}
                          className="gap-1 shrink-0 h-8"
                        >
                          {downloadingId === doc.documentId ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Download className="h-3.5 w-3.5" />
                          )}
                          <span className="hidden sm:inline text-xs">Scarica</span>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <Card key={doc.documentId} className="hover:bg-muted/30 transition-colors">
                    <CardContent className="p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{doc.originalName}</p>
                          <p className="text-xs text-muted-foreground">
                            v{doc.currentVersion} • {doc.contentType}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(doc.documentId)}
                        disabled={downloadingId === doc.documentId}
                        className="gap-2 shrink-0"
                      >
                        {downloadingId === doc.documentId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        <span className="hidden sm:inline">Scarica</span>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Poll section with modify vote */}
        {post.poll && (
          <section className="space-y-3">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Vote className="h-5 w-5 text-primary" />
              Sondaggio
            </h2>

            {pollLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : !poll ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Nessun sondaggio disponibile</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-5 space-y-4">
                  <div>
                    <h3 className="font-semibold text-base">{poll.question}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {poll.userVoted ? "Hai già votato. Puoi modificare il tuo voto." : "Esprimi il tuo voto"}
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
                          className={`p-3 rounded-lg border transition-colors ${
                            isSelected ? "border-primary bg-primary/5" : ""
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 min-w-0">
                              {isSelected && (
                                <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                              )}
                              <span className="text-sm font-medium truncate">{option.optionText}</span>
                            </div>
                            <span className="text-xs font-semibold whitespace-nowrap">
                              {percentage}%
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {option.numberVotes} voti
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-muted-foreground">
                      Totale: {totalVotes} voti
                    </span>
                    {poll.userVoted ? (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          Voto registrato
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={openModifyVote}
                          className="gap-1"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Modifica
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => {
                          setIsModifyingVote(false);
                          setVoteDialogOpen(true);
                        }}
                        className="gap-2"
                      >
                        <Vote className="h-4 w-4" />
                        Vota
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </section>
        )}
      </div>

      {/* Vote Dialog */}
      <Dialog open={voteDialogOpen} onOpenChange={setVoteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isModifyingVote ? "Modifica il tuo voto" : "Partecipa al sondaggio"}
            </DialogTitle>
            <DialogDescription>
              {isModifyingVote 
                ? "Scegli una nuova opzione per modificare il tuo voto."
                : "Scegli un'opzione e conferma il tuo voto."}
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
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedOption === option.optionId
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/30"
                  }`}
                >
                  <RadioGroupItem value={option.optionId} id={option.optionId} />
                  <Label htmlFor={option.optionId} className="flex-1 cursor-pointer text-sm">
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
            <Button onClick={handleVote} disabled={!selectedOption || voting} className="gap-2">
              {voting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isModifyingVote ? "Modifica..." : "Voto..."}
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  {isModifyingVote ? "Conferma modifica" : "Conferma voto"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}