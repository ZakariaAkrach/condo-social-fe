// pages/private/ResidentDocumentDetailPage.tsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Download, File, Calendar, Loader2 } from "lucide-react";
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
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!condominiumId || !documentId) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
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
    };
    fetchData();
  }, [condominiumId, documentId]);

  useEffect(() => {
    if (!condominiumId || !documentId) return;
    const fetchVersions = async () => {
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
    };
    fetchVersions();
  }, [condominiumId, documentId]);

  // ✅ Metodo di download COPIATO DALL'ADMIN
  const handleDownload = async (versionNumber?: number) => {
    if (!condominiumId || !documentId) {
      toast.error("Dati mancanti per il download");
      return;
    }

    setDownloading(true);
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

      // Scarica il file come blob usando l'utility
      const blob = await downloadFileFromStorage(downloadUrl);

      // Crea un URL per il blob
      const blobUrl = URL.createObjectURL(blob);

      // Crea un link fittizio e avvia il download
      const link = window.document.createElement("a");
      link.href = blobUrl;
      link.download = response.data.fileName;

      window.document.body.appendChild(link);
      link.click();
      link.remove();

      // Rilascia l'URL del blob
      URL.revokeObjectURL(blobUrl);

      toast.success("Download completato");
    } catch (error: any) {
      console.error("Errore durante il download", error);
      toast.error(error?.message || "Errore durante il download");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">Documento non trovato.</p>
        <Button variant="link" onClick={() => navigate(-1)}>
          Torna indietro
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Intestazione */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-10 w-10">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-bold truncate">{document.originalName}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">{document.contentType}</Badge>
            <span>•</span>
            <span>Versione: {document.currentVersion}</span>
            <span>•</span>
            <span>Stato: {document.status}</span>
          </div>
        </div>
        <Button
          size="lg"
          onClick={() => handleDownload(document.currentVersion)}
          disabled={downloading}
          className="shrink-0"
        >
          {downloading ? (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <Download className="h-5 w-5 mr-2" />
          )}
          Scarica
        </Button>
      </div>

      {/* Info */}
      <Card className="mb-6">
        <CardContent className="p-4 space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Caricato il: {format(new Date(document.createdAt), "dd MMM yyyy HH:mm", { locale: it })}</span>
          </div>
          {document.versioningEnabled && (
            <p className="text-muted-foreground">✅ Versionamento attivo</p>
          )}
        </CardContent>
      </Card>

      {/* Versioni */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Versioni disponibili</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loadingVersions ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : versions.length === 0 ? (
            <p className="p-4 text-muted-foreground text-center">Nessuna versione trovata.</p>
          ) : (
            <ul className="divide-y">
              {versions.map((v) => (
                <li 
                  key={v.idVersion}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <File className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{v.originalName}</p>
                      <p className="text-xs text-muted-foreground">
                        Versione {v.version} • {(v.size / 1024).toFixed(1)} KB •{" "}
                        {format(new Date(v.createdAt), "dd MMM yyyy", { locale: it })}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(v.version)}
                    disabled={downloading}
                    className="shrink-0 ml-2"
                  >
                    {downloading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}