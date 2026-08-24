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
import { documentAdminApi } from "@/app/api/documentAdmin";
import { uploadFileToStorage } from "@/auth/uploadStorage";
import { useNavigate } from "react-router";
import { formatDistanceToNow, addDays, differenceInDays } from "date-fns";
import { it } from "date-fns/locale";

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
  { label: "Tutti", value: "" },
  { label: "PDF", value: "application/pdf" },
  { label: "JPEG", value: "image/jpeg" },
  { label: "PNG", value: "image/png" },
  { label: "Word", value: "application/msword" },
  { label: "Excel", value: "application/vnd.ms-excel" },
  { label: "PowerPoint", value: "application/vnd.ms-powerpoint" },
  { label: "TXT", value: "text/plain" },
];

const DEFAULT_FILTERS = {
  originalName: "",
  contentType: "",
  status: "all",
  versioningEnabled: undefined as boolean | undefined,
  currentVersion: 0,
};

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

  const [queryParams, setQueryParams] = useState({
    filters: DEFAULT_FILTERS,
    page: 0,
    size: 10,
    sortBy: "createdAt",
    ascending: false,
  });
  const [filterValues, setFilterValues] = useState(DEFAULT_FILTERS);

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

  // Selezione e azioni
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDialog, setBulkDialog] = useState<{ open: boolean; type: "delete" | "program" | null }>({
    open: false,
    type: null,
  });
  const [bulkLoading, setBulkLoading] = useState(false);
  const [singleActionDialog, setSingleActionDialog] = useState<{
    open: boolean;
    type: "delete" | "program" | null;
    documentId: string | null;
  }>({ open: false, type: null, documentId: null });
  const [singleActionLoading, setSingleActionLoading] = useState(false);

  // Stato per cambio stato inline (per disabilitare il selettore durante l'operazione)
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  // Fetch
  const fetchDocuments = useCallback(
    async (params: typeof queryParams, mode: ViewMode, showLoading = true) => {
      if (showLoading) setLoading(true);
      setError(null);
      try {
        const { filters, page, size, sortBy, ascending } = params;
        const searchParams: any = {
          page,
          size,
          sortBy,
          ascending,
          originalName: filters.originalName || undefined,
          contentType: filters.contentType || undefined,
          versioningEnabled: filters.versioningEnabled,
          currentVersion: filters.currentVersion > 0 ? filters.currentVersion : undefined,
        };

        if (mode === "deleted") {
          searchParams.status = "DELETED";
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
    [condominiumId]
  );

  useEffect(() => {
    fetchDocuments(queryParams, viewMode);
  }, [fetchDocuments, queryParams, viewMode]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDocuments(queryParams, viewMode, true);
    setRefreshing(false);
    toast.info("Elenco aggiornato");
  };

  const handleSearch = () => {
    setQueryParams((prev) => ({
      ...prev,
      filters: filterValues,
      page: 0,
    }));
  };

  const handleReset = () => {
    setFilterValues(DEFAULT_FILTERS);
    setQueryParams((prev) => ({
      ...prev,
      filters: DEFAULT_FILTERS,
      page: 0,
    }));
  };

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
      if (!documentName) setDocumentName(file.name);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadStep("getting-url");
    try {
      const file = selectedFile;
      const extension = file.name.split(".").pop() || "";
      const finalName = documentName.trim() || file.name;

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

  // ** NUOVA FUNZIONE: cambio stato inline **
  const handleStatusChange = async (docId: string, newStatus: "DRAFT" | "ACTIVE") => {
    setStatusUpdatingId(docId);
    try {
      await documentAdminApi.changeStatus(condominiumId, docId, newStatus);
      toast.success(`Stato aggiornato a ${newStatus === "ACTIVE" ? "Attivo" : "Bozza"}`);
      // Ricarica la lista per riflettere il cambiamento
      await fetchDocuments(queryParams, viewMode);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Errore durante il cambio stato.");
    } finally {
      setStatusUpdatingId(null);
    }
  };

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

  // Badge stato (usato solo per i documenti eliminati o quando non si vuole il select)
  const StatusBadge = ({ status }: { status: string }) => {
    const config = {
      ACTIVE: { variant: "default" as const, icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      DRAFT: { variant: "secondary" as const, icon: <EyeOff className="h-3 w-3 mr-1" /> },
      DELETED: { variant: "destructive" as const, icon: <Archive className="h-3 w-3 mr-1" /> },
    };
    const { variant, icon } = config[status as keyof typeof config] || config.DRAFT;
    return (
      <Badge variant={variant} className="flex items-center gap-0.5">
        {icon}
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Intestazione */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Archivio documenti</h3>
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
              Documenti
            </ToggleGroupItem>
            <ToggleGroupItem
              value="deleted"
              className="data-[state=on]:bg-destructive data-[state=on]:text-destructive-foreground rounded-sm gap-1"
            >
              <Archive className="h-4 w-4" />
              Cestino
            </ToggleGroupItem>
          </ToggleGroup>
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

        <Dialog open={uploadDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Upload className="h-4 w-4" />
              Carica documento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>Carica un nuovo documento</DialogTitle>
              <DialogDescription>Seleziona il file e imposta le opzioni.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-2">
              <div
                className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-muted/50 transition cursor-pointer"
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
                        setDocumentName("");
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
                <Label htmlFor="doc-name" className="text-xs font-medium">
                  Nome documento
                </Label>
                <Input
                  id="doc-name"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="Lascia vuoto per usare il nome del file"
                  className="h-8 text-sm"
                />
              </div>

              <Separator className="my-1" />

              <div className="space-y-1">
                <Label className="text-xs font-medium">Stato iniziale</Label>
                <RadioGroup
                  value={documentStatus}
                  onValueChange={(value) => setDocumentStatus(value as "DRAFT" | "ACTIVE")}
                  className="space-y-1"
                >
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="DRAFT" id="draft" className="mt-0.5" />
                    <div className="grid gap-0">
                      <Label htmlFor="draft" className="text-sm font-medium cursor-pointer">
                        Bozza (DRAFT)
                      </Label>
                      <p className="text-[11px] text-muted-foreground">
                        Visibile solo a te.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="ACTIVE" id="active" className="mt-0.5" />
                    <div className="grid gap-0">
                      <Label htmlFor="active" className="text-sm font-medium cursor-pointer">
                        Attivo (ACTIVE)
                      </Label>
                      <p className="text-[11px] text-muted-foreground">
                        Visibile a tutti i membri autorizzati.
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <Separator className="my-1" />

              <div className="space-y-1">
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
                <p className="text-[11px] text-muted-foreground pl-6">
                  Se abilitato, potrai caricare nuove versioni. Se disabilitato,
                  non potrai più abilitarlo.
                </p>
              </div>

              {isUploading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                size="sm"
              >
                Annulla
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                size="sm"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {uploadStep === "uploading-to-storage" ? "Caricando..." : "Elaborazione..."}
                  </>
                ) : (
                  "Carica"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtri */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 items-end">
        <div className="space-y-1">
          <Label htmlFor="filter-originalName" className="text-xs">
            Nome file
          </Label>
          <Input
            id="filter-originalName"
            placeholder="Cerca per nome..."
            value={filterValues.originalName}
            onChange={(e) =>
              setFilterValues((prev) => ({ ...prev, originalName: e.target.value }))
            }
            className="h-9"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="filter-contentType" className="text-xs">
            Tipo contenuto
          </Label>
          <Select
            value={filterValues.contentType}
            onValueChange={(val) =>
              setFilterValues((prev) => ({ ...prev, contentType: val }))
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Seleziona tipo" />
            </SelectTrigger>
            <SelectContent>
              {CONTENT_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="filter-status" className="text-xs">
            Stato
          </Label>
          <Select
            value={filterValues.status}
            onValueChange={(val) =>
              setFilterValues((prev) => ({ ...prev, status: val }))
            }
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
        <div className="space-y-1">
          <Label htmlFor="filter-versioningEnabled" className="text-xs">
            Versioning
          </Label>
          <Select
            value={
              filterValues.versioningEnabled === undefined
                ? "all"
                : String(filterValues.versioningEnabled)
            }
            onValueChange={(val) =>
              setFilterValues((prev) => ({
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
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="default" onClick={handleSearch} className="gap-1">
          <Search className="h-4 w-4" /> Cerca
        </Button>
        <Button size="sm" variant="outline" onClick={handleReset} className="gap-1">
          <X className="h-4 w-4" /> Reset
        </Button>
      </div>

      {/* Azioni bulk */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
          <span className="text-sm font-medium">
            {selectedIds.length} selezionati
          </span>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => openBulkDialog("delete")}
            disabled={bulkLoading}
            className="gap-1"
          >
            <Trash2 className="h-4 w-4" />
            Elimina definitivamente
          </Button>
          {viewMode !== "deleted" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => openBulkDialog("program")}
              disabled={bulkLoading}
              className="gap-1"
            >
              <Clock className="h-4 w-4" />
              Programma eliminazione
            </Button>
          )}
          {bulkLoading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <p className="text-destructive text-center py-4">{error}</p>
      ) : documents.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">
          {viewMode === "deleted"
            ? "Nessun documento nel cestino."
            : "Nessun documento archiviato."}
        </p>
      ) : (
        <>
          <div className="overflow-x-auto relative border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selectedIds.length === documents.length && documents.length > 0}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Seleziona tutti"
                    />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:text-primary"
                    onClick={() => {
                      if (queryParams.sortBy === "originalName") {
                        setQueryParams((prev) => ({
                          ...prev,
                          ascending: !prev.ascending,
                        }));
                      } else {
                        setQueryParams((prev) => ({
                          ...prev,
                          sortBy: "originalName",
                          ascending: true,
                        }));
                      }
                    }}
                  >
                    Nome{" "}
                    {queryParams.sortBy === "originalName" &&
                      (queryParams.ascending ? "↑" : "↓")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:text-primary"
                    onClick={() => {
                      if (queryParams.sortBy === "size") {
                        setQueryParams((prev) => ({
                          ...prev,
                          ascending: !prev.ascending,
                        }));
                      } else {
                        setQueryParams((prev) => ({
                          ...prev,
                          sortBy: "size",
                          ascending: true,
                        }));
                      }
                    }}
                  >
                    Dimensione{" "}
                    {queryParams.sortBy === "size" &&
                      (queryParams.ascending ? "↑" : "↓")}
                  </TableHead>
                  {/* COLONNA STATO CON SELECT INLINE */}
                  <TableHead
                    className="cursor-pointer hover:text-primary"
                    onClick={() => {
                      if (queryParams.sortBy === "status") {
                        setQueryParams((prev) => ({
                          ...prev,
                          ascending: !prev.ascending,
                        }));
                      } else {
                        setQueryParams((prev) => ({
                          ...prev,
                          sortBy: "status",
                          ascending: true,
                        }));
                      }
                    }}
                  >
                    Stato{" "}
                    {queryParams.sortBy === "status" &&
                      (queryParams.ascending ? "↑" : "↓")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:text-primary"
                    onClick={() => {
                      if (queryParams.sortBy === "currentVersion") {
                        setQueryParams((prev) => ({
                          ...prev,
                          ascending: !prev.ascending,
                        }));
                      } else {
                        setQueryParams((prev) => ({
                          ...prev,
                          sortBy: "currentVersion",
                          ascending: true,
                        }));
                      }
                    }}
                  >
                    Versione{" "}
                    {queryParams.sortBy === "currentVersion" &&
                      (queryParams.ascending ? "↑" : "↓")}
                  </TableHead>
                  {viewMode === "deleted" && (
                    <TableHead>Eliminazione</TableHead>
                  )}
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow
                    key={doc.id}
                    className="cursor-pointer hover:bg-muted/50"
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
                    <TableCell className="flex items-center gap-2">
                      <File className="h-4 w-4" />
                      <span className="truncate max-w-[200px]">
                        {doc.originalName}
                      </span>
                    </TableCell>
                    <TableCell>{formatSize(doc.size)}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {doc.status === "DELETED" ? (
                        <StatusBadge status="DELETED" />
                      ) : (
                        <Select
                          value={doc.status}
                          onValueChange={(val) =>
                            handleStatusChange(doc.id, val as "DRAFT" | "ACTIVE")
                          }
                          disabled={statusUpdatingId === doc.id}
                        >
                          <SelectTrigger className="h-7 w-[90px] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DRAFT">Bozza</SelectItem>
                            <SelectItem value="ACTIVE">Attivo</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>{doc.currentVersion}</TableCell>
                    {viewMode === "deleted" && (
                      <TableCell>
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
                          size="sm"
                          onClick={() => goToDetail(doc.id)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Dettaglio</span>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Azioni</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {doc.status !== "DELETED" && (
                              <DropdownMenuItem
                                onClick={() => openSingleActionDialog("program", doc.id)}
                                className="gap-2"
                              >
                                <Clock className="h-4 w-4" />
                                Programma eliminazione
                              </DropdownMenuItem>
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
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Paginazione */}
          {totalPages > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-2">
              <div className="text-sm text-muted-foreground">
                Mostrati {documents.length} di {totalElements} documenti
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(queryParams.page - 1)}
                  disabled={queryParams.page === 0}
                >
                  Precedente
                </Button>
                <span className="text-sm px-2">
                  Pagina {queryParams.page + 1} di {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(queryParams.page + 1)}
                  disabled={queryParams.page === totalPages - 1}
                >
                  Successiva
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="pageSize" className="text-xs">
                  Righe:
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
        </>
      )}

      {/* Dialog per azioni bulk */}
      <Dialog
        open={bulkDialog.open}
        onOpenChange={(open) => !bulkLoading && setBulkDialog({ open, type: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bulkDialog.type === "delete" ? "Eliminazione definitiva" : "Programmazione eliminazione"}
            </DialogTitle>
            <DialogDescription>
              {bulkDialog.type === "delete"
                ? `Sei sicuro di voler eliminare definitivamente ${selectedIds.length} documento/i? Questa azione non è reversibile.`
                : `Sei sicuro di voler programmare l'eliminazione di ${selectedIds.length} documento/i? Saranno contrassegnati come eliminati e rimossi dalla vista.`}
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
            >
              {bulkLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  In corso...
                </>
              ) : bulkDialog.type === "delete" ? (
                "Elimina definitivamente"
              ) : (
                "Programma eliminazione"
              )}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {singleActionDialog.type === "delete" ? "Eliminazione definitiva" : "Programmazione eliminazione"}
            </DialogTitle>
            <DialogDescription>
              {singleActionDialog.type === "delete"
                ? "Sei sicuro di voler eliminare definitivamente questo documento? Questa azione non è reversibile."
                : "Sei sicuro di voler programmare l'eliminazione di questo documento? Sarà contrassegnato come eliminato e rimosso dalla vista."}
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
            >
              {singleActionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  In corso...
                </>
              ) : singleActionDialog.type === "delete" ? (
                "Elimina definitivamente"
              ) : (
                "Programma eliminazione"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}