import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  ArrowLeft,
  File,
  Users,
  GitBranch,
  Download,
  CheckCircle,
  Info,
  Clock,
  HardDrive,
  User,
  Trash2,
  Archive,
  Timer,
  Eye,
  EyeOff,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { documentAdminApi } from "@/app/api/documentAdmin";
import { format, formatDistanceToNow, addDays, differenceInDays } from "date-fns";
import { it } from "date-fns/locale";
import { useNavigate, useParams } from "react-router";

interface DocumentDetail {
  id: string;
  versioningEnabled: boolean;
  currentVersion: number;
  createdAt: string;
  status: "DRAFT" | "ACTIVE" | "DELETED";
  deletedAt?: string;
}

interface DocumentVersionMock {
  version: number;
  originalName: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  uploadedByInitials?: string;
}

interface PermissionMock {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  avatarColor?: string;
}

export default function DocumentDetailPage() {
  const navigate = useNavigate();
  const { condominiumId, documentId } = useParams<{
    condominiumId: string;
    documentId: string;
  }>();

  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Dialog per eliminazione
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: "delete" | "program" | null;
  }>({ open: false, type: null });
  const [actionLoading, setActionLoading] = useState(false);

  // Stato per cambio status (sezione dedicata)
  const [statusChangeLoading, setStatusChangeLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<"DRAFT" | "ACTIVE">("DRAFT");
  // Stato per ripristino (dal cestino)
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<"DRAFT" | "ACTIVE">("DRAFT");

  // Dati mock (sostituisci con chiamate reali quando disponibili)
  const [mockVersions] = useState<DocumentVersionMock[]>([
    {
      version: 3,
      originalName: "Regolamento_v3.pdf",
      size: 2450000,
      uploadedAt: new Date(2026, 1, 15, 10, 30).toISOString(),
      uploadedBy: "Mario Rossi",
      uploadedByInitials: "MR",
    },
    {
      version: 2,
      originalName: "Regolamento_v2.pdf",
      size: 2300000,
      uploadedAt: new Date(2026, 0, 20, 14, 15).toISOString(),
      uploadedBy: "Mario Rossi",
      uploadedByInitials: "MR",
    },
    {
      version: 1,
      originalName: "Regolamento_v1.pdf",
      size: 2100000,
      uploadedAt: new Date(2025, 11, 10, 9, 0).toISOString(),
      uploadedBy: "Laura Bianchi",
      uploadedByInitials: "LB",
    },
  ]);

  const [permissions] = useState<PermissionMock[]>([
    {
      userId: "1",
      fullName: "Mario Rossi",
      email: "mario@example.com",
      role: "Amministratore",
      avatarColor: "bg-blue-500",
    },
    {
      userId: "2",
      fullName: "Laura Bianchi",
      email: "laura@example.com",
      role: "Sub Admin",
      avatarColor: "bg-purple-500",
    },
    {
      userId: "3",
      fullName: "Giuseppe Verdi",
      email: "giuseppe@example.com",
      role: "Residente",
      avatarColor: "bg-green-500",
    },
  ]);

  // Fetch dettaglio
  const fetchDetail = useCallback(async () => {
    if (!condominiumId || !documentId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await documentAdminApi.detail(condominiumId, documentId);
      setDocument(response.data);
      // Se il documento non è DELETED, imposta lo stato selezionato di default
      if (response.data.status !== "DELETED") {
        setSelectedStatus(response.data.status);
      }
    } catch (err: any) {
      console.error("Errore fetch dettaglio documento", err);
      const msg = err?.response?.data?.message || "Errore nel caricamento del documento";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [condominiumId, documentId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // Refresh manuale
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDetail();
    setRefreshing(false);
    toast.info("Dettaglio aggiornato");
  };

  // Utility formattazione
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMM yyyy HH:mm", { locale: it });
  };

  const formatRelativeTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: it });
  };

  const goBack = () => {
    navigate(-1);
  };

  const handleDownload = (version?: number) => {
    toast.info(version ? `Download versione ${version} avviato` : "Download avviato");
  };

  // Gestione eliminazione
  const openDeleteDialog = (type: "delete" | "program") => {
    setDeleteDialog({ open: true, type });
  };

  const handleDeleteAction = async () => {
    if (!condominiumId || !documentId || !deleteDialog.type) return;
    setActionLoading(true);
    try {
      if (deleteDialog.type === "delete") {
        await documentAdminApi.deleteDocument(condominiumId, documentId);
        toast.success("Documento eliminato definitivamente.");
      } else {
        await documentAdminApi.programDeletion(condominiumId, documentId);
        toast.success("Documento programmato per l'eliminazione.");
      }
      navigate(`/admin/condomini/${condominiumId}/documenti`, { replace: true });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Errore durante l'operazione.");
    } finally {
      setActionLoading(false);
      setDeleteDialog({ open: false, type: null });
    }
  };

  // Gestione cambio stato (per documenti non DELETED)
  const handleChangeStatus = async () => {
    if (!condominiumId || !documentId || !document) return;
    if (selectedStatus === document.status) {
      toast.info("Lo stato è già impostato su " + selectedStatus);
      return;
    }
    setStatusChangeLoading(true);
    try {
      await documentAdminApi.changeStatus(condominiumId, documentId, selectedStatus);
      toast.success(`Stato documento cambiato in ${selectedStatus === "ACTIVE" ? "Attivo" : "Bozza"}`);
      await fetchDetail();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Errore durante il cambio stato.");
    } finally {
      setStatusChangeLoading(false);
    }
  };

  // Gestione ripristino (per documenti DELETED)
  const handleRestore = async () => {
    if (!condominiumId || !documentId || !document) return;
    setStatusChangeLoading(true);
    try {
      await documentAdminApi.changeStatus(condominiumId, documentId, restoreStatus);
      toast.success(`Documento ripristinato come ${restoreStatus === "ACTIVE" ? "Attivo" : "Bozza"}`);
      setRestoreDialogOpen(false);
      await fetchDetail();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Errore durante il ripristino.");
    } finally {
      setStatusChangeLoading(false);
    }
  };

  // Countdown eliminazione
  const getDeletionCountdown = () => {
    if (!document?.deletedAt) return null;
    const deletionDate = addDays(new Date(document.deletedAt), 7);
    const daysLeft = differenceInDays(deletionDate, new Date());
    if (daysLeft < 0) return "Scaduto";
    if (daysLeft === 0) return "Oggi";
    return `${daysLeft} giorno${daysLeft !== 1 ? "i" : ""}`;
  };

  const getDeletionDate = () => {
    if (!document?.deletedAt) return null;
    const deletionDate = addDays(new Date(document.deletedAt), 7);
    return format(deletionDate, "dd MMM yyyy HH:mm", { locale: it });
  };

  // Versioni (mock)
  const getCurrentVersionMock = (doc: DocumentDetail): DocumentVersionMock => ({
    version: doc.currentVersion,
    originalName: `Documento_${doc.id.slice(0, 8)}.pdf`,
    size: 1024 * 1024,
    uploadedAt: doc.createdAt,
    uploadedBy: "Amministratore",
    uploadedByInitials: "AD",
  });

  const sortedVersions = [...mockVersions].sort((a, b) => b.version - a.version);
  const versionsToShow = document?.versioningEnabled
    ? sortedVersions
    : document
    ? [getCurrentVersionMock(document)]
    : [];
  const versionCount = document?.versioningEnabled ? versionsToShow.length : 1;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Badge stato (riutilizzabile)
  const StatusBadge = ({ status, size = "default" }: { status: string; size?: "sm" | "default" }) => {
    const config = {
      ACTIVE: { variant: "default" as const, icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      DRAFT: { variant: "secondary" as const, icon: <EyeOff className="h-3 w-3 mr-1" /> },
      DELETED: { variant: "destructive" as const, icon: <Archive className="h-3 w-3 mr-1" /> },
    };
    const { variant, icon } = config[status as keyof typeof config] || config.DRAFT;
    return (
      <Badge variant={variant} className={`flex items-center gap-0.5 ${size === "sm" ? "text-xs px-2 py-0" : ""}`}>
        {icon}
        {status === "ACTIVE" ? "Attivo" : status === "DRAFT" ? "Bozza" : "Eliminato"}
      </Badge>
    );
  };

  // Loading e error state
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Caricamento dettaglio documento...</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="p-6 text-center max-w-md mx-auto">
        <div className="mb-4 text-destructive">
          <Info className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Impossibile caricare il documento</h3>
        <p className="text-muted-foreground mb-4">{error || "Documento non trovato"}</p>
        <Button variant="outline" onClick={goBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Torna indietro
        </Button>
      </div>
    );
  }

  const isDeleted = document.status === "DELETED";

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-5xl">
      {/* Banner per documento nel cestino */}
      {isDeleted && (
        <Alert className="border-orange-500 bg-orange-50 text-orange-800 dark:bg-orange-950/30 dark:border-orange-700 dark:text-orange-300">
          <Timer className="h-4 w-4" />
          <AlertTitle>Documento nel cestino</AlertTitle>
          <AlertDescription>
            Questo documento verrà eliminato definitivamente il{" "}
            <strong>{getDeletionDate()}</strong> (tra {getDeletionCountdown()}).
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={goBack} className="shrink-0">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Indietro
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <File className="h-6 w-6 text-primary" />
              <span className="truncate max-w-[200px]">{document.id.slice(0, 8)}...</span>
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <StatusBadge status={document.status} size="sm" />
              <span className="text-xs text-muted-foreground">
                Creato {formatRelativeTime(document.createdAt)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </div>

        {/* Azioni (senza cambio stato) */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" onClick={() => handleDownload()}>
            <Download className="h-4 w-4 mr-2" />
            Scarica
          </Button>

          {!isDeleted ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => openDeleteDialog("program")}
                className="gap-1"
              >
                <Clock className="h-4 w-4" />
                Programma eliminazione
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => openDeleteDialog("delete")}
                className="gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Elimina
              </Button>
            </>
          ) : (
            /* Pulsante Ripristina (apre dialog) – lo teniamo qui ma lo abbiamo già nella sezione stato */
            <Button
              size="sm"
              variant="default"
              onClick={() => setRestoreDialogOpen(true)}
              className="gap-1"
            >
              <RotateCcw className="h-4 w-4" />
              Ripristina
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* ==================== NUOVA SEZIONE STATO DEDICATA ==================== */}
      <Card className="border shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Stato documento:</span>
            <StatusBadge status={document.status} />
          </div>

          {!isDeleted ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Cambia in:</span>
              <Select
                value={selectedStatus}
                onValueChange={(val) => setSelectedStatus(val as "DRAFT" | "ACTIVE")}
                disabled={statusChangeLoading}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Scegli stato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Bozza</SelectItem>
                  <SelectItem value="ACTIVE">Attivo</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={handleChangeStatus}
                disabled={statusChangeLoading || selectedStatus === document.status}
                className="gap-1"
              >
                {statusChangeLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Aggiorna
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Per ripristinare, scegli il nuovo stato:</span>
              <Select
                value={restoreStatus}
                onValueChange={(val) => setRestoreStatus(val as "DRAFT" | "ACTIVE")}
                disabled={statusChangeLoading}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Scegli stato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Bozza</SelectItem>
                  <SelectItem value="ACTIVE">Attivo</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={() => setRestoreDialogOpen(true)}
                disabled={statusChangeLoading}
                className="gap-1"
              >
                <RotateCcw className="h-4 w-4" />
                Ripristina
              </Button>
            </div>
          )}
        </div>
      </Card>
      {/* ==================== FINE SEZIONE STATO ==================== */}

      {/* Card riepilogo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <GitBranch className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Versioni</p>
              <p className="font-semibold">
                {document.versioningEnabled ? `${versionsToShow.length} disponibili` : "Non abilitato"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <HardDrive className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Versione corrente</p>
              <p className="font-semibold">v{document.currentVersion}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Con accesso</p>
              <p className="font-semibold">{permissions.length} utenti</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Data creazione</p>
              <p className="font-semibold text-sm">{formatDate(document.createdAt)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="versions" className="w-full">
        <TabsList className="w-full max-w-sm grid grid-cols-2">
          <TabsTrigger value="versions" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Versioni
            <Badge variant="secondary" className="ml-1 text-xs">
              {versionCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Accesso
            {permissions.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {permissions.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="versions" className="space-y-4 pt-4">
          {versionsToShow.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <GitBranch className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Nessuna versione disponibile</p>
              <p className="text-sm">Carica una nuova versione per visualizzarla qui.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {versionsToShow.map((v) => {
                const isCurrent = v.version === document.currentVersion;
                const isOnlyVersion = !document.versioningEnabled && versionsToShow.length === 1;

                return (
                  <div
                    key={v.version}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                      isCurrent
                        ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20"
                        : "bg-card hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                            isCurrent
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          v{v.version}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium truncate">{v.originalName}</span>
                          {isCurrent && (
                            <Badge variant="default" className="text-[10px] px-2 py-0">
                              {isOnlyVersion ? "Unica versione" : "Corrente"}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatSize(v.size)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {v.uploadedBy}
                          </span>
                          <span>•</span>
                          <span>{formatDate(v.uploadedAt)}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(v.version)}
                      className="flex-shrink-0"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      <span className="text-xs">Scarica</span>
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4 pt-4">
          {permissions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Nessun utente con accesso</p>
              <p className="text-sm">Non ci sono utenti autorizzati a visualizzare questo documento.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {permissions.map((p) => (
                <div
                  key={p.userId}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className={`text-white ${p.avatarColor || "bg-primary"}`}>
                        {getInitials(p.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{p.fullName}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{p.email}</span>
                        <span className="text-xs">•</span>
                        <Badge
                          variant={
                            p.role === "Amministratore"
                              ? "default"
                              : p.role === "Sub Admin"
                              ? "secondary"
                              : "outline"
                          }
                          className="text-[10px] px-2 py-0 h-5"
                        >
                          {p.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Accesso</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog per eliminazione */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => !actionLoading && setDeleteDialog({ open, type: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {deleteDialog.type === "delete" ? "Eliminazione definitiva" : "Programmazione eliminazione"}
            </DialogTitle>
            <DialogDescription>
              {deleteDialog.type === "delete"
                ? "Sei sicuro di voler eliminare definitivamente questo documento? Questa azione non è reversibile."
                : "Sei sicuro di voler programmare l'eliminazione di questo documento? Sarà contrassegnato come eliminato e rimosso dalla vista."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, type: null })}
              disabled={actionLoading}
            >
              Annulla
            </Button>
            <Button
              variant={deleteDialog.type === "delete" ? "destructive" : "default"}
              onClick={handleDeleteAction}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  In corso...
                </>
              ) : deleteDialog.type === "delete" ? (
                "Elimina definitivamente"
              ) : (
                "Programma eliminazione"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog per ripristino (solo per documenti DELETED) */}
      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ripristina documento</DialogTitle>
            <DialogDescription>
              Conferma il ripristino del documento dal cestino. Lo stato scelto verrà applicato.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="restore-status" className="text-sm font-medium">
              Nuovo stato
            </Label>
            <Select
              value={restoreStatus}
              onValueChange={(val) => setRestoreStatus(val as "DRAFT" | "ACTIVE")}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Scegli stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Bozza</SelectItem>
                <SelectItem value="ACTIVE">Attivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreDialogOpen(false)} disabled={statusChangeLoading}>
              Annulla
            </Button>
            <Button onClick={handleRestore} disabled={statusChangeLoading}>
              {statusChangeLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ripristino...
                </>
              ) : (
                "Ripristina"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}