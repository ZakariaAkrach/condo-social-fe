// pages/private/ResidentDocumentDetailPage.tsx
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, File, Calendar, Loader2, RefreshCw, FileText, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useNavigate, useParams } from "react-router";
import { useCondominium } from "@/components/residentDashboard/CondominiumContext";
import { documentResidentApi } from "@/app/api/documentResident";
import { downloadFileFromStorage } from "@/auth/downloadFileFromStorage";

interface DocumentDetail {
  id: string;
  versioningEnabled: boolean;
  currentVersion: number;
  status: string;
  originalName: string;
  contentType: string;
  createdAt: string;
  updatedAt: string;
}

interface Version {
  idVersion: string;
  version: number;
  originalName: string;
  size: number;
  contentType: string;
  createdAt: string;
}

export default function ResidentDocumentDetailPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const { condominiumId } = useCondominium();
  const navigate = useNavigate();

  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fetchDocument = useCallback(async () => {
    if (!condominiumId || !documentId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const docRes = await documentResidentApi.detail(condominiumId, documentId);
      setDocument(docRes.data ?? null);
    } catch (error) {
      toast.error("Errore nel caricamento del documento");
      console.error(error);
      setDocument(null);
    } finally {
      setLoading(false);
    }
  }, [condominiumId, documentId]);

  const fetchVersions = useCallback(async () => {
    if (!condominiumId || !documentId) return;
    setLoadingVersions(true);
    try {
      const res = await documentResidentApi.fetchVersions(condominiumId, documentId, {
        page: 0,
        size: 50,
        sortBy: "createdAt",
        ascending: false,
      });
      setVersions(res.data ?? []);
    } catch (error) {
      toast.error("Errore nel caricamento delle versioni");
      console.error(error);
      setVersions([]);
    } finally {
      setLoadingVersions(false);
    }
  }, [condominiumId, documentId]);

  useEffect(() => {
    fetchDocument();
    fetchVersions();
  }, [fetchDocument, fetchVersions]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDocument();
    await fetchVersions();
    setRefreshing(false);
    toast.success("Dettaglio aggiornato");
  };

  const handleDownload = async (versionNumber?: number, versionId?: string) => {
    if (!condominiumId || !documentId) {
      toast.error("Dati mancanti per il download");
      return;
    }

    if (versionId) setDownloadingId(versionId);
    else setDownloadingId("main");

    try {
      const response = await documentResidentApi.download(
        condominiumId,
        documentId,
        versionNumber
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
      link.download = response.data.fileName;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);

      toast.success("Download completato");
    } catch (error: any) {
      console.error("Errore durante il download", error);
      toast.error(error?.message || "Errore durante il download");
    } finally {
      setDownloadingId(null);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatContentType = (contentType: string) => {
    const map: Record<string, string> = {
      "application/pdf": "PDF",
      "image/jpeg": "JPEG",
      "image/png": "PNG",
      "application/msword": "Word",
      "application/vnd.ms-excel": "Excel",
      "application/vnd.ms-powerpoint": "PowerPoint",
      "text/plain": "TXT",
    };
    return map[contentType] || contentType;
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="p-6 text-center">
        <div className="rounded-full bg-muted p-4 inline-block mb-3">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground font-medium">Documento non trovato</p>
        <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
          Torna indietro
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-base font-semibold truncate flex-1">
            Dettaglio documento
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
        {/* File header */}
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-primary/10 p-3 shrink-0">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold leading-snug break-words">
              {document.originalName}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                v{document.currentVersion}
              </Badge>
            </div>
          </div>
        </div>

        {/* Download button */}
        <Button
          size="lg"
          onClick={() => handleDownload(document.currentVersion)}
          disabled={downloadingId === "main"}
          className="w-full gap-2"
        >
          {downloadingId === "main" ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Download className="h-5 w-5" />
          )}
          Scarica versione corrente
        </Button>

        {/* Info card */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>
                Caricato il {format(new Date(document.createdAt), "dd MMM yyyy HH:mm", { locale: it })}
              </span>
            </div>
            {document.versioningEnabled && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>Versionamento attivo</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Versions */}
        {document.versioningEnabled && (
          <section className="space-y-3">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Versioni disponibili
              <Badge variant="secondary" className="text-xs">
                {versions.length}
              </Badge>
            </h2>

            {loadingVersions ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : versions.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Nessuna versione trovata</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {versions.map((v) => {
                  const isCurrent = v.version === document.currentVersion;
                  return (
                    <Card key={v.idVersion} className={isCurrent ? "border-primary/30 bg-primary/5" : ""}>
                      <CardContent className="p-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`rounded-lg p-2 shrink-0 ${isCurrent ? "bg-primary/10" : "bg-muted"}`}>
                            <File className={`h-5 w-5 ${isCurrent ? "text-primary" : "text-muted-foreground"}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-sm truncate">{v.originalName}</p>
                              {isCurrent && (
                                <Badge variant="default" className="text-[10px]">
                                  Corrente
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Versione {v.version} • {formatSize(v.size)} •{" "}
                              {format(new Date(v.createdAt), "dd MMM yyyy", { locale: it })}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(v.version, v.idVersion)}
                          disabled={downloadingId === v.idVersion}
                          className="gap-2 shrink-0"
                        >
                          {downloadingId === v.idVersion ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                          <span className="hidden sm:inline">Scarica</span>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}