// src/pages/private/DocumentDetailPage.tsx
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
  Globe,
  Lock,
  ChevronLeft,
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
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { documentAdminApi } from "@/app/api/documentAdmin";
import { uploadFileToStorage } from "@/auth/uploadStorage";
import { format, addDays, differenceInDays } from "date-fns";
import { it } from "date-fns/locale";
import { useNavigate, useParams } from "react-router";
import { condominiumMemberApi, type FetchMembersResponseDto } from "@/app/api/condominiumMember";
import { downloadFileFromStorage } from "@/auth/downloadFileFromStorage";
import { Checkbox } from "@/components/ui/checkbox";

interface DocumentDetail {
  id: string;
  versioningEnabled: boolean;
  currentVersion: number;
  createdAt: string;
  status: "DRAFT" | "ACTIVE" | "DELETED";
  deletedAt?: string;
  publicForCondominium?: boolean;
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
  CONDO_ADMIN: "Amministratore",
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

  const [visibility, setVisibility] = useState<VisibilityEntry[]>([]);
  const [visibilityLoading, setVisibilityLoading] = useState(false);

  const [visibilityDialogOpen, setVisibilityDialogOpen] = useState(false);
  const [allMembers, setAllMembers] = useState<FetchMembersResponseDto[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  const [selectedToAdd, setSelectedToAdd] = useState<Set<string>>(new Set());
  const [selectedToRemove, setSelectedToRemove] = useState<Set<string>>(new Set());
  const [isPublicForCondominium, setIsPublicForCondominium] = useState<boolean>(false);

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
      if (response.data.publicForCondominium !== undefined) {
        setIsPublicForCondominium(response.data.publicForCondominium);
      }
    } catch (err: any) {
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
    try {
      const response = await documentAdminApi.fetchVersions(condominiumId, documentId, {
        page: 0,
        size: 100,
        sortBy: "version",
        ascending: false,
      });
      setVersions(response.data || []);
    } catch (err: any) {
      toast.error("Errore nel caricamento delle versioni");
    } finally {
      setVersionsLoading(false);
    }
  }, [condominiumId, documentId]);

  const fetchVisibility = useCallback(async () => {
    if (!condominiumId || !documentId) return;
    setVisibilityLoading(true);
    try {
      const response = await documentAdminApi.fetchVisibility(condominiumId, documentId, {
        page: 0,
        size: 100,
        sortBy: "createdAt",
        ascending: true,
      });
      setVisibility(response.data || []);
      if (response.publicForCondominium !== undefined) {
        setIsPublicForCondominium(response.publicForCondominium);
      }
    } catch (err: any) {
      toast.error("Errore nel caricamento degli accessi");
    } finally {
      setVisibilityLoading(false);
    }
  }, [condominiumId, documentId]);

  const loadMembers = useCallback(async () => {
    if (!condominiumId) return;
    setMembersLoading(true);
    try {
      const response = await condominiumMemberApi.fetchMembers(
        { size: 1000, page: 0 },
        condominiumId
      );
      setAllMembers(response.data || []);
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

  const handleTogglePublic = async () => {
    if (!condominiumId || !documentId) return;
    const newValue = !isPublicForCondominium;
    setActionLoading(true);
    try {
      await documentAdminApi.updateVisibility(condominiumId, documentId, {
        addMembers: [],
        removeMembers: [],
        isPublicForCondominium: newValue,
      });
      setIsPublicForCondominium(newValue);
      toast.success(newValue ? "Documento reso pubblico" : "Documento reso privato");
      await fetchVisibility();
      await fetchDetail();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Errore durante l'aggiornamento");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveVisibility = async () => {
    if (!condominiumId || !documentId) return;
    const userIdToMemberId = new Map(allMembers.map((m) => [m.id, m.memberId]));
    const addMemberIds = Array.from(selectedToAdd)
      .map((userId) => userIdToMemberId.get(userId))
      .filter((id): id is string => id !== undefined);
    const removeMemberIds = Array.from(selectedToRemove)
      .filter((userId) => {
        const member = allMembers.find((m) => m.id === userId);
        return member && member.role !== "CONDO_ADMIN";
      })
      .map((userId) => userIdToMemberId.get(userId))
      .filter((id): id is string => id !== undefined);

    if (addMemberIds.length === 0 && removeMemberIds.length === 0) {
      toast.info("Nessuna modifica");
      setVisibilityDialogOpen(false);
      return;
    }

    setActionLoading(true);
    try {
      await documentAdminApi.updateVisibility(condominiumId, documentId, {
        addMembers: addMemberIds,
        removeMembers: removeMemberIds,
        isPublicForCondominium: isPublicForCondominium,
      });
      toast.success("Visibilità aggiornata con successo");
      await fetchVisibility();
      await fetchDetail();
      setVisibilityDialogOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Errore durante l'aggiornamento");
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
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
    toast.success("Dettaglio aggiornato");
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

  const handleDownload = async (versionId?: string) => {
    if (!condominiumId || !documentId) return;
    setDownloading(true);
    try {
      let requestedVersion: number | undefined = undefined;
      if (versionId) {
        const version = versions.find((v) => v.idVersion === versionId);
        if (version) requestedVersion = version.version;
      }
      const response = await documentAdminApi.download(condominiumId, documentId, requestedVersion);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setVersionName(file.name.replace(/\.[^.]+$/, ''));
    }
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
      setNewVersionDialogOpen(false);
      setSelectedFile(null);
      setVersionName("");
      await fetchDetail();
      await fetchVersions();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Errore durante l'upload");
    } finally {
      setIsUploadingVersion(false);
      setUploadStep("idle");
    }
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
    const daysLeft = Math.ceil(differenceInDays(deletionDate, new Date()));
    if (daysLeft < 0) return "Scaduto";
    if (daysLeft === 0) return "Oggi";
    return `${daysLeft} ${daysLeft === 1 ? "giorno" : "giorni"}`;
  };

  const getDeletionDate = () => {
    if (!document?.deletedAt) return null;
    const deletionDate = addDays(new Date(document.deletedAt), 7);
    return format(deletionDate, "dd MMM yyyy HH:mm", { locale: it });
  };

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = ["bg-blue-500", "bg-purple-500", "bg-green-500", "bg-orange-500", "bg-pink-500", "bg-indigo-500", "bg-rose-500", "bg-cyan-500"];
    return colors[name.length % colors.length];
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const config = {
      ACTIVE: { variant: "default" as const, icon: <CheckCircle className="h-3 w-3" /> },
      DRAFT: { variant: "secondary" as const, icon: <EyeOff className="h-3 w-3" /> },
      DELETED: { variant: "destructive" as const, icon: <Archive className="h-3 w-3" /> },
    };
    const { variant, icon } = config[status as keyof typeof config] || config.DRAFT;
    return (
      <Badge variant={variant} className="gap-1">
        {icon}
        {status === "ACTIVE" ? "Attivo" : status === "DRAFT" ? "Bozza" : "Eliminato"}
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

  if (error || !document) {
    return (
      <div className="text-center py-12">
        <Info className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground font-medium mb-4">{error || "Documento non trovato"}</p>
        <Button variant="outline" onClick={goBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Torna indietro
        </Button>
      </div>
    );
  }

  const isDeleted = document.status === "DELETED";
  const versionCount = versions.length > 0 ? versions.length : (document.versioningEnabled ? 0 : 1);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-8xl">
      {isDeleted && (
        <Alert className="border-orange-500 bg-orange-50 text-orange-800 dark:bg-orange-950/30 dark:border-orange-700 dark:text-orange-300">
          <Timer className="h-4 w-4" />
          <AlertTitle>Documento nel cestino</AlertTitle>
          <AlertDescription>
            Verrà eliminato definitivamente il <strong>{getDeletionDate()}</strong> (tra {getDeletionCountdown()}).
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4">

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2 mt-1">
              <File className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">
                {versionsLoading ? (
                  <Skeleton className="h-7 w-48 sm:w-64" />
                ) : versions.length > 0 ? (
                  versions[versions.length - 1].originalName
                ) : (
                  "Documento"
                )}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <button
                  className="focus:outline-none"
                  onClick={() => setStatusDialogOpen(true)}
                  disabled={isDeleted}
                >
                  <StatusBadge status={document.status} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              onClick={() => handleDownload()}
              disabled={downloading}
              className="gap-2"
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Scarica
            </Button>

            {!isDeleted && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <MoreHorizontal className="h-4 w-4" />
                    Azioni
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => setDeleteDialog({ open: true, type: "program" })}
                    className="gap-2"
                  >
                    <Archive className="h-4 w-4" />
                    Sposta nel cestino
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeleteDialog({ open: true, type: "delete" })}
                    className="gap-2 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Elimina definitivamente
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {isDeleted && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRestoreDialogOpen(true)}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Ripristina
              </Button>
            )}

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
          </div>
        </div>
      </div>

      {/* Info rapide */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-2">
                <GitBranch className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Versioni</p>
                <p className="text-lg font-bold">{versionCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-2">
                <HardDrive className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Versione corrente</p>
                <p className="text-lg font-bold">v{document.currentVersion}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-2">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Accesso</p>
                <p className="text-lg font-bold">{visibility.length} utenti</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-2">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Creato</p>
                <p className="text-sm font-medium">{formatDate(document.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isPublicForCondominium && (
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
          <Globe className="h-4 w-4" />
          Documento pubblico per tutto il condominio
        </div>
      )}

      {/* Tabs */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <Tabs defaultValue="versions" className="w-full">
            <TabsList className="w-full sm:w-auto flex-wrap h-auto gap-1">
              <TabsTrigger value="versions" className="flex items-center gap-2 flex-1 sm:flex-none justify-center">
                <GitBranch className="h-4 w-4" />
                Versioni
                <Badge variant="secondary" className="ml-1 text-xs">
                  {versionCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="permissions" className="flex items-center gap-2 flex-1 sm:flex-none justify-center">
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
                  className="gap-2"
                  onClick={() => setNewVersionDialogOpen(true)}
                >
                  <Upload className="h-4 w-4" />
                  Carica nuova versione
                </Button>
              )}
              {versionsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : versions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <GitBranch className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Nessuna versione disponibile</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {versions.map((v) => {
                    const isCurrent = v.version === document.currentVersion;
                    return (
                      <div
                        key={v.idVersion}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-all ${isCurrent ? "bg-primary/5 border-primary/30" : "bg-card hover:bg-muted/30"
                          }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${isCurrent ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                              }`}
                          >
                            v{v.version}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium truncate max-w-[150px] sm:max-w-[250px]">{v.originalName}</span>
                              {isCurrent && (
                                <Badge variant="default" className="text-[10px]">
                                  Corrente
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                              <span>{formatSize(v.size)}</span>
                              <span>•</span>
                              <span>{formatDate(v.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => handleDownload(v.idVersion)}
                          disabled={downloading}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h3 className="text-sm font-medium">Utenti con accesso</h3>
                <Button size="sm" variant="outline" onClick={handleOpenVisibilityDialog} className="gap-2">
                  <Users className="h-4 w-4" />
                  Gestisci accesso
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-3">
                  {isPublicForCondominium ? (
                    <Globe className="h-5 w-5 text-green-600" />
                  ) : (
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {isPublicForCondominium ? "Pubblico per tutto il condominio" : "Visibilità limitata"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isPublicForCondominium ? "Tutti i membri possono vedere questo documento" : "Solo gli utenti selezionati possono vedere questo documento"}
                    </p>
                  </div>
                </div>
                <Button
                  variant={isPublicForCondominium ? "default" : "outline"}
                  size="sm"
                  onClick={handleTogglePublic}
                  disabled={actionLoading}
                  className="gap-2 shrink-0"
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isPublicForCondominium ? (
                    "Rendi privato"
                  ) : (
                    "Rendi pubblico"
                  )}
                </Button>
              </div>

              <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertTitle className="text-blue-800 dark:text-blue-300 text-sm font-medium">
                  Accesso garantito
                </AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-400 text-xs">
                  Gli Amministratori e i Sub-amministratori hanno sempre accesso a questo documento.
                </AlertDescription>
              </Alert>

              {visibilityLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : visibility.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Nessun utente aggiuntivo con accesso</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {visibility.map((item) => {
                    const fullName = `${item.firstName} ${item.lastName}`.trim();
                    const roleLabel = roleMap[item.role] || item.role;
                    return (
                      <div
                        key={item.memberId}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/30 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className={`text-white ${getAvatarColor(fullName)}`}>
                              {getInitials(fullName || "Utente")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{fullName || "Utente senza nome"}</p>
                            <Badge variant="outline" className="text-[10px] mt-0.5">
                              {roleLabel}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-green-600">
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
        </CardContent>
      </Card>

      {/* Dialog gestione visibilità */}
      <Dialog open={visibilityDialogOpen} onOpenChange={setVisibilityDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Gestisci accesso al documento</DialogTitle>
            <DialogDescription>
              Aggiungi o rimuovi utenti dall'accesso a questo documento.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-2">
              {isPublicForCondominium ? (
                <Globe className="h-4 w-4 text-green-600" />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
              <Label className="text-sm font-medium">
                {isPublicForCondominium ? "Pubblico per tutto il condominio" : "Visibilità limitata"}
              </Label>
            </div>
            <Switch
              checked={isPublicForCondominium}
              onCheckedChange={setIsPublicForCondominium}
            />
          </div>

          <Separator />

          {membersLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
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
                    return <p className="text-center py-8 text-muted-foreground">Tutti i membri hanno già accesso.</p>;
                  }
                  return notVisible.map((member) => {
                    const fullName = `${member.firstName} ${member.lastName}`.trim();
                    const checked = selectedToAdd.has(member.id);
                    return (
                      <div
                        key={member.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${checked ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                          }`}
                        onClick={() => toggleAdd(member.id)}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleAdd(member.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className={`text-white ${getAvatarColor(fullName)}`}>
                            {getInitials(fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{fullName}</p>
                          <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                        </div>
                      </div>
                    );
                  });
                })()}
              </TabsContent>

              <TabsContent value="remove" className="flex-1 overflow-y-auto py-4 space-y-2">
                {(() => {
                  const visibleUserIds = new Set(visibility.map((v) => v.userId));
                  const visibleMembers = allMembers.filter(
                    (m) => visibleUserIds.has(m.id) && m.role !== "CONDO_ADMIN"
                  );
                  if (visibleMembers.length === 0) {
                    return <p className="text-center py-8 text-muted-foreground">Nessun membro rimovibile.</p>;
                  }
                  return visibleMembers.map((member) => {
                    const fullName = `${member.firstName} ${member.lastName}`.trim();
                    const checked = selectedToRemove.has(member.id);
                    return (
                      <div
                        key={member.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${checked ? "border-destructive bg-destructive/5" : "hover:bg-muted/50"
                          }`}
                        onClick={() => toggleRemove(member.id)}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleRemove(member.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className={`text-white ${getAvatarColor(fullName)}`}>
                            {getInitials(fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{fullName}</p>
                          <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                        </div>
                      </div>
                    );
                  });
                })()}
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter className="mt-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {selectedToAdd.size} da aggiungere, {selectedToRemove.size} da rimuovere
            </div>
            <Button variant="outline" onClick={() => setVisibilityDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleSaveVisibility} disabled={actionLoading} className="gap-2">
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Salva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog nuova versione */}
      <Dialog open={newVersionDialogOpen} onOpenChange={setNewVersionDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Carica nuova versione</DialogTitle>
            <DialogDescription>
              Seleziona il file per la nuova versione.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition cursor-pointer"
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
                <div className="flex items-center justify-center gap-2 text-sm flex-wrap">
                  <File className="h-5 w-5 text-primary" />
                  <span className="font-medium truncate max-w-[200px]">{selectedFile.name}</span>
                  <span className="text-muted-foreground text-xs">({formatSize(selectedFile.size)})</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
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
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Clicca per selezionare un file</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="version-name" className="text-sm font-medium">Nome versione</Label>
              <Input
                id="version-name"
                value={versionName}
                onChange={(e) => setVersionName(e.target.value.replace(/\./g, ''))}
                placeholder="Lascia vuoto per usare il nome del file"
              />
            </div>

            {isUploadingVersion && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>
                  {uploadStep === "getting-url" && "Preparazione..."}
                  {uploadStep === "uploading-to-storage" && "Caricamento su storage..."}
                  {uploadStep === "confirming" && "Conferma..."}
                </span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewVersionDialogOpen(false)} disabled={isUploadingVersion}>
              Annulla
            </Button>
            <Button onClick={handleUploadNewVersion} disabled={!selectedFile || isUploadingVersion} className="gap-2">
              {isUploadingVersion ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Carica versione
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog cambio stato */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cambia stato</DialogTitle>
            <DialogDescription>Scegli il nuovo stato per il documento.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <RadioGroup
              value={tempStatus}
              onValueChange={(val) => setTempStatus(val as "DRAFT" | "ACTIVE")}
              className="space-y-3"
            >
              <div className="flex items-start space-x-3 p-3 rounded-lg border">
                <RadioGroupItem value="DRAFT" id="status-draft" />
                <div>
                  <Label htmlFor="status-draft" className="font-medium flex items-center gap-2">
                    <EyeOff className="h-4 w-4" /> Bozza
                  </Label>
                  <p className="text-sm text-muted-foreground mt-0.5">Visibile solo agli amministratori.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-lg border">
                <RadioGroupItem value="ACTIVE" id="status-active" />
                <div>
                  <Label htmlFor="status-active" className="font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" /> Attivo
                  </Label>
                  <p className="text-sm text-muted-foreground mt-0.5">Visibile a tutti gli autorizzati.</p>
                </div>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)} disabled={actionLoading}>
              Annulla
            </Button>
            <Button onClick={() => handleStatusChange(tempStatus)} disabled={actionLoading || tempStatus === document.status} className="gap-2">
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Aggiorna
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog elimina */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => !actionLoading && setDeleteDialog({ open, type: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Elimina documento</DialogTitle>
            <DialogDescription>Scegli l'opzione desiderata.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <RadioGroup
              value={deleteDialog.type || "program"}
              onValueChange={(val) => setDeleteDialog((prev) => ({ ...prev, type: val as "delete" | "program" }))}
              className="space-y-3"
            >
              <div className="flex items-start space-x-3 p-3 rounded-lg border">
                <RadioGroupItem value="program" id="del-program" />
                <div>
                  <Label htmlFor="del-program" className="font-medium flex items-center gap-2">
                    <Archive className="h-4 w-4" /> Sposta nel cestino
                  </Label>
                  <p className="text-sm text-muted-foreground mt-0.5">Verrà cancellato dopo 7 giorni.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-lg border border-destructive/30">
                <RadioGroupItem value="delete" id="del-permanent" />
                <div>
                  <Label htmlFor="del-permanent" className="font-medium text-destructive flex items-center gap-2">
                    <Trash2 className="h-4 w-4" /> Elimina definitivamente
                  </Label>
                  <p className="text-sm text-muted-foreground mt-0.5">Azione irreversibile.</p>
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
              className="gap-2"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : deleteDialog.type === "delete" ? <Trash2 className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
              {deleteDialog.type === "delete" ? "Elimina" : "Sposta nel cestino"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog ripristina */}
      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ripristina documento</DialogTitle>
            <DialogDescription>Scegli il nuovo stato per il documento ripristinato.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label className="text-sm font-medium">Nuovo stato</Label>
            <Select value={restoreStatus} onValueChange={(val) => setRestoreStatus(val as "DRAFT" | "ACTIVE")}>
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
            <Button onClick={handleRestore} disabled={actionLoading} className="gap-2">
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
              Ripristina
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}