import { useState, useEffect, useCallback, useRef } from "react";
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
  MoreHorizontal,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { documentAdminApi } from "@/app/api/documentAdmin";
import { uploadFileToStorage } from "@/auth/uploadStorage";
import { format, formatDistanceToNow, addDays, differenceInDays } from "date-fns";
import { it } from "date-fns/locale";
import { useNavigate, useParams } from "react-router";
import { condominiumMemberApi, type FetchMembersResponseDto } from "@/app/api/condominiumMember";
import { downloadFileFromStorage } from "@/auth/downloadFileFromStorage";

interface DocumentDetail {
  id: string;
  versioningEnabled: boolean;
  currentVersion: number;
  createdAt: string;
  status: "DRAFT" | "ACTIVE" | "DELETED";
  deletedAt?: string;
}

interface DocumentVersion {
  idVersion: string;
  originalName: string;
  version: number;
  size: number;
  contentType: string;
  createdAt: string;
  uploadedBy: string;
}

interface VisibilityEntry {
  firstName: string;
  lastName: string;
  role: string;
  memberId: string;
  userId: string;
}

const roleMap: Record<string, string> = {
  CONDO_ADMIN: "Amministratore Condominio",
  SUB_ADMIN: "Sub Admin",
  CONDO_RESIDENT: "Residente",
};

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

  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [versionsError, setVersionsError] = useState<string | null>(null);

  const [visibility, setVisibility] = useState<VisibilityEntry[]>([]);
  const [visibilityLoading, setVisibilityLoading] = useState(false);
  const [visibilityError, setVisibilityError] = useState<string | null>(null);

  const [visibilityDialogOpen, setVisibilityDialogOpen] = useState(false);
  const [allMembers, setAllMembers] = useState<FetchMembersResponseDto[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  const [selectedToAdd, setSelectedToAdd] = useState<Set<string>>(new Set());
  const [selectedToRemove, setSelectedToRemove] = useState<Set<string>>(new Set());

  const [newVersionDialogOpen, setNewVersionDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [versionName, setVersionName] = useState("");
  const [isUploadingVersion, setIsUploadingVersion] = useState(false);
  const [uploadStep, setUploadStep] = useState<
    "idle" | "getting-url" | "uploading-to-storage" | "confirming"
  >("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: "delete" | "program" | null;
  }>({ open: false, type: "program" });
  const [actionLoading, setActionLoading] = useState(false);

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [tempStatus, setTempStatus] = useState<"DRAFT" | "ACTIVE">("DRAFT");

  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<"DRAFT" | "ACTIVE">("DRAFT");

  const [downloading, setDownloading] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!condominiumId || !documentId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await documentAdminApi.detail(condominiumId, documentId);
      setDocument(response.data);
      if (response.data.status !== "DELETED") {
        setTempStatus(response.data.status);
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

  const fetchVersions = useCallback(async () => {
    if (!condominiumId || !documentId) return;
    setVersionsLoading(true);
    setVersionsError(null);
    try {
      const response = await documentAdminApi.fetchVersions(condominiumId, documentId, {
        page: 0,
        size: 100,
        sortBy: "version",
        ascending: false,
      });
      const data = response.data || [];
      setVersions(data);
    } catch (err: any) {
      console.error("Errore fetch versioni", err);
      const msg = err?.response?.data?.message || "Errore nel caricamento delle versioni";
      setVersionsError(msg);
      toast.error(msg);
    } finally {
      setVersionsLoading(false);
    }
  }, [condominiumId, documentId]);

  const fetchVisibility = useCallback(async () => {
    if (!condominiumId || !documentId) return;
    setVisibilityLoading(true);
    setVisibilityError(null);
    try {
      const response = await documentAdminApi.fetchVisibility(condominiumId, documentId, {
        page: 0,
        size: 100,
        sortBy: "createdAt",
        ascending: true,
      });
      const data = response.data || [];
      setVisibility(data);
    } catch (err: any) {
      console.error("Errore fetch visibilità", err);
      const msg = err?.response?.data?.message || "Errore nel caricamento degli accessi";
      setVisibilityError(msg);
      toast.error(msg);
    } finally {
      setVisibilityLoading(false);
    }
  }, [condominiumId, documentId]);

  const loadMembers = useCallback(async () => {
    if (!condominiumId) return;
    setMembersLoading(true);
    try {
      const response = await condominiumMemberApi.fetchMembers(
        {
          size: 1000,
          page: 0,
        },
        condominiumId
      );
      const members = response.data || [];
      setAllMembers(members);
    } catch (err) {
      toast.error("Errore nel caricamento dei membri");
    } finally {
      setMembersLoading(false);
    }
  }, [condominiumId]);

  const handleOpenVisibilityDialog = () => {
    setVisibilityDialogOpen(true);
    setSelectedToAdd(new Set());
    setSelectedToRemove(new Set());
    loadMembers();
  };

  const toggleAdd = (memberId: string) => {
    setSelectedToAdd((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(memberId)) newSet.delete(memberId);
      else newSet.add(memberId);
      return newSet;
    });
  };

  const toggleRemove = (memberId: string) => {
    setSelectedToRemove((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(memberId)) newSet.delete(memberId);
      else newSet.add(memberId);
      return newSet;
    });
  };

  const toggleAllAdd = () => {
    const visibleUserIds = new Set(visibility.map((v) => v.userId));
    const notVisible = allMembers.filter((m) => !visibleUserIds.has(m.id));
    if (selectedToAdd.size === notVisible.length) {
      setSelectedToAdd(new Set());
    } else {
      setSelectedToAdd(new Set(notVisible.map((m) => m.id)));
    }
  };

  const toggleAllRemove = () => {
    const visibleUserIds = new Set(visibility.map((v) => v.userId));
    const visibleMembers = allMembers.filter((m) => visibleUserIds.has(m.id));
    if (selectedToRemove.size === visibleMembers.length) {
      setSelectedToRemove(new Set());
    } else {
      setSelectedToRemove(new Set(visibleMembers.map((m) => m.id)));
    }
  };

  const handleSaveVisibility = async () => {
    if (!condominiumId || !documentId) return;

    const userIdToMemberId = new Map(
      allMembers.map((m) => [m.id, m.memberId])
    );

    const addMemberIds = Array.from(selectedToAdd)
      .map((userId) => userIdToMemberId.get(userId))
      .filter((id): id is string => id !== undefined);

    const removeMemberIds = Array.from(selectedToRemove)
      .map((userId) => userIdToMemberId.get(userId))
      .filter((id): id is string => id !== undefined);

    if (addMemberIds.length === 0 && removeMemberIds.length === 0) {
      toast.info("Nessuna modifica");
      setVisibilityDialogOpen(false);
      return;
    }

    setActionLoading(true);
    try {
      if (removeMemberIds.length > 0) {
        await documentAdminApi.updateVisibility(condominiumId, documentId, {
          addMembers: [],
          removeMembers: removeMemberIds,
          addAll: false,
        });
      }
      if (addMemberIds.length > 0) {
        await documentAdminApi.updateVisibility(condominiumId, documentId, {
          addMembers: addMemberIds,
          removeMembers: [],
          addAll: false,
        });
      }
      toast.success("Visibilità aggiornata con successo");
      await fetchVisibility();
      setVisibilityDialogOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Errore durante l'aggiornamento");
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      await fetchDetail();
    };
    loadAll();
  }, [fetchDetail]);

  useEffect(() => {
    if (document) {
      fetchVersions();
      fetchVisibility();
    }
  }, [document, fetchVersions, fetchVisibility]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDetail();
    await fetchVersions();
    await fetchVisibility();
    setRefreshing(false);
    toast.info("Dettaglio aggiornato");
  };

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

  const goBack = () => {
    navigate(-1);
  };

  // ********** FUNZIONE HANDLE DOWNLOAD CORRETTA **********
  const handleDownload = async (versionId?: string) => {
    if (!condominiumId || !documentId) {
      toast.error("Dati mancanti per il download");
      return;
    }

    setDownloading(true);
    try {
      let requestedVersion: number | undefined = undefined;

      if (versionId) {
        const version = versions.find((v) => v.idVersion === versionId);
        if (version) {
          requestedVersion = version.version;
        } else {
          toast.error("Versione non trovata");
          return;
        }
      }

      const response = await documentAdminApi.download(
        condominiumId,
        documentId,
        requestedVersion
      );

      const downloadUrl = response.data;

      if (!downloadUrl) {
        toast.error("URL di download non disponibile");
        return;
      }

      const blob = await downloadFileFromStorage(downloadUrl);

      const blobUrl = URL.createObjectURL(blob);

      const link = window.document.createElement("a");
      link.href = blobUrl;
      link.download = "documento.pdf";

      window.document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(blobUrl);

      toast.success("Download completato");
    } catch (error: any) {
      console.error("Errore durante il download", error);
      toast.error(error?.message || "Errore durante il download");
    } finally {
      setDownloading(false);
    }
  };
  // ********** FINE HANDLE DOWNLOAD **********

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!versionName) setVersionName(file.name);
    }
  };

  const resetVersionForm = () => {
    setSelectedFile(null);
    setVersionName("");
    setUploadStep("idle");
    setIsUploadingVersion(false);
  };

  const handleUploadNewVersion = async () => {
    if (!selectedFile || !document || !condominiumId || !documentId) return;
    setIsUploadingVersion(true);
    setUploadStep("getting-url");
    try {
      const file = selectedFile;
      const extension = file.name.split(".").pop() || "";
      const finalName = versionName.trim() || file.name;

      const payload = {
        originalFileName: finalName,
        size: file.size,
        contentType: file.type || "application/octet-stream",
        extension,
      };

      const response = await documentAdminApi.addNewVersion(condominiumId, documentId, payload);
      const { uploadUrl, documentVersionId } = response.data;

      setUploadStep("uploading-to-storage");
      await uploadFileToStorage(file, uploadUrl);

      setUploadStep("confirming");
      await documentAdminApi.confirmUpload(condominiumId, documentVersionId);

      toast.success("Nuova versione caricata con successo!");
      resetVersionForm();
      setNewVersionDialogOpen(false);
      await fetchDetail();
      await fetchVersions();
    } catch (error: any) {
      console.error("Errore durante l'upload della nuova versione", error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Si è verificato un errore. Riprova più tardi.";
      toast.error(`Errore: ${errorMsg}`);
      setUploadStep("idle");
    } finally {
      setIsUploadingVersion(false);
    }
  };

  const openDeleteDialog = () => {
    setDeleteDialog({ open: true, type: "program" });
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

  const handleStatusChange = async (newStatus: "DRAFT" | "ACTIVE") => {
    if (!condominiumId || !documentId || !document) return;
    if (newStatus === document.status) {
      toast.info("Lo stato è già impostato su " + newStatus);
      setStatusDialogOpen(false);
      return;
    }
    setActionLoading(true);
    try {
      await documentAdminApi.changeStatus(condominiumId, documentId, newStatus);
      toast.success(`Stato cambiato in ${newStatus === "ACTIVE" ? "Attivo" : "Bozza"}`);
      await fetchDetail();
      setTempStatus(newStatus);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Errore durante il cambio stato.");
    } finally {
      setActionLoading(false);
      setStatusDialogOpen(false);
    }
  };

  const handleRestore = async () => {
    if (!condominiumId || !documentId || !document) return;
    setActionLoading(true);
    try {
      await documentAdminApi.changeStatus(condominiumId, documentId, restoreStatus);
      toast.success(`Documento ripristinato come ${restoreStatus === "ACTIVE" ? "Attivo" : "Bozza"}`);
      setRestoreDialogOpen(false);
      await fetchDetail();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Errore durante il ripristino.");
    } finally {
      setActionLoading(false);
    }
  };

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

  const versionCount = versions.length > 0 ? versions.length : (document?.versioningEnabled ? 0 : 1);
  const versionsToShow = versions;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-green-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-rose-500",
      "bg-cyan-500",
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

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

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={goBack} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold truncate max-w-[180px] md:max-w-[300px]">
              {document.id.slice(0, 8)}...
            </h1>
            <button
              className="focus:outline-none"
              onClick={() => setStatusDialogOpen(true)}
            >
              <StatusBadge status={document.status} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" onClick={() => handleDownload()} disabled={downloading}>
            {downloading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Scarica
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!isDeleted ? (
                <>
                  <DropdownMenuItem onClick={openDeleteDialog} className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Elimina / Programma
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={() => setRestoreDialogOpen(true)} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Ripristina
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

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
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <GitBranch className="h-4 w-4" />
          Versioni: {versionCount}
        </span>
        <Separator orientation="vertical" className="h-4" />
        <span className="flex items-center gap-1">
          <HardDrive className="h-4 w-4" />
          Corrente: v{document.currentVersion}
        </span>
        <Separator orientation="vertical" className="h-4" />
        <span className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          Accesso: {visibility.length} utenti
        </span>
        <Separator orientation="vertical" className="h-4" />
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          Creato: {formatDate(document.createdAt)}
        </span>
      </div>

      <Separator />

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
            {visibility.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {visibility.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="versions" className="space-y-4 pt-4">
          {document.versioningEnabled && !isDeleted && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={() => setNewVersionDialogOpen(true)}
            >
              <Upload className="h-4 w-4" />
              Carica nuova versione
            </Button>
          )}
          {versionsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : versionsError ? (
            <div className="text-destructive text-center py-4">{versionsError}</div>
          ) : versionsToShow.length === 0 ? (
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
                    key={v.idVersion}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-all ${isCurrent
                        ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20"
                        : "bg-card hover:bg-muted/30"
                      }`}
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isCurrent
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
                          <Badge variant="outline" className="text-[10px] px-2 py-0">
                            {v.contentType}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {v.uploadedBy}
                          </span>
                          <span>•</span>
                          <span>{formatDate(v.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(v.idVersion)}
                      disabled={downloading}
                      className="flex-shrink-0"
                    >
                      {downloading ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-1" />
                      )}
                      <span className="text-xs">Scarica</span>
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4 pt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Utenti con accesso</h3>
            <Button size="sm" variant="outline" onClick={handleOpenVisibilityDialog}>
              <Users className="h-4 w-4 mr-2" />
              Gestisci accesso
            </Button>
          </div>

          {visibilityLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : visibilityError ? (
            <div className="text-destructive text-center py-4">{visibilityError}</div>
          ) : visibility.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Nessun utente con accesso</p>
              <p className="text-sm">
                Nessun utente è autorizzato a visualizzare questo documento. L'accesso sarà consentito esclusivamente agli amministratori e ai sub-amministratori.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibility.map((item) => {
                const fullName = `${item.firstName} ${item.lastName}`.trim();
                const roleLabel = roleMap[item.role] || item.role;
                const avatarColor = getAvatarColor(fullName || item.memberId);
                return (
                  <div
                    key={item.memberId}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/30 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={`text-white ${avatarColor}`}>
                          {getInitials(fullName || "Utente")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{fullName || "Utente senza nome"}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="text-xs text-muted-foreground">
                            ID: {item.memberId.slice(0, 8)}
                          </span>
                          <span className="text-xs">•</span>
                          <Badge
                            variant={
                              item.role === "ADMIN"
                                ? "default"
                                : item.role === "SUB_ADMIN"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="text-[10px] px-2 py-0 h-5"
                          >
                            {roleLabel}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Accesso</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog per la gestione della visibilità */}
      <Dialog open={visibilityDialogOpen} onOpenChange={setVisibilityDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Gestisci accesso al documento</DialogTitle>
            <DialogDescription>
              Scegli nella scheda <strong>Aggiungi</strong> gli utenti a cui dare accesso, oppure nella scheda <strong>Rimuovi</strong> quelli da rimuovere.
            </DialogDescription>
          </DialogHeader>

          {membersLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : allMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nessun membro trovato in questo condominio.</p>
            </div>
          ) : (
            <>
              <Tabs defaultValue="add" className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="add">Aggiungi</TabsTrigger>
                  <TabsTrigger value="remove">Rimuovi</TabsTrigger>
                </TabsList>

                <TabsContent value="add" className="flex-1 overflow-y-auto py-4 space-y-2">
                  {(() => {
                    const visibleUserIds = new Set(visibility.map((v) => v.userId));
                    const notVisible = allMembers.filter((m) => !visibleUserIds.has(m.id));
                    if (notVisible.length === 0) {
                      return (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>Tutti i membri hanno già accesso a questo documento.</p>
                        </div>
                      );
                    }
                    return (
                      <>
                        <div className="flex justify-between items-center pb-2 border-b">
                          <Button variant="ghost" size="sm" onClick={toggleAllAdd}>
                            {selectedToAdd.size === notVisible.length ? "Deseleziona tutti" : "Seleziona tutti"}
                          </Button>
                          <span className="text-xs text-muted-foreground">
                            {selectedToAdd.size} selezionati
                          </span>
                        </div>
                        {notVisible.map((member) => {
                          const fullName = `${member.firstName} ${member.lastName}`.trim();
                          const checked = selectedToAdd.has(member.id);
                          return (
                            <div
                              key={member.id}
                              className={`flex items-center space-x-3 p-2 rounded-lg border transition hover:bg-muted/50 cursor-pointer ${checked ? "border-green-500 bg-green-50 dark:bg-green-950/20" : ""
                                }`}
                              onClick={() => toggleAdd(member.id)}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleAdd(member.id)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className={`text-white ${getAvatarColor(fullName)}`}>
                                  {getInitials(fullName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{fullName}</p>
                                <p className="text-xs text-muted-foreground">{member.email}</p>
                              </div>
                              <Badge variant="outline" className="text-[10px]">
                                {roleMap[member.role] || member.role}
                              </Badge>
                            </div>
                          );
                        })}
                      </>
                    );
                  })()}
                </TabsContent>

                <TabsContent value="remove" className="flex-1 overflow-y-auto py-4 space-y-2">
                  {(() => {
                    const visibleUserIds = new Set(visibility.map((v) => v.userId));
                    const visibleMembers = allMembers.filter((m) => visibleUserIds.has(m.id));
                    if (visibleMembers.length === 0) {
                      return (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>Nessun membro ha attualmente accesso.</p>
                        </div>
                      );
                    }
                    return (
                      <>
                        <div className="flex justify-between items-center pb-2 border-b">
                          <Button variant="ghost" size="sm" onClick={toggleAllRemove}>
                            {selectedToRemove.size === visibleMembers.length ? "Deseleziona tutti" : "Seleziona tutti"}
                          </Button>
                          <span className="text-xs text-muted-foreground">
                            {selectedToRemove.size} selezionati
                          </span>
                        </div>
                        {visibleMembers.map((member) => {
                          const fullName = `${member.firstName} ${member.lastName}`.trim();
                          const checked = selectedToRemove.has(member.id);
                          return (
                            <div
                              key={member.id}
                              className={`flex items-center space-x-3 p-2 rounded-lg border transition hover:bg-muted/50 cursor-pointer ${checked ? "border-red-500 bg-red-50 dark:bg-red-950/20" : ""
                                }`}
                              onClick={() => toggleRemove(member.id)}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleRemove(member.id)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className={`text-white ${getAvatarColor(fullName)}`}>
                                  {getInitials(fullName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{fullName}</p>
                                <p className="text-xs text-muted-foreground">{member.email}</p>
                              </div>
                              <Badge variant="outline" className="text-[10px]">
                                {roleMap[member.role] || member.role}
                              </Badge>
                            </div>
                          );
                        })}
                      </>
                    );
                  })()}
                </TabsContent>
              </Tabs>

              <div className="border-t pt-3 mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Riepilogo modifiche:</span>
                  <div className="flex gap-4">
                    <span className="text-green-600">➕ {selectedToAdd.size} da aggiungere</span>
                    <span className="text-red-600">➖ {selectedToRemove.size} da rimuovere</span>
                    {selectedToAdd.size === 0 && selectedToRemove.size === 0 && (
                      <span className="text-muted-foreground">Nessuna modifica</span>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setVisibilityDialogOpen(false)}
              disabled={actionLoading}
            >
              Annulla
            </Button>
            <Button
              onClick={handleSaveVisibility}
              disabled={actionLoading || membersLoading}
            >
              {actionLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Salva modifiche"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog per nuova versione */}
      <Dialog open={newVersionDialogOpen} onOpenChange={(open) => {
        if (!open && !isUploadingVersion) {
          resetVersionForm();
          setNewVersionDialogOpen(false);
        }
      }}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Carica nuova versione</DialogTitle>
            <DialogDescription>
              Seleziona il file e, se desideri, modifica il nome.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div
              className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-muted/50 transition cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Input
                ref={fileInputRef}
                id="new-version-file"
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
              {selectedFile ? (
                <div className="flex items-center justify-center gap-2 text-sm">
                  <File className="h-4 w-4 text-primary" />
                  <span className="font-medium truncate max-w-[200px]">
                    {selectedFile.name}
                  </span>
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
                      setVersionName("");
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

            <div className="space-y-1">
              <Label htmlFor="version-name" className="text-xs font-medium">
                Nome versione
              </Label>
              <Input
                id="version-name"
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                placeholder="Lascia vuoto per usare il nome del file"
                className="h-8 text-sm"
              />
            </div>

            {isUploadingVersion && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>
                  {uploadStep === "getting-url" && "Preparazione..."}
                  {uploadStep === "uploading-to-storage" && "Caricamento su storage..."}
                  {uploadStep === "confirming" && "Conferma della versione..."}
                </span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setNewVersionDialogOpen(false)}
              disabled={isUploadingVersion}
              size="sm"
            >
              Annulla
            </Button>
            <Button
              onClick={handleUploadNewVersion}
              disabled={!selectedFile || isUploadingVersion}
              size="sm"
            >
              {isUploadingVersion ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {uploadStep === "uploading-to-storage" ? "Caricando..." : "Elaborazione..."}
                </>
              ) : (
                "Carica versione"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog cambio stato */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambia stato del documento</DialogTitle>
            <DialogDescription>
              Scegli il nuovo stato per il documento.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <RadioGroup
              value={tempStatus}
              onValueChange={(val) => setTempStatus(val as "DRAFT" | "ACTIVE")}
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
                  <p className="text-sm text-muted-foreground">Visibile a tutti gli autorizzati.</p>
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
              disabled={actionLoading || tempStatus === document.status}
            >
              {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Aggiorna"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog elimina */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => !actionLoading && setDeleteDialog({ open, type: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Elimina documento</DialogTitle>
            <DialogDescription>
              Scegli l'opzione desiderata.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <RadioGroup
              value={deleteDialog.type || "program"}
              onValueChange={(val) => setDeleteDialog((prev) => ({ ...prev, type: val as "delete" | "program" }))}
              className="space-y-2"
            >
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="program" id="del-program" />
                <div>
                  <Label htmlFor="del-program" className="font-medium">Sposta nel cestino</Label>
                  <p className="text-sm text-muted-foreground">Eliminazione programmata, verrà cancellato dopo 7 giorni.</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="delete" id="del-permanent" />
                <div>
                  <Label htmlFor="del-permanent" className="font-medium text-destructive">Elimina definitivamente</Label>
                  <p className="text-sm text-muted-foreground">Azione irreversibile.</p>
                </div>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, type: null })} disabled={actionLoading}>
              Annulla
            </Button>
            <Button
              variant={deleteDialog.type === "delete" ? "destructive" : "default"}
              onClick={handleDeleteAction}
              disabled={actionLoading || !deleteDialog.type}
            >
              {actionLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : deleteDialog.type === "delete" ? (
                "Elimina definitivamente"
              ) : (
                "Sposta nel cestino"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog ripristina */}
      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ripristina documento</DialogTitle>
            <DialogDescription>
              Scegli il nuovo stato per il documento ripristinato.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="restore-status" className="text-sm font-medium">Nuovo stato</Label>
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
            <Button variant="outline" onClick={() => setRestoreDialogOpen(false)} disabled={actionLoading}>
              Annulla
            </Button>
            <Button onClick={handleRestore} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Ripristina"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}