import { useState, useRef, useEffect, useCallback } from "react";
import {
  Loader2,
  Upload,
  File,
  X,
  Search,
  Eye,
  Trash2,
  Clock,
  MoreHorizontal,
  Archive,
  Inbox,
  RefreshCw,
  EyeOff,
  CheckCircle,
  RotateCcw,
  Filter,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { documentAdminApi } from "@/app/api/documentAdmin";
import { uploadFileToStorage } from "@/auth/uploadStorage";
import { useNavigate } from "react-router";
import { addDays, differenceInDays } from "date-fns";

interface ArchivioListProps {
  condominiumId: string;
}

interface Document {
  id: string;
  originalName: string;
  contentType: string;
  size: number;
  status: "DRAFT" | "ACTIVE" | "DELETED";
  versioningEnabled: boolean;
  currentVersion: number;
  deletedAt?: string;
}

const CONTENT_TYPE_OPTIONS = [
  { label: "Tutti i tipi", value: "" },
  { label: "PDF", value: "application/pdf" },
  { label: "JPEG", value: "image/jpeg" },
  { label: "PNG", value: "image/png" },
  { label: "Word", value: "application/msword" },
  { label: "Excel", value: "application/vnd.ms-excel" },
  { label: "PowerPoint", value: "application/vnd.ms-powerpoint" },
  { label: "TXT", value: "text/plain" },
];

type ViewMode = "active" | "deleted";

export function ArchivioList({ condominiumId }: ArchivioListProps) {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("active");
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filtri compatti
  const [filters, setFilters] = useState({
    originalName: "",
    contentType: "",
    statusFilter: "all",
    versioningEnabled: undefined as boolean | undefined,
  });
  const [queryParams, setQueryParams] = useState({
    page: 0,
    size: 10,
    sortBy: "createdAt",
    ascending: false,
  });

  // Upload state
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [versioningEnabled, setVersioningEnabled] = useState(false);
  const [documentStatus, setDocumentStatus] = useState<"DRAFT" | "ACTIVE">("DRAFT");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<
    "idle" | "getting-url" | "uploading-to-storage" | "confirming"
  >("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selezione e azioni bulk
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDialog, setBulkDialog] = useState<{ open: boolean; type: "delete" | "program" | null }>({
    open: false,
    type: null,
  });
  const [bulkLoading, setBulkLoading] = useState(false);

  // Azioni singole
  const [singleActionDialog, setSingleActionDialog] = useState<{
    open: boolean;
    type: "delete" | "program" | null;
    documentId: string | null;
  }>({ open: false, type: null, documentId: null });
  const [singleActionLoading, setSingleActionLoading] = useState(false);

  // Stato per cambio stato tramite dialog
  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    documentId: string | null;
  }>({ open: false, documentId: null });
  const [statusDialogValue, setStatusDialogValue] = useState<"DRAFT" | "ACTIVE">("DRAFT");
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  // ========== UTILITY PER IL NOME DOCUMENTO ==========
  const sanitizeName = (name: string) => name.replace(/\./g, "");

  const getBaseNameWithoutExtension = (fileName: string) => {
    const lastDotIndex = fileName.lastIndexOf(".");
    const base = lastDotIndex > -1 ? fileName.substring(0, lastDotIndex) : fileName;
    return sanitizeName(base);
  };
  // ===================================================

  // Fetch
  const fetchDocuments = useCallback(
    async (params: typeof queryParams, mode: ViewMode, showLoading = true) => {
      if (showLoading) setLoading(true);
      setError(null);
      try {
        const { page, size, sortBy, ascending } = params;
        const searchParams: any = {
          page,
          size,
          sortBy,
          ascending,
          originalName: filters.originalName || undefined,
          contentType: filters.contentType || undefined,
          versioningEnabled: filters.versioningEnabled,
        };

        if (mode === "deleted") {
          searchParams.status = "DELETED";
        } else {
          if (filters.statusFilter !== "all") {
            searchParams.status = filters.statusFilter;
          }
        }

        const response = await documentAdminApi.fetch(condominiumId, searchParams);
        let data = response.data || [];
        if (mode === "active") {
          data = data.filter((doc: Document) => doc.status !== "DELETED");
        }
        setDocuments(data);
        setTotalElements(response.totalElements || 0);
        setTotalPages(response.totalPages || 0);
        setSelectedIds([]);
      } catch (err: any) {
        console.error("Errore nel fetch dei documenti", err);
        const msg = err?.response?.data?.message || "Errore nel caricamento dei documenti";
        setError(msg);
        toast.error(msg);
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [condominiumId, filters]
  );

  useEffect(() => {
    fetchDocuments(queryParams, viewMode);
  }, [fetchDocuments, queryParams, viewMode]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDocuments(queryParams, viewMode, true);
    setRefreshing(false);
    toast.success("Elenco aggiornato");
  };

  const handleSearch = () => {
    setQueryParams((prev) => ({ ...prev, page: 0 }));
  };

  const handleReset = () => {
    setFilters({
      originalName: "",
      contentType: "",
      statusFilter: "all",
      versioningEnabled: undefined,
    });
    setQueryParams((prev) => ({ ...prev, page: 0 }));
  };

  // Paginazione
  const goToPage = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setQueryParams((prev) => ({ ...prev, page }));
    }
  };
  
  const handlePageSizeChange = (size: number) => {
    setQueryParams((prev) => ({ ...prev, size, page: 0 }));
  };

  // Upload handlers
  const resetForm = () => {
    setSelectedFile(null);
    setDocumentName("");
    setVersioningEnabled(false);
    setDocumentStatus("DRAFT");
    setUploadStep("idle");
    setIsUploading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!documentName) {
        setDocumentName(getBaseNameWithoutExtension(file.name));
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadStep("getting-url");
    try {
      const file = selectedFile;
      const extension = file.name.split(".").pop() || "";
      const finalName = documentName.trim() || getBaseNameWithoutExtension(file.name);

      const payload = {
        versioningEnabled,
        originalFileName: finalName,
        size: file.size,
        contentType: file.type || "application/octet-stream",
        extension,
        status: documentStatus,
      };

      const uploadResponse = await documentAdminApi.upload(payload, condominiumId);
      const { uploadUrl, documentVersionId } = uploadResponse.data;

      setUploadStep("uploading-to-storage");
      await uploadFileToStorage(file, uploadUrl);

      setUploadStep("confirming");
      await documentAdminApi.confirmUpload(condominiumId, documentVersionId);

      await fetchDocuments(queryParams, viewMode);
      toast.success("Documento caricato con successo!");
      resetForm();
      setUploadDialogOpen(false);
    } catch (error: any) {
      console.error("Errore durante l'upload", error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Si è verificato un errore. Riprova più tardi.";
      toast.error(`Errore: ${errorMsg}`);
      setUploadStep("idle");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open && !isUploading) resetForm();
    setUploadDialogOpen(open);
  };

  // Selezione multipla
  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(documents.map((d) => d.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((i) => i !== id)));
  };

  // Azioni bulk
  const openBulkDialog = (type: "delete" | "program") => {
    if (selectedIds.length === 0) return;
    if (type === "program" && viewMode === "deleted") return;
    setBulkDialog({ open: true, type });
  };

  const handleBulkAction = async () => {
    if (!bulkDialog.type || selectedIds.length === 0) return;
    setBulkLoading(true);
    try {
      if (bulkDialog.type === "delete") {
        await documentAdminApi.bulkDeletion(condominiumId, selectedIds);
        toast.success(`${selectedIds.length} documenti eliminati definitivamente.`);
      } else {
        await documentAdminApi.bulkProgramDeletion(condominiumId, selectedIds);
        toast.success(`${selectedIds.length} documenti programmati per l'eliminazione.`);
      }
      setSelectedIds([]);
      await fetchDocuments(queryParams, viewMode);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Errore durante l'operazione bulk.");
    } finally {
      setBulkLoading(false);
      setBulkDialog({ open: false, type: null });
    }
  };

  // Azioni singole
  const openSingleActionDialog = (type: "delete" | "program", documentId: string) => {
    const doc = documents.find((d) => d.id === documentId);
    if (doc?.status === "DELETED" && type === "program") return;
    setSingleActionDialog({ open: true, type, documentId });
  };

  const handleSingleAction = async () => {
    const { type, documentId } = singleActionDialog;
    if (!type || !documentId) return;
    setSingleActionLoading(true);
    try {
      if (type === "delete") {
        await documentAdminApi.deleteDocument(condominiumId, documentId);
        toast.success("Documento eliminato definitivamente.");
      } else {
        await documentAdminApi.programDeletion(condominiumId, documentId);
        toast.success("Documento programmato per l'eliminazione.");
      }
      await fetchDocuments(queryParams, viewMode);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Errore durante l'operazione.");
    } finally {
      setSingleActionLoading(false);
      setSingleActionDialog({ open: false, type: null, documentId: null });
    }
  };

  // Cambio stato tramite dialog
  const openStatusDialog = (docId: string, currentStatus: string) => {
    setStatusDialogValue(currentStatus as "DRAFT" | "ACTIVE");
    setStatusDialog({ open: true, documentId: docId });
  };

  const handleStatusChangeFromDialog = async () => {
    if (!statusDialog.documentId) return;
    setStatusUpdatingId(statusDialog.documentId);
    try {
      await documentAdminApi.changeStatus(condominiumId, statusDialog.documentId, statusDialogValue);
      toast.success(`Stato aggiornato a ${statusDialogValue === "ACTIVE" ? "Attivo" : "Bozza"}`);
      await fetchDocuments(queryParams, viewMode);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Errore durante il cambio stato.");
    } finally {
      setStatusUpdatingId(null);
      setStatusDialog({ open: false, documentId: null });
    }
  };

  // Utility
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const goToDetail = (documentId: string) => {
    navigate(`/admin/condomini/${condominiumId}/documenti/${documentId}`);
  };

  const getDeletionCountdown = (deletedAt?: string) => {
    if (!deletedAt) return null;
    const deletionDate = addDays(new Date(deletedAt), 7);
    const daysLeft = differenceInDays(deletionDate, new Date());
    if (daysLeft < 0) return "Scaduto";
    if (daysLeft === 0) return "Oggi";
    return `${daysLeft} giorno${daysLeft !== 1 ? "i" : ""}`;
  };

  // Badge stato
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <FolderOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Archivio documenti</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {totalElements} documenti totali
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={(val) => val && setViewMode(val as ViewMode)}
                size="sm"
                className="border rounded-md p-0.5 bg-muted/30"
              >
                <ToggleGroupItem
                  value="active"
                  className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground rounded-sm gap-1"
                >
                  <Inbox className="h-4 w-4" />
                  <span className="hidden sm:inline">Documenti</span>
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="deleted"
                  className="data-[state=on]:bg-destructive data-[state=on]:text-destructive-foreground rounded-sm gap-1"
                >
                  <Archive className="h-4 w-4" />
                  <span className="hidden sm:inline">Cestino</span>
                </ToggleGroupItem>
              </ToggleGroup>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtri
                {showFilters && <X className="h-4 w-4" />}
              </Button>
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
              <Dialog open={uploadDialogOpen} onOpenChange={handleDialogOpenChange}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Carica
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[520px]">
                  <DialogHeader>
                    <DialogTitle>Carica un nuovo documento</DialogTitle>
                    <DialogDescription>Seleziona il file e imposta le opzioni.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-3 py-2">
                    <div
                      className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Input
                        ref={fileInputRef}
                        id="file-upload"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      {selectedFile ? (
                        <div className="flex items-center justify-center gap-2 text-sm flex-wrap">
                          <File className="h-5 w-5 text-primary" />
                          <span className="font-medium truncate max-w-[200px]">
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
                              setDocumentName("");
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

                    <div className="space-y-2">
                      <Label htmlFor="doc-name" className="text-sm font-medium">
                        Nome documento
                      </Label>
                      <Input
                        id="doc-name"
                        value={documentName}
                        onChange={(e) => {
                          const sanitized = sanitizeName(e.target.value);
                          setDocumentName(sanitized);
                        }}
                        placeholder="Lascia vuoto per usare il nome del file"
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Stato iniziale</Label>
                      <RadioGroup
                        value={documentStatus}
                        onValueChange={(value) => setDocumentStatus(value as "DRAFT" | "ACTIVE")}
                        className="space-y-2"
                      >
                        <div className="flex items-start space-x-3 p-3 rounded-lg border">
                          <RadioGroupItem value="DRAFT" id="draft" className="mt-0.5" />
                          <div>
                            <Label htmlFor="draft" className="font-medium cursor-pointer flex items-center gap-2">
                              <EyeOff className="h-4 w-4" />
                              Bozza
                            </Label>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Visibile solo a te.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 rounded-lg border">
                          <RadioGroupItem value="ACTIVE" id="active" className="mt-0.5" />
                          <div>
                            <Label htmlFor="active" className="font-medium cursor-pointer flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              Attivo
                            </Label>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Visibile a tutti i membri autorizzati.
                            </p>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="versioning"
                          checked={versioningEnabled}
                          onCheckedChange={(checked) => setVersioningEnabled(!!checked)}
                        />
                        <Label htmlFor="versioning" className="text-sm font-medium">
                          Abilita versioning
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground pl-6">
                        Se abilitato, potrai caricare nuove versioni. Se disabilitato,
                        non potrai più abilitarlo.
                      </p>
                    </div>

                    {isUploading && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>
                          {uploadStep === "getting-url" && "Preparazione..."}
                          {uploadStep === "uploading-to-storage" && "Caricamento su storage..."}
                          {uploadStep === "confirming" && "Conferma del documento..."}
                        </span>
                      </div>
                    )}
                  </div>

                  <DialogFooter className="gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setUploadDialogOpen(false)}
                      disabled={isUploading}
                    >
                      Annulla
                    </Button>
                    <Button
                      onClick={handleUpload}
                      disabled={!selectedFile || isUploading}
                      className="gap-2"
                    >
                      {isUploading ? (
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
          </div>
        </CardHeader>

        {/* Filtri espandibili */}
        {showFilters && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Nome</Label>
                <Input
                  placeholder="Cerca per nome..."
                  value={filters.originalName}
                  onChange={(e) => setFilters((prev) => ({ ...prev, originalName: e.target.value }))}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tipo</Label>
                <Select
                  value={filters.contentType}
                  onValueChange={(val) => setFilters((prev) => ({ ...prev, contentType: val }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Tutti i tipi" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Versioning</Label>
                <Select
                  value={
                    filters.versioningEnabled === undefined
                      ? "all"
                      : String(filters.versioningEnabled)
                  }
                  onValueChange={(val) =>
                    setFilters((prev) => ({
                      ...prev,
                      versioningEnabled: val === "all" ? undefined : val === "true",
                    }))
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Tutti" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti</SelectItem>
                    <SelectItem value="true">Abilitato</SelectItem>
                    <SelectItem value="false">Disabilitato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {viewMode === "active" && (
                <div className="space-y-1">
                  <Label className="text-xs">Stato</Label>
                  <Select
                    value={filters.statusFilter}
                    onValueChange={(val) => setFilters((prev) => ({ ...prev, statusFilter: val }))}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Tutti" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti</SelectItem>
                      <SelectItem value="DRAFT">Bozza</SelectItem>
                      <SelectItem value="ACTIVE">Attivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={handleSearch} className="gap-2">
                <Search className="h-4 w-4" /> Cerca
              </Button>
              <Button size="sm" variant="outline" onClick={handleReset} className="gap-2">
                <X className="h-4 w-4" /> Reset
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Barra selezione */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between bg-primary/5 border border-primary/20 p-3 rounded-lg gap-2">
          <span className="text-sm font-medium">
            {selectedIds.length} selezionati
          </span>
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="destructive"
              onClick={() => openBulkDialog("delete")}
              disabled={bulkLoading}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Elimina
            </Button>
            {viewMode !== "deleted" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => openBulkDialog("program")}
                disabled={bulkLoading}
                className="gap-2"
              >
                <Clock className="h-4 w-4" />
                Programma
              </Button>
            )}
            {bulkLoading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
          </div>
        </div>
      )}

      {/* Tabella */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selectedIds.length === documents.length && documents.length > 0}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Seleziona tutti"
                    />
                  </TableHead>
                  <TableHead className="font-semibold">Nome</TableHead>
                  <TableHead className="font-semibold hidden sm:table-cell">Dimensione</TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">Versione</TableHead>
                  <TableHead className="font-semibold">Stato</TableHead>
                  {viewMode === "deleted" && <TableHead className="font-semibold hidden lg:table-cell">Eliminazione</TableHead>}
                  <TableHead className="font-semibold text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={viewMode === "deleted" ? 7 : 6}>
                        <Skeleton className="h-12 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : documents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={viewMode === "deleted" ? 7 : 6} className="text-center py-12">
                      {viewMode === "deleted" ? (
                        <Archive className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                      ) : (
                        <FolderOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                      )}
                      <p className="text-muted-foreground font-medium">
                        {viewMode === "deleted"
                          ? "Nessun documento nel cestino"
                          : "Nessun documento archiviato"}
                      </p>
                      <p className="text-sm text-muted-foreground/70 mt-1">
                        {viewMode === "active" ? "Carica un nuovo documento per iniziare" : "I documenti eliminati appariranno qui"}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  documents.map((doc) => (
                    <TableRow
                      key={doc.id}
                      className={`cursor-pointer hover:bg-muted/50 transition-colors ${doc.status === "DELETED" ? "bg-muted/20" : ""}`}
                      onClick={() => goToDetail(doc.id)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.includes(doc.id)}
                          onCheckedChange={(checked) =>
                            toggleSelect(doc.id, !!checked)
                          }
                          aria-label={`Seleziona ${doc.originalName}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4 text-primary shrink-0" />
                          <span className="truncate max-w-[150px] sm:max-w-[250px]">
                            {doc.originalName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {formatSize(doc.size)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        v{doc.currentVersion}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {doc.status === "DELETED" ? (
                          <StatusBadge status="DELETED" />
                        ) : (
                          <button
                            className="focus:outline-none"
                            onClick={() => openStatusDialog(doc.id, doc.status)}
                          >
                            <StatusBadge status={doc.status} />
                          </button>
                        )}
                      </TableCell>
                      {viewMode === "deleted" && (
                        <TableCell className="hidden lg:table-cell">
                          {doc.deletedAt ? (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Tra {getDeletionCountdown(doc.deletedAt)}
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      )}
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => goToDetail(doc.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              {doc.status !== "DELETED" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => openStatusDialog(doc.id, doc.status)}
                                    className="gap-2"
                                  >
                                    <RotateCcw className="h-4 w-4" />
                                    Cambia stato
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => openSingleActionDialog("program", doc.id)}
                                    className="gap-2"
                                  >
                                    <Clock className="h-4 w-4" />
                                    Programma eliminazione
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem
                                onClick={() => openSingleActionDialog("delete", doc.id)}
                                className="gap-2 text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                                Elimina definitivamente
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Paginazione */}
      {totalPages > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-sm text-muted-foreground">
            Mostrati <span className="font-medium">{documents.length}</span> di{" "}
            <span className="font-medium">{totalElements}</span> documenti
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(queryParams.page - 1)}
              disabled={queryParams.page === 0}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Precedente</span>
            </Button>
            <span className="text-sm px-2 whitespace-nowrap">
              Pagina <span className="font-medium">{queryParams.page + 1}</span> di{" "}
              <span className="font-medium">{totalPages}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(queryParams.page + 1)}
              disabled={queryParams.page === totalPages - 1}
              className="gap-1"
            >
              <span className="hidden sm:inline">Successiva</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="pageSize" className="text-xs whitespace-nowrap">
              Righe per pagina:
            </Label>
            <Select
              value={String(queryParams.size)}
              onValueChange={(val) => handlePageSizeChange(Number(val))}
            >
              <SelectTrigger className="h-8 w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Dialog per azioni bulk */}
      <Dialog
        open={bulkDialog.open}
        onOpenChange={(open) => !bulkLoading && setBulkDialog({ open, type: null })}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {bulkDialog.type === "delete" ? "Eliminazione definitiva" : "Programmazione eliminazione"}
            </DialogTitle>
            <DialogDescription>
              {bulkDialog.type === "delete"
                ? `Sei sicuro di voler eliminare definitivamente ${selectedIds.length} documento/i? Questa azione non è reversibile.`
                : `Sei sicuro di voler programmare l'eliminazione di ${selectedIds.length} documento/i?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkDialog({ open: false, type: null })}
              disabled={bulkLoading}
            >
              Annulla
            </Button>
            <Button
              variant={bulkDialog.type === "delete" ? "destructive" : "default"}
              onClick={handleBulkAction}
              disabled={bulkLoading}
              className="gap-2"
            >
              {bulkLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : bulkDialog.type === "delete" ? (
                <Trash2 className="h-4 w-4" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              {bulkDialog.type === "delete" ? "Elimina" : "Programma"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog per azioni singole */}
      <Dialog
        open={singleActionDialog.open}
        onOpenChange={(open) =>
          !singleActionLoading &&
          setSingleActionDialog({ open, type: null, documentId: null })
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {singleActionDialog.type === "delete" ? "Eliminazione definitiva" : "Programmazione eliminazione"}
            </DialogTitle>
            <DialogDescription>
              {singleActionDialog.type === "delete"
                ? "Sei sicuro di voler eliminare definitivamente questo documento?"
                : "Sei sicuro di voler programmare l'eliminazione di questo documento?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setSingleActionDialog({ open: false, type: null, documentId: null })
              }
              disabled={singleActionLoading}
            >
              Annulla
            </Button>
            <Button
              variant={singleActionDialog.type === "delete" ? "destructive" : "default"}
              onClick={handleSingleAction}
              disabled={singleActionLoading}
              className="gap-2"
            >
              {singleActionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : singleActionDialog.type === "delete" ? (
                <Trash2 className="h-4 w-4" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              {singleActionDialog.type === "delete" ? "Elimina" : "Programma"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog per cambio stato */}
      <Dialog
        open={statusDialog.open}
        onOpenChange={(open) => !statusUpdatingId && setStatusDialog({ open, documentId: null })}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cambia stato del documento</DialogTitle>
            <DialogDescription>Scegli il nuovo stato.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <RadioGroup
              value={statusDialogValue}
              onValueChange={(val) => setStatusDialogValue(val as "DRAFT" | "ACTIVE")}
              className="space-y-3"
            >
              <div className="flex items-start space-x-3 p-3 rounded-lg border">
                <RadioGroupItem value="DRAFT" id="sd-draft" />
                <div>
                  <Label htmlFor="sd-draft" className="font-medium flex items-center gap-2">
                    <EyeOff className="h-4 w-4" />
                    Bozza
                  </Label>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-lg border">
                <RadioGroupItem value="ACTIVE" id="sd-active" />
                <div>
                  <Label htmlFor="sd-active" className="font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Attivo
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusDialog({ open: false, documentId: null })}
              disabled={!!statusUpdatingId}
            >
              Annulla
            </Button>
            <Button onClick={handleStatusChangeFromDialog} disabled={!!statusUpdatingId} className="gap-2">
              {statusUpdatingId ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Aggiorna
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}