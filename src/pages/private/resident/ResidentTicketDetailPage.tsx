// pages/private/resident/ResidentTicketDetailPage.tsx
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Send, Paperclip, Calendar, MessageSquare, File, Download, Loader2, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useCondominium } from "@/components/residentDashboard/CondominiumContext";
import { downloadFileFromStorage } from "@/auth/downloadFileFromStorage";
import { cn } from "@/lib/utils";
import { ticketResidentApi, type TicketAttachmentItem, type TicketDetail, type TicketMessage, type TicketStatus } from "@/app/api/ticketResident";
import { TicketUploadDialog } from "@/components/residentDashboard/TicketUploadDialog";

const STATUS_CONFIG: Record<TicketStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  OPEN: { label: "Aperto", variant: "default" },
  IN_PROGRESS: { label: "In corso", variant: "secondary" },
  WAITING_USER: { label: "In attesa", variant: "outline" },
  WAITING_ADMIN: { label: "In attesa admin", variant: "outline" },
  CLOSED: { label: "Chiuso", variant: "destructive" },
};

export default function ResidentTicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { condominiumId } = useCondominium();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [attachments, setAttachments] = useState<TicketAttachmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Scroll in basso quando arrivano nuovi messaggi
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Fetch ticket detail
  const fetchTicketDetail = async () => {
    if (!condominiumId || !ticketId) return;
    try {
      const res = await ticketResidentApi.ticketDetail(condominiumId, ticketId);
      setTicket(res.data);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Errore nel caricamento del ticket";
      toast.error(msg);
    }
  };

  // Fetch messages con paginazione (caricamento dall'alto verso il basso)
  const fetchMessages = useCallback(async (reset = true) => {
    if (!condominiumId || !ticketId) return;
    if (reset) {
      setPage(0);
      setMessages([]);
      setHasMore(true);
    }
    if (!hasMore) return;
    setLoadingMessages(true);
    try {
      const res = await ticketResidentApi.fetchMessages(condominiumId, ticketId, {
        page: reset ? 0 : page,
        size: 20,
        sortBy: "createdAt",
        ascending: true, // per avere i più vecchi prima
      });
      const newMessages = res.data || [];
      if (reset) {
        setMessages(newMessages);
      } else {
        setMessages(prev => [...prev, ...newMessages]);
      }
      setHasMore(newMessages.length === 20);
      setPage(prev => prev + 1);
      if (reset && newMessages.length > 0) {
        // Scroll in basso solo al primo caricamento
        setTimeout(scrollToBottom, 100);
      }
    } catch (error: any) {
      toast.error("Errore nel caricamento dei messaggi");
    } finally {
      setLoadingMessages(false);
    }
  }, [condominiumId, ticketId, page, hasMore, scrollToBottom]);

  // Fetch attachments
  const fetchAttachments = async () => {
    if (!condominiumId || !ticketId) return;
    setLoadingAttachments(true);
    try {
      const res = await ticketResidentApi.fetchAttachments(condominiumId, ticketId, {
        page: 0,
        size: 50,
        sortBy: "createdAt",
        ascending: false,
      });
      setAttachments(res.data || []);
    } catch (error: any) {
      toast.error("Errore nel caricamento degli allegati");
    } finally {
      setLoadingAttachments(false);
    }
  };

  // Load all data
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchTicketDetail(), fetchMessages(true), fetchAttachments()]);
      setLoading(false);
      setIsFirstLoad(false);
    };
    loadAll();
  }, [condominiumId, ticketId]);

  // Scroll in basso quando i messaggi cambiano
  useEffect(() => {
    if (!isFirstLoad) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom, isFirstLoad]);

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !ticket || sending) return;
    setSending(true);
    try {
      await ticketResidentApi.createMessage(condominiumId!, ticket.id, { message: newMessage });
      setNewMessage("");
      // Ricarica i messaggi da capo per avere tutto aggiornato
      await fetchMessages(true);
      toast.success("Messaggio inviato");
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Errore nell'invio del messaggio";
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  // Download attachment (placeholder)
  const handleDownload = async (attachmentId: string, fileName: string, downloadUrl: string) => {
    try {
      const blob = await downloadFileFromStorage(downloadUrl);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Download completato");
    } catch (error: any) {
      const msg = error?.message || "Errore nel download";
      toast.error(msg);
    }
  };

  // Delete attachment
  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!confirm("Eliminare questo allegato?")) return;
    try {
      await ticketResidentApi.deleteAttachment(condominiumId!, ticketId!, attachmentId);
      toast.success("Allegato eliminato");
      await fetchAttachments();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Errore nell'eliminazione";
      toast.error(msg);
    }
  };

  // Carica altri messaggi (scroll verso l'alto)
  const handleLoadMore = useCallback(() => {
    if (!loadingMessages && hasMore) {
      fetchMessages(false);
    }
  }, [loadingMessages, hasMore, fetchMessages]);

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-12 w-32" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">Ticket non trovato.</p>
        <Button variant="link" onClick={() => navigate(-1)}>Torna indietro</Button>
      </div>
    );
  }

  const isClosed = ticket.status === "CLOSED";
  const canInteract = !isClosed;

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-4rem)] md:max-h-[calc(100vh-6rem)]">
      {/* Header fisso */}
      <div className="flex-shrink-0 p-4 md:p-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-xl font-bold truncate">{ticket.title}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant={STATUS_CONFIG[ticket.status as TicketStatus]?.variant || "default"}>
                {STATUS_CONFIG[ticket.status as TicketStatus]?.label || ticket.status}
              </Badge>
              <Badge variant="outline">{ticket.priority}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Corpo scrollabile */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 max-w-3xl mx-auto w-full">
        {/* Info ticket (compatta) */}
        <Card className="flex-shrink-0">
          <CardContent className="p-3 md:p-4 space-y-1 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Aperto il: {format(new Date(ticket.createdAt), "dd MMM yyyy HH:mm", { locale: it })}</span>
            </div>
            {ticket.closedAt && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Chiuso il: {format(new Date(ticket.closedAt), "dd MMM yyyy HH:mm", { locale: it })}</span>
              </div>
            )}
            {ticket.description && (
              <div className="mt-2 text-sm border-t pt-2">
                <p className="whitespace-pre-wrap">{ticket.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Allegati compatti */}
        {loadingAttachments ? (
          <Skeleton className="h-12 w-full" />
        ) : attachments.length > 0 && (
          <Card className="flex-shrink-0">
            <CardContent className="p-3 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Allegati ({attachments.length})</p>
              {attachments.map((att) => (
                <div key={att.id} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <File className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm truncate">{att.originalName}</span>
                    <span className="text-xs text-muted-foreground">({(att.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7"
                      onClick={() => toast.info("Download da implementare")}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {canInteract && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 text-destructive"
                        onClick={() => handleDeleteAttachment(att.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Chat - Messaggi */}
        <Card className="flex-1 overflow-hidden flex flex-col min-h-[300px]">
          <CardContent className="p-0 flex-1 flex flex-col">
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[400px] md:max-h-[500px]"
            >
              {loadingMessages && messages.length === 0 && (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}

              {messages.length === 0 && !loadingMessages ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mb-2 opacity-20" />
                  <p className="text-sm">Nessun messaggio</p>
                  <p className="text-xs">Inizia la conversazione</p>
                </div>
              ) : (
                <>
                  {hasMore && messages.length > 0 && (
                    <div className="flex justify-center py-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLoadMore}
                        disabled={loadingMessages}
                        className="text-xs"
                      >
                        {loadingMessages ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Carica messaggi precedenti"
                        )}
                      </Button>
                    </div>
                  )}
                  {messages.map((msg, index) => {
                    const isOwn = msg.firstName === "Me"; // Placeholder: sostituisci con logica reale
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex flex-col max-w-[85%] md:max-w-[75%]",
                          isOwn ? "ml-auto items-end" : "mr-auto items-start"
                        )}
                      >
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-2.5 text-sm break-words",
                            isOwn
                              ? "bg-primary text-primary-foreground rounded-br-none"
                              : "bg-muted rounded-bl-none"
                          )}
                        >
                          <p className="whitespace-pre-wrap">{msg.message}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{msg.firstName} {msg.lastName}</span>
                          <span>•</span>
                          <span>{format(new Date(msg.createdAt), "HH:mm")}</span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input area fissa in basso */}
            {canInteract && (
              <div className="flex-shrink-0 p-3 border-t bg-background">
                <div className="flex gap-2 items-end max-w-3xl mx-auto">
                  <Textarea
                    placeholder="Scrivi un messaggio..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[44px] max-h-[120px] flex-1 resize-none text-sm rounded-xl"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <div className="flex gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-11 w-11 rounded-xl"
                      onClick={() => setUploadDialogOpen(true)}
                      disabled={isClosed}
                    >
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <Button
                      size="icon"
                      className="h-11 w-11 rounded-xl"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                    >
                      {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog per upload */}
      <TicketUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        condominiumId={condominiumId!}
        ticketId={ticket.id}
        onUploadComplete={() => {
          fetchAttachments();
          fetchMessages(true);
        }}
        trigger={null}
      />
    </div>
  );
}