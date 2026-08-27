// pages/private/AdminTicketDetailPage.tsx
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
  Mail,
  Clock,
  MoreHorizontal,
  Upload,
  File,
  X,
  AlertCircle,
  CheckCircle,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { ticketAdminApi } from "@/app/api/ticketAdmin";
import { uploadFileToStorage } from "@/auth/uploadStorage";
import { downloadFileFromStorage } from "@/auth/downloadFileFromStorage";
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
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  OPEN: { label: "Aperto", variant: "default" },
  IN_PROGRESS: { label: "In corso", variant: "secondary" },
  WAITING_USER: { label: "In attesa utente", variant: "outline" },
  WAITING_ADMIN: { label: "In attesa admin", variant: "outline" },
  CLOSED: { label: "Chiuso", variant: "destructive" },
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Bassa",
  MEDIUM: "Media",
  HIGH: "Alta",
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
  const [assignDialog, setAssignDialog] = useState<{ open: boolean; email: string }>({
    open: false,
    email: "",
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
    toast.info("Aggiornato");
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
    if (!ticketId || !assignDialog.email) return;
    setIsSubmitting(true);
    try {
      await ticketAdminApi.assignTicket(condominiumId!, ticketId, {
        email: assignDialog.email,
      });
      toast.success("Ticket assegnato");
      setAssignDialog({ open: false, email: "" });
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

  // ⭐ Download attachment – copiato da ResidentDocumentDetailPage
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

      // Scarica il file come blob usando l'utility
      const blob = await downloadFileFromStorage(downloadUrl);

      // Crea un URL per il blob
      const blobUrl = URL.createObjectURL(blob);

      // Crea un link fittizio e avvia il download
      const link = window.document.createElement("a");
      link.href = blobUrl;
      link.download = response.data.fileName || fileName;

      window.document.body.appendChild(link);
      link.click();
      link.remove();

      // Rilascia l'URL del blob
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
    onPageChange: (p: number) => void
  ) => {
    if (loading) {
      return <Loader2 className="h-6 w-6 animate-spin mx-auto" />;
    }
    if (messages.length === 0) {
      return <p className="text-center text-muted-foreground text-sm">Nessun messaggio</p>;
    }
    return (
      <>
        <div className="space-y-4 max-h-96 overflow-y-auto p-1">
          {messages.map((msg) => (
            <div key={msg.id} className="flex flex-col gap-1 border-b pb-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">
                  {msg.firstName} {msg.lastName}
                </span>
                <span className="text-muted-foreground text-xs">
                  {formatDate(msg.createdAt)}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
            </div>
          ))}
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => onPageChange(page - 1)}
            >
              Precedente
            </Button>
            <span className="text-sm">Pagina {page + 1} di {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange(page + 1)}
            >
              Successiva
            </Button>
          </div>
        )}
      </>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
        <p className="mt-2 text-muted-foreground">Ticket non trovato</p>
        <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
          Torna indietro
        </Button>
      </div>
    );
  }

  const isClosed = ticket.status === "CLOSED";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{ticket.title}</h1>
            <p className="text-sm text-muted-foreground">
              #{ticket.id?.slice(0, 8)} • Creato il {formatDate(ticket.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
          {!isClosed && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setCloseTicketDialog({ open: true })}
              className="gap-1"
            >
              <CheckCircle className="h-4 w-4" />
              Chiudi ticket
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4 mr-1" /> Azioni
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  setChangeStatusDialog({ open: true, status: ticket.status })
                }
              >
                <Clock className="h-4 w-4 mr-2" /> Cambia stato
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setAssignDialog({ open: true, email: "" })}
              >
                <User className="h-4 w-4 mr-2" /> Assegna
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Dettagli ticket */}
      <Card>
        <CardHeader>
          <CardTitle>Dettagli ticket</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-muted-foreground">Stato</Label>
            <Badge variant={STATUS_CONFIG[ticket.status]?.variant || "outline"}>
              {STATUS_CONFIG[ticket.status]?.label || ticket.status}
            </Badge>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground">Priorità</Label>
            <Badge
              variant={
                ticket.priority === "HIGH"
                  ? "destructive"
                  : ticket.priority === "MEDIUM"
                  ? "default"
                  : "outline"
              }
            >
              {PRIORITY_LABELS[ticket.priority] || ticket.priority}
            </Badge>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground">Categoria</Label>
            <div>{CATEGORY_LABELS[ticket.category] || ticket.category || "—"}</div>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground">Creato da</Label>
            <div className="flex items-center gap-1">
              <Mail className="h-4 w-4 text-muted-foreground" />
              {ticket.createdByEmail}
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground">Assegnato a</Label>
            <div>{ticket.assignedTo || "Non assegnato"}</div>
          </div>
          {ticket.closedAt && (
            <div className="space-y-1">
              <Label className="text-muted-foreground">Chiuso il</Label>
              <div>{formatDate(ticket.closedAt)}</div>
            </div>
          )}
          <div className="col-span-1 md:col-span-2 space-y-1">
            <Label className="text-muted-foreground">Descrizione</Label>
            <div className="p-2 bg-muted/50 rounded-md text-sm">
              {ticket.description || "Nessuna descrizione"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messaggi */}
      <Card>
        <CardHeader>
          <CardTitle>Messaggi</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="public" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="public">Pubblici</TabsTrigger>
              <TabsTrigger value="internal">Interni (Privati)</TabsTrigger>
            </TabsList>
            <TabsContent value="public" className="space-y-4">
              {renderMessageList(
                publicMessages,
                loadingPublic,
                publicPage,
                publicTotalPages,
                fetchPublicMessages
              )}
              <Separator />
              <div className="space-y-2">
                <Textarea
                  placeholder="Scrivi un messaggio pubblico (visibile a tutti)..."
                  value={newPublicMessage}
                  onChange={(e) => setNewPublicMessage(e.target.value)}
                  rows={3}
                />
                <Button
                  onClick={handleSendPublicMessage}
                  disabled={isSubmitting || !newPublicMessage.trim()}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <MessageSquare className="h-4 w-4 mr-1" />
                  )}
                  Invia pubblico
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="internal" className="space-y-4">
              {renderMessageList(
                internalMessages,
                loadingInternal,
                internalPage,
                internalTotalPages,
                fetchInternalMessages
              )}
              <Separator />
              <div className="space-y-2">
                <Textarea
                  placeholder="Scrivi un messaggio interno (visibile solo agli admin)..."
                  value={newInternalMessage}
                  onChange={(e) => setNewInternalMessage(e.target.value)}
                  rows={3}
                />
                <Button
                  onClick={handleSendInternalMessage}
                  disabled={isSubmitting || !newInternalMessage.trim()}
                  variant="secondary"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <MessageSquare className="h-4 w-4 mr-1" />
                  )}
                  Invia interno
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Allegati */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Allegati</CardTitle>
          <Button
            size="sm"
            onClick={() => setUploadDialogOpen(true)}
            className="gap-1"
          >
            <Upload className="h-4 w-4" /> Carica
          </Button>
        </CardHeader>
        <CardContent>
          {loadingAttachments ? (
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          ) : attachments.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm">
              Nessun allegato
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Dimensione</TableHead>
                    <TableHead>Caricato da</TableHead>
                    <TableHead>Visibilità</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attachments.map((att) => (
                    <TableRow key={att.id}>
                      <TableCell className="flex items-center gap-2">
                        <File className="h-4 w-4" />
                        {att.originalName}
                      </TableCell>
                      <TableCell>{formatSize(att.size)}</TableCell>
                      <TableCell>
                        {att.firstName} {att.lastName}
                      </TableCell>
                      <TableCell>{att.visibility}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7"
                          onClick={() => handleDownload(att.id, att.originalName)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {attTotalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={attPage === 0}
                    onClick={() => fetchAttachments(attPage - 1)}
                  >
                    Precedente
                  </Button>
                  <span className="text-sm">
                    Pagina {attPage + 1} di {attTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={attPage >= attTotalPages - 1}
                    onClick={() => fetchAttachments(attPage + 1)}
                  >
                    Successiva
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
            <Button onClick={handleChangeStatus} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aggiorna"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Assegnazione */}
      <Dialog
        open={assignDialog.open}
        onOpenChange={(open) =>
          !open && setAssignDialog({ open: false, email: "" })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assegna ticket</DialogTitle>
            <DialogDescription>
              Inserisci l'email dell'amministratore.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Email"
            value={assignDialog.email}
            onChange={(e) =>
              setAssignDialog((prev) => ({ ...prev, email: e.target.value }))
            }
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignDialog({ open: false, email: "" })}
            >
              Annulla
            </Button>
            <Button onClick={handleAssign} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Assegna"}
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
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-1" />
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
            className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-muted/50 transition cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
            {selectedFile ? (
              <div className="flex items-center justify-center gap-2">
                <File className="h-4 w-4 text-primary" />
                <span className="font-medium">{selectedFile.name}</span>
                <span className="text-muted-foreground text-xs">
                  ({formatSize(selectedFile.size)})
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-0.5">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
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
            <Button onClick={handleUploadAttachment} disabled={!selectedFile || uploading}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Caricando...
                </>
              ) : (
                "Carica"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}