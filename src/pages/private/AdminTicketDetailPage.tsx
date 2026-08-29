import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  ArrowLeft,
  RefreshCw,
  MessageSquare,
  User,
  Clock,
  MoreHorizontal,
  Upload,
  File,
  X,
  AlertCircle,
  CheckCircle,
  Download,
  UserPlus,
  Send,
  Lock,
  Globe,
  Paperclip,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { ticketAdminApi } from "@/app/api/ticketAdmin";
import { condominiumMemberApi } from "@/app/api/condominiumMember";
import type { FetchMembersResponseDto } from "@/app/api/condominiumMember";
import { uploadFileToStorage } from "@/auth/uploadStorage";
import { downloadFileFromStorage } from "@/auth/downloadFileFromStorage";
import { useAuth } from "@/auth/AuthProvider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORY_LABELS: Record<string, string> = {
  MAINTENANCE: "Manutenzione",
  CLEANING: "Pulizia",
  NOISE: "Rumori",
  ADMINISTRATIVE: "Amministrativo",
  SECURITY: "Sicurezza",
  UTILITIES: "Utilità",
  COMMON_AREAS: "Aree comuni",
  OTHER: "Altro",
};

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }
> = {
  OPEN: { label: "Aperto", variant: "default", icon: AlertCircle },
  IN_PROGRESS: { label: "In corso", variant: "secondary", icon: Clock },
  CLOSED: { label: "Chiuso", variant: "destructive", icon: CheckCircle },
};

const PRIORITY_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  LOW: { label: "Bassa", variant: "outline" },
  MEDIUM: { label: "Media", variant: "secondary" },
  HIGH: { label: "Alta", variant: "destructive" },
};

const STATUS_OPTIONS = Object.entries(STATUS_CONFIG).map(([key, { label }]) => ({
  value: key,
  label,
}));

export default function AdminTicketDetailPage() {
  const { condominiumId, ticketId } = useParams<{
    condominiumId: string;
    ticketId: string;
  }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [publicMessages, setPublicMessages] = useState<any[]>([]);
  const [internalMessages, setInternalMessages] = useState<any[]>([]);
  const [loadingPublic, setLoadingPublic] = useState(true);
  const [loadingInternal, setLoadingInternal] = useState(true);
  const [publicPage, setPublicPage] = useState(0);
  const [internalPage, setInternalPage] = useState(0);
  const [publicTotalPages, setPublicTotalPages] = useState(0);
  const [internalTotalPages, setInternalTotalPages] = useState(0);
  const size = 10;

  const [attachments, setAttachments] = useState<any[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(true);
  const [attPage, setAttPage] = useState(0);
  const [attTotalPages, setAttTotalPages] = useState(0);

  const [changeStatusDialog, setChangeStatusDialog] = useState<{
    open: boolean;
    status: string;
  }>({ open: false, status: "" });
  const [assignDialog, setAssignDialog] = useState<{ open: boolean }>({
    open: false,
  });
  const [closeTicketDialog, setCloseTicketDialog] = useState<{ open: boolean }>({
    open: false,
  });

  const [newPublicMessage, setNewPublicMessage] = useState("");
  const [newInternalMessage, setNewInternalMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<
    "idle" | "getting-url" | "uploading" | "confirming"
  >("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stati per membri
  const [members, setMembers] = useState<FetchMembersResponseDto[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string>("");

  // --- Fetch functions ---
  const fetchDetail = useCallback(async () => {
    if (!condominiumId || !ticketId) return;
    setLoading(true);
    try {
      const response = await ticketAdminApi.getTicketDetail(condominiumId, ticketId);
      setTicket(response.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Errore nel caricamento del ticket");
    } finally {
      setLoading(false);
    }
  }, [condominiumId, ticketId]);

  const fetchPublicMessages = useCallback(
    async (page = 0) => {
      if (!condominiumId || !ticketId) return;
      setLoadingPublic(true);
      try {
        const response = await ticketAdminApi.fetchMessages(condominiumId, ticketId, {
          page,
          size,
          sortBy: "createdAt",
          ascending: true,
          visibility: "PUBLIC",
        });
        setPublicMessages(response.data || []);
        setPublicTotalPages(response.totalPages || 0);
        setPublicPage(page);
      } catch (err) {
        toast.error("Errore nel caricamento dei messaggi pubblici");
      } finally {
        setLoadingPublic(false);
      }
    },
    [condominiumId, ticketId]
  );

  const fetchInternalMessages = useCallback(
    async (page = 0) => {
      if (!condominiumId || !ticketId) return;
      setLoadingInternal(true);
      try {
        const response = await ticketAdminApi.fetchMessages(condominiumId, ticketId, {
          page,
          size,
          sortBy: "createdAt",
          ascending: true,
          visibility: "INTERNAL",
        });
        setInternalMessages(response.data || []);
        setInternalTotalPages(response.totalPages || 0);
        setInternalPage(page);
      } catch (err) {
        toast.error("Errore nel caricamento dei messaggi interni");
      } finally {
        setLoadingInternal(false);
      }
    },
    [condominiumId, ticketId]
  );

  const fetchAttachments = useCallback(
    async (page = 0) => {
      if (!condominiumId || !ticketId) return;
      setLoadingAttachments(true);
      try {
        const response = await ticketAdminApi.fetchAttachments(condominiumId, ticketId, {
          page,
          size,
          sortBy: "createdAt",
          ascending: false,
        });
        setAttachments(response.data || []);
        setAttTotalPages(response.totalPages || 0);
        setAttPage(page);
      } catch (err) {
        toast.error("Errore nel caricamento degli allegati");
      } finally {
        setLoadingAttachments(false);
      }
    },
    [condominiumId, ticketId]
  );

  // Fetch members
  const fetchMembers = useCallback(async () => {
    setMembersLoading(true);
    try {
      const response = await condominiumMemberApi.fetchMembers(
        {
          role: "CONDO_SUB_ADMIN",
          page: 0,
          size: 100,
        },
        condominiumId
      );
      setMembers(response.data || []);
    } catch (err: any) {
      console.error("Errore fetch members:", err);
      toast.error("Errore nel caricamento dei membri");
    } finally {
      setMembersLoading(false);
    }
  }, [condominiumId]);

  useEffect(() => {
    if (condominiumId && ticketId) {
      fetchDetail();
      fetchPublicMessages(0);
      fetchInternalMessages(0);
      fetchAttachments(0);
    }
  }, [condominiumId, ticketId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchDetail(),
      fetchPublicMessages(publicPage),
      fetchInternalMessages(internalPage),
      fetchAttachments(attPage),
    ]);
    setRefreshing(false);
    toast.success("Dati aggiornati");
  };

  // --- Action handlers ---
  const handleChangeStatus = async () => {
    if (!ticketId || !changeStatusDialog.status) return;
    setIsSubmitting(true);
    try {
      await ticketAdminApi.changeStatus(condominiumId!, ticketId, {
        status: changeStatusDialog.status,
      });
      toast.success("Stato aggiornato");
      setChangeStatusDialog({ open: false, status: "" });
      fetchDetail();
      fetchPublicMessages(publicPage);
      fetchInternalMessages(internalPage);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Errore");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssign = async () => {
    if (!ticketId || !selectedMember) return;
    setIsSubmitting(true);
    try {
      let emailToAssign = "";
      
      // Se è "me", usa l'email dell'utente corrente
      if (selectedMember === "me") {
        emailToAssign = user?.email || profile?.email || "";
        if (!emailToAssign) {
          toast.error("Email utente non disponibile");
          return;
        }
      } else {
        // Altrimenti cerca tra i membri
        const selectedMemberData = members.find(m => m.memberId === selectedMember);
        if (!selectedMemberData) {
          toast.error("Seleziona un membro valido");
          return;
        }
        emailToAssign = selectedMemberData.email;
      }
      
      await ticketAdminApi.assignTicket(condominiumId!, ticketId, {
        email: emailToAssign,
      });
      toast.success("Ticket assegnato");
      setAssignDialog({ open: false });
      setSelectedMember("");
      fetchDetail();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Errore");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!ticketId) return;
    setIsSubmitting(true);
    try {
      await ticketAdminApi.changeStatus(condominiumId!, ticketId, {
        status: "CLOSED",
      });
      toast.success("Ticket chiuso con successo");
      setCloseTicketDialog({ open: false });
      fetchDetail();
      fetchPublicMessages(publicPage);
      fetchInternalMessages(internalPage);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Errore durante la chiusura");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendPublicMessage = async () => {
    if (!newPublicMessage.trim()) return;
    setIsSubmitting(true);
    try {
      await ticketAdminApi.createMessage(condominiumId!, ticketId!, {
        message: newPublicMessage,
        visibility: "PUBLIC",
      });
      toast.success("Messaggio pubblico inviato");
      setNewPublicMessage("");
      fetchPublicMessages(publicPage);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Errore");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendInternalMessage = async () => {
    if (!newInternalMessage.trim()) return;
    setIsSubmitting(true);
    try {
      await ticketAdminApi.createMessage(condominiumId!, ticketId!, {
        message: newInternalMessage,
        visibility: "INTERNAL",
      });
      toast.success("Messaggio interno inviato");
      setNewInternalMessage("");
      fetchInternalMessages(internalPage);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Errore");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Upload handlers ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadAttachment = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadStep("getting-url");
    try {
      const file = selectedFile;
      const extension = file.name.split(".").pop() || "";
      const payload = {
        originalFileName: file.name,
        size: file.size,
        contentType: file.type || "application/octet-stream",
        extension,
        visibility: "PUBLIC",
      };
      const response = await ticketAdminApi.uploadAttachment(
        condominiumId!,
        ticketId!,
        payload
      );
      const { ticketAttachmentId, uploadUrl } = response.data;

      setUploadStep("uploading");
      await uploadFileToStorage(file, uploadUrl);

      setUploadStep("confirming");
      await ticketAdminApi.confirmUpload(condominiumId!, ticketId!, ticketAttachmentId);

      toast.success("Allegato caricato");
      setUploadDialogOpen(false);
      setSelectedFile(null);
      fetchAttachments(attPage);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Errore durante l'upload");
    } finally {
      setUploading(false);
      setUploadStep("idle");
    }
  };

  const handleDownload = async (attachmentId: string, fileName: string) => {
    try {
      const response = await ticketAdminApi.download(
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
    } catch (err: any) {
      console.error("Errore durante il download", err);
      toast.error(err?.message || "Errore durante il download");
    }
  };

  // --- Utilities ---
  const formatDate = (date: string) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const renderMessageList = (
    messages: any[],
    loading: boolean,
    page: number,
    totalPages: number,
    onPageChange: (p: number) => void,
    isInternal: boolean
  ) => {
    if (loading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      );
    }
    if (messages.length === 0) {
      return (
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">Nessun messaggio</p>
        </div>
      );
    }
    return (
      <>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 p-3 rounded-lg ${
                  isInternal ? "bg-amber-50 dark:bg-amber-950/20" : "bg-muted/50"
                }`}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="text-xs">
                    {msg.firstName?.[0]?.toUpperCase()}
                    {msg.lastName?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">
                      {msg.firstName} {msg.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(msg.createdAt)}
                    </span>
                    {isInternal && (
                      <Badge variant="outline" className="text-xs">
                        <Lock className="h-3 w-3 mr-1" />
                        Interno
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{msg.message}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => onPageChange(page - 1)}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Precedente</span>
            </Button>
            <span className="text-sm px-2">
              Pagina {page + 1} di {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange(page + 1)}
              className="gap-1"
            >
              <span className="hidden sm:inline">Successiva</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </>
    );
  };

  // Filtra i membri per escludere l'utente corrente
  const filteredMembers = members.filter(member => 
    member.email?.toLowerCase() !== user?.email?.toLowerCase() && 
    member.email?.toLowerCase() !== profile?.email?.toLowerCase()
  );

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

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
        <p className="mt-2 text-muted-foreground font-medium">Ticket non trovato</p>
        <Button variant="outline" onClick={() => navigate(-1)} className="mt-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Torna indietro
        </Button>
      </div>
    );
  }

  const isClosed = ticket.status === "CLOSED";
  const StatusIcon = STATUS_CONFIG[ticket.status]?.icon || AlertCircle;
  const PriorityBadge = PRIORITY_CONFIG[ticket.priority];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2 mt-1">
              <StatusIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">{ticket.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                #{ticket.id?.slice(0, 8)} • Creato il {formatDate(ticket.createdAt)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Aggiorna
            </Button>
            {!isClosed && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setCloseTicketDialog({ open: true })}
                className="gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Chiudi ticket
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <MoreHorizontal className="h-4 w-4" />
                  Azioni
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() =>
                    setChangeStatusDialog({ open: true, status: ticket.status })
                  }
                >
                  <Clock className="h-4 w-4 mr-2" /> Cambia stato
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    setAssignDialog({ open: true });
                    setSelectedMember("");
                    await fetchMembers();
                  }}
                >
                  <UserPlus className="h-4 w-4 mr-2" /> Assegna
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Dettagli ticket */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Dettagli ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Stato</Label>
              <div>
                <Badge variant={STATUS_CONFIG[ticket.status]?.variant || "outline"} className="gap-1">
                  <StatusIcon className="h-3 w-3" />
                  {STATUS_CONFIG[ticket.status]?.label || ticket.status}
                </Badge>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Priorità</Label>
              <div>
                <Badge variant={PriorityBadge?.variant || "outline"}>
                  {PriorityBadge?.label || ticket.priority}
                </Badge>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Categoria</Label>
              <div className="text-sm font-medium">
                {CATEGORY_LABELS[ticket.category] || ticket.category || "—"}
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Creato da</Label>
              <div className="flex items-center gap-2 text-sm">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {ticket.createdByEmail?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{ticket.createdByEmail}</span>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Assegnato a</Label>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{ticket.assignedTo || "Non assegnato"}</span>
              </div>
            </div>
            {ticket.closedAt && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Chiuso il</Label>
                <div className="text-sm flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {formatDate(ticket.closedAt)}
                </div>
              </div>
            )}
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 space-y-1">
              <Label className="text-xs text-muted-foreground">Descrizione</Label>
              <div className="p-3 bg-muted/50 rounded-lg text-sm whitespace-pre-wrap">
                {ticket.description || "Nessuna descrizione"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messaggi */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Messaggi</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="public" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="public" className="gap-2">
                <Globe className="h-4 w-4" />
                Pubblici
              </TabsTrigger>
              <TabsTrigger value="internal" className="gap-2">
                <Lock className="h-4 w-4" />
                Interni
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="public" className="space-y-4 mt-0">
              {renderMessageList(
                publicMessages,
                loadingPublic,
                publicPage,
                publicTotalPages,
                fetchPublicMessages,
                false
              )}
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm">Nuovo messaggio pubblico</Label>
                <Textarea
                  placeholder="Scrivi un messaggio visibile a tutti..."
                  value={newPublicMessage}
                  onChange={(e) => setNewPublicMessage(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSendPublicMessage}
                    disabled={isSubmitting || !newPublicMessage.trim()}
                    className="gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Invia
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="internal" className="space-y-4 mt-0">
              {renderMessageList(
                internalMessages,
                loadingInternal,
                internalPage,
                internalTotalPages,
                fetchInternalMessages,
                true
              )}
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Nuovo messaggio interno
                </Label>
                <Textarea
                  placeholder="Scrivi un messaggio visibile solo agli admin..."
                  value={newInternalMessage}
                  onChange={(e) => setNewInternalMessage(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSendInternalMessage}
                    disabled={isSubmitting || !newInternalMessage.trim()}
                    variant="secondary"
                    className="gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Invia
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Allegati */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">Allegati</CardTitle>
          <Button
            size="sm"
            onClick={() => setUploadDialogOpen(true)}
            className="gap-2"
          >
            <Paperclip className="h-4 w-4" />
            Carica
          </Button>
        </CardHeader>
        <CardContent>
          {loadingAttachments ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : attachments.length === 0 ? (
            <div className="text-center py-8">
              <File className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">Nessun allegato</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className="hidden sm:table-cell">Dimensione</TableHead>
                      <TableHead className="hidden md:table-cell">Caricato da</TableHead>
                      <TableHead className="hidden lg:table-cell">Visibilità</TableHead>
                      <TableHead className="text-right">Download</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attachments.map((att) => (
                      <TableRow key={att.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <File className="h-4 w-4 text-primary shrink-0" />
                            <span className="truncate max-w-[150px] sm:max-w-[200px]">
                              {att.originalName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {formatSize(att.size)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {att.firstName?.[0]?.toUpperCase()}
                                {att.lastName?.[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {att.firstName} {att.lastName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge variant="outline">{att.visibility}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDownload(att.id, att.originalName)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {attTotalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={attPage === 0}
                    onClick={() => fetchAttachments(attPage - 1)}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Precedente</span>
                  </Button>
                  <span className="text-sm px-2">
                    Pagina {attPage + 1} di {attTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={attPage >= attTotalPages - 1}
                    onClick={() => fetchAttachments(attPage + 1)}
                    className="gap-1"
                  >
                    <span className="hidden sm:inline">Successiva</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog Cambio stato */}
      <Dialog
        open={changeStatusDialog.open}
        onOpenChange={(open) =>
          !open && setChangeStatusDialog({ open: false, status: "" })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambia stato</DialogTitle>
            <DialogDescription>
              Seleziona il nuovo stato per il ticket.
            </DialogDescription>
          </DialogHeader>
          <Select
            value={changeStatusDialog.status}
            onValueChange={(val) =>
              setChangeStatusDialog((prev) => ({ ...prev, status: val }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona stato" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setChangeStatusDialog({ open: false, status: "" })}
            >
              Annulla
            </Button>
            <Button onClick={handleChangeStatus} disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Aggiorna
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Assegnazione */}
      <Dialog
        open={assignDialog.open}
        onOpenChange={(open) => !open && setAssignDialog({ open: false })}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assegna ticket</DialogTitle>
            <DialogDescription>
              Seleziona un amministratore a cui assegnare il ticket.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-2 space-y-4">
            {/* Assegna a me */}
            <button
              onClick={() => setSelectedMember("me")}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                selectedMember === "me"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/50"
              }`}
            >
              <Avatar>
                <AvatarFallback className="bg-primary/10 text-primary">
                  {profile?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="font-medium flex items-center gap-2">
                  Assegna a me
                  <Badge variant="outline" className="text-xs">Tu</Badge>
                </p>
                <p className="text-sm text-muted-foreground">
                  {profile?.email || user?.email}
                </p>
              </div>
              {selectedMember === "me" && (
                <CheckCircle className="h-5 w-5 text-primary" />
              )}
            </button>

            <Separator />

            {/* Lista membri */}
            {membersLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">
                  Nessun altro amministratore disponibile
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[250px] pr-4">
                <div className="space-y-2">
                  {filteredMembers.map((member) => (
                    <button
                      key={member.memberId}
                      onClick={() => setSelectedMember(member.memberId)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        selectedMember === member.memberId
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <Avatar>
                        <AvatarFallback>
                          {member.firstName?.[0]?.toUpperCase()}
                          {member.lastName?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <p className="font-medium">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                      {selectedMember === member.memberId && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignDialog({ open: false })}
            >
              Annulla
            </Button>
            <Button 
              onClick={handleAssign} 
              disabled={isSubmitting || !selectedMember}
              className="gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Assegna
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Conferma chiusura */}
      <Dialog
        open={closeTicketDialog.open}
        onOpenChange={(open) => !open && setCloseTicketDialog({ open: false })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chiudi ticket</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler chiudere questo ticket? L'operazione è reversibile
              (puoi sempre riaprirlo cambiando stato).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCloseTicketDialog({ open: false })}
            >
              Annulla
            </Button>
            <Button
              variant="destructive"
              onClick={handleCloseTicket}
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Conferma chiusura
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Upload */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Carica allegato</DialogTitle>
            <DialogDescription>
              Seleziona un file da allegare al ticket.
            </DialogDescription>
          </DialogHeader>
          <div
            className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
            {selectedFile ? (
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <File className="h-5 w-5 text-primary" />
                <span className="font-medium max-w-[200px] truncate">
                  {selectedFile.name}
                </span>
                <span className="text-muted-foreground text-xs">
                  ({formatSize(selectedFile.size)})
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-10 w-10 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Clicca per selezionare un file
                </span>
              </div>
            )}
          </div>
          {uploading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>
                {uploadStep === "getting-url" && "Preparazione..."}
                {uploadStep === "uploading" && "Caricamento su storage..."}
                {uploadStep === "confirming" && "Conferma..."}
              </span>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleUploadAttachment} disabled={!selectedFile || uploading} className="gap-2">
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Caricando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Carica
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}