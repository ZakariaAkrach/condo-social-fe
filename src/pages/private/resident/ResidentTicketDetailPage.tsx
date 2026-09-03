// pages/private/resident/ResidentTicketDetailPage.tsx

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Send,
  Paperclip,
  Calendar,
  MessageSquare,
  File,
  Download,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
  Image,
  FileText,
} from "lucide-react";
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
import {
  ticketResidentApi,
  type TicketAttachmentItem,
  type TicketDetail,
  type TicketMessage,
  type TicketStatus,
} from "@/app/api/ticketResident";
import { TicketUploadDialog } from "@/components/residentDashboard/TicketUploadDialog";
import { useAuth } from "@/auth/AuthProvider";

const STATUS_CONFIG: Record<
  TicketStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  OPEN: { label: "Aperto", variant: "default" },
  IN_PROGRESS: { label: "In corso", variant: "secondary" },
  WAITING_USER: { label: "In attesa", variant: "outline" },
  WAITING_ADMIN: { label: "In attesa admin", variant: "outline" },
  CLOSED: { label: "Chiuso", variant: "destructive" },
};

const PRIORITY_COLORS = {
  LOW: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  HIGH: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function ResidentTicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { condominiumId } = useCondominium();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [attachments, setAttachments] = useState<TicketAttachmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [showAttachments, setShowAttachments] = useState(true);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [tempMessages, setTempMessages] = useState<TicketMessage[]>([]);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Detect keyboard on mobile
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        const isKeyboard = window.innerHeight < window.screen.height * 0.7;
        setIsKeyboardVisible(isKeyboard);
        if (isKeyboard) {
          setTimeout(scrollToBottom, 200);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // --- Fetch ticket detail ---
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

  // --- Fetch messages ---
  const fetchMessages = useCallback(
    async () => {
      if (!condominiumId || !ticketId) return;
      setLoadingMessages(true);
      try {
        const res = await ticketResidentApi.fetchMessages(condominiumId, ticketId, {
          page: 0,
          size: 1000, // Carica tutti i messaggi
          sortBy: "createdAt",
          ascending: true,
        });
        const newMessages = res.data || [];
        // Combina con i messaggi temporanei
        const allMessages = [...newMessages, ...tempMessages];
        setMessages(allMessages);
      } catch (error: any) {
        toast.error("Errore nel caricamento dei messaggi");
      } finally {
        setLoadingMessages(false);
      }
    },
    [condominiumId, ticketId, tempMessages]
  );

  // --- Fetch attachments ---
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

  // --- Load all data ---
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchTicketDetail(), fetchMessages(), fetchAttachments()]);
      setLoading(false);
    };
    loadAll();
  }, [condominiumId, ticketId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (!loading) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, loading, scrollToBottom]);

  // --- Send message (Optimistic) ---
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !ticket || sending) return;
    
    const messageText = newMessage;
    setSending(true);
    
    // Create a temporary message
    const tempId = `temp-${Date.now()}`;
    const tempMessage: TicketMessage = {
      id: tempId,
      firstName: profile?.firstName || "Me",
      lastName: profile?.lastName || "",
      message: messageText,
      createdAt: new Date().toISOString(),
    };
    
    // Add to temp messages
    setTempMessages((prev) => [...prev, tempMessage]);
    
    // Add to visible messages
    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");
    
    // Scroll to bottom to show the new message
    setTimeout(scrollToBottom, 100);
    
    try {
      await ticketResidentApi.createMessage(condominiumId!, ticket.id, { 
        message: messageText 
      });
      
      // Remove temp message and reload
      setTempMessages((prev) => prev.filter(msg => msg.id !== tempId));
      
      // Reload messages
      await fetchMessages();
      
      toast.success("Messaggio inviato");
      
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error: any) {
      // Remove the temporary message on error
      setTempMessages((prev) => prev.filter(msg => msg.id !== tempId));
      setMessages((prev) => prev.filter(msg => msg.id !== tempId));
      
      const msg = error?.response?.data?.message || "Errore nell'invio del messaggio";
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  // --- Download attachment ---
  const handleDownload = async (attachmentId: string, fileName: string) => {
    try {
      const response = await ticketResidentApi.download(
        condominiumId!,
        ticketId!,
        attachmentId
      );

      const downloadUrl = response.data.downloadURL;
      if (!downloadUrl) {
        toast.error("URL di download non disponibile");
        return;
      }

      const blob = await downloadFileFromStorage(downloadUrl);
      const blobUrl = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = blobUrl;
      link.download = response.data.fileName || fileName;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
      toast.success("Download completato");
    } catch (error: any) {
      console.error("Errore durante il download", error);
      toast.error(error?.message || "Errore durante il download");
    }
  };

  // --- Delete attachment ---
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

  // Get file icon based on extension
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"];
    if (imageExts.includes(ext)) {
      return <Image className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Helper function to determine if message is from current user
  const isOwnMessage = (msg: TicketMessage) => {
    if (!profile) return false;
    
    // Compare by name
    return msg.firstName === profile.firstName && 
           msg.lastName === profile.lastName;
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <div className="p-4 border-b">
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex-1 p-4 space-y-4 overflow-hidden">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-12 w-3/4 rounded-xl" />
            <Skeleton className="h-12 w-1/2 rounded-xl ml-auto" />
            <Skeleton className="h-12 w-2/3 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <div className="text-center">
          <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
          <p className="text-muted-foreground">Ticket non trovato.</p>
          <Button variant="link" onClick={() => navigate(-1)} className="mt-2">
            Torna indietro
          </Button>
        </div>
      </div>
    );
  }

  const isClosed = ticket.status === "CLOSED";
  const canInteract = !isClosed;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header - ottimizzato per mobile */}
      <div className="flex-shrink-0 p-3 md:p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-20">
        <div className="flex items-center gap-2 md:gap-3 max-w-3xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="h-9 w-9 md:h-10 md:w-10 rounded-full shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base md:text-lg font-bold truncate leading-tight">
              {ticket.title}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <Badge
                variant={STATUS_CONFIG[ticket.status as TicketStatus]?.variant || "default"}
                className="text-[10px] md:text-xs px-2 py-0 h-5"
              >
                {STATUS_CONFIG[ticket.status as TicketStatus]?.label || ticket.status}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] md:text-xs px-2 py-0 h-5 border-0",
                  PRIORITY_COLORS[ticket.priority as keyof typeof PRIORITY_COLORS] ||
                    "bg-gray-100 text-gray-700"
                )}
              >
                {ticket.priority}
              </Badge>
              {ticket.category && (
                <Badge variant="outline" className="text-[10px] md:text-xs px-2 py-0 h-5">
                  {ticket.category}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Corpo scrollabile */}
      <div
        className={cn(
          "flex-1 overflow-y-auto p-3 md:p-4 space-y-3 max-w-3xl mx-auto w-full",
          isKeyboardVisible && "pb-2"
        )}
      >
        {/* Info ticket - compatta */}
        <Card className="flex-shrink-0 shadow-sm">
          <CardContent className="p-3 md:p-4 space-y-1.5 text-xs md:text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
              <span className="truncate">
                Aperto: {format(new Date(ticket.createdAt), "dd MMM yyyy HH:mm", { locale: it })}
              </span>
            </div>
            {ticket.closedAt && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
                <span className="truncate">
                  Chiuso: {format(new Date(ticket.closedAt), "dd MMM yyyy HH:mm", { locale: it })}
                </span>
              </div>
            )}
            {ticket.description && (
              <div className="mt-1.5 text-sm border-t pt-2">
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {ticket.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Allegati - collassabili */}
        {loadingAttachments ? (
          <Skeleton className="h-12 w-full" />
        ) : (
          attachments.length > 0 && (
            <Card className="flex-shrink-0 shadow-sm">
              <CardContent className="p-2 md:p-3">
                <button
                  onClick={() => setShowAttachments(!showAttachments)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <span className="text-xs font-medium text-muted-foreground">
                    📎 Allegati ({attachments.length})
                  </span>
                  {showAttachments ? (
                    <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </button>
                {showAttachments && (
                  <div className="mt-2 space-y-1">
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between py-1.5 px-1 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="text-muted-foreground shrink-0">
                            {getFileIcon(att.originalName)}
                          </span>
                          <span className="text-xs md:text-sm truncate">
                            {att.originalName}
                          </span>
                          <span className="text-[10px] md:text-xs text-muted-foreground shrink-0">
                            {formatFileSize(att.size)}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0 ml-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 md:h-8 md:w-8 rounded-full"
                            onClick={() => handleDownload(att.id, att.originalName)}
                          >
                            <Download className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          </Button>
                          {canInteract && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 md:h-8 md:w-8 rounded-full text-destructive hover:text-destructive"
                              onClick={() => handleDeleteAttachment(att.id)}
                            >
                              <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        )}

        {/* Chat - Messaggi con scroll nel riquadro */}
        <Card className="flex-1 overflow-hidden flex flex-col shadow-sm min-h-[250px] md:min-h-[300px]">
          <CardContent className="p-0 flex-1 flex flex-col">
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-3 md:p-4"
            >
              {loadingMessages && messages.length === 0 && (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}

              {messages.length === 0 && !loadingMessages ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mb-2 opacity-20" />
                  <p className="text-sm font-medium">Nessun messaggio</p>
                  <p className="text-xs">Inizia la conversazione</p>
                </div>
              ) : (
                <div className="space-y-2.5 md:space-y-3">
                  {messages.map((msg) => {
                    // Check if it's a temporary message
                    const isTemp = msg.id.startsWith('temp-');
                    // Use the helper function to determine if the message is from the current user
                    const isOwn = isOwnMessage(msg);
                    
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex flex-col max-w-[90%] md:max-w-[80%] transition-all duration-300",
                          isOwn ? "ml-auto items-end" : "mr-auto items-start",
                          isTemp && "opacity-90 animate-pulse"
                        )}
                      >
                        <div
                          className={cn(
                            "rounded-2xl px-3.5 md:px-4 py-2 md:py-2.5 text-sm md:text-base break-words relative",
                            isOwn
                              ? "bg-primary text-primary-foreground rounded-br-none"
                              : "bg-muted rounded-bl-none",
                            isTemp && "border-2 border-primary/30 shadow-lg"
                          )}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">
                            {msg.message}
                          </p>
                          {isTemp && (
                            <div className="flex items-center gap-1.5 mt-1 text-[10px] opacity-80">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span>Invio in corso...</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-[10px] md:text-xs text-muted-foreground">
                          <span className="font-medium">
                            {msg.firstName} {msg.lastName}
                          </span>
                          <span>•</span>
                          <span>
                            {isTemp 
                              ? "Invio in corso..." 
                              : format(new Date(msg.createdAt), "HH:mm")
                            }
                          </span>
                          {isOwn && !isTemp && (
                            <>
                              <span>•</span>
                              <Badge variant="outline" className="text-[10px] h-4 px-1">
                                Tu
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input area - ottimizzata per mobile */}
            {canInteract ? (
              <div className="flex-shrink-0 p-2 md:p-3 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex gap-1.5 md:gap-2 items-end max-w-3xl mx-auto">
                  <div className="flex-1 relative">
                    <Textarea
                      ref={inputRef}
                      placeholder="Scrivi un messaggio..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="min-h-[40px] max-h-[100px] flex-1 resize-none text-sm md:text-base rounded-xl px-3 py-2.5"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-10 w-10 md:h-11 md:w-11 rounded-xl shrink-0"
                      onClick={() => setUploadDialogOpen(true)}
                      disabled={isClosed}
                    >
                      <Paperclip className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                    <Button
                      size="icon"
                      className="h-10 w-10 md:h-11 md:w-11 rounded-xl shrink-0"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 md:h-5 md:w-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-shrink-0 p-3 border-t bg-muted/30 text-center">
                <p className="text-xs md:text-sm text-muted-foreground">
                  Questo ticket è chiuso. Non è possibile inviare nuovi messaggi.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upload dialog */}
      <TicketUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        condominiumId={condominiumId!}
        ticketId={ticket.id}
        onUploadComplete={() => {
          fetchAttachments();
          fetchMessages();
        }}
        trigger={null}
      />
    </div>
  );
}