import { useState, useEffect } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { documentAdminApi } from "@/app/api/documentAdmin";
import { format, formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { useNavigate, useParams } from "react-router";

// Tipi
interface DocumentDetail {
  id: string;
  versioningEnabled: boolean;
  currentVersion: number;
  createdAt: string;
  status: "DRAFT" | "ACTIVE";
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

  // Dati mock per le versioni (ordinate dalla più recente)
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

  // Dati mock per i permessi (SOLO utenti con accesso)
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

  // Fetch dettaglio documento
  useEffect(() => {
    const fetchDetail = async () => {
      if (!condominiumId || !documentId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await documentAdminApi.detail(condominiumId, documentId);
        setDocument(response.data);
      } catch (err: any) {
        console.error("Errore fetch dettaglio documento", err);
        const msg = err?.response?.data?.message || "Errore nel caricamento del documento";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [condominiumId, documentId]);

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

  // --- LOGICA PER LE VERSIONI ---
  // Se il versioning è abilitato, usa le versioni mock; altrimenti crea una versione mockata dal documento
  const getCurrentVersionMock = (doc: DocumentDetail): DocumentVersionMock => ({
    version: doc.currentVersion,
    originalName: `Documento_${doc.id.slice(0, 8)}.pdf`, // mock
    size: 1024 * 1024, // 1 MB (mock)
    uploadedAt: doc.createdAt,
    uploadedBy: "Amministratore",
    uploadedByInitials: "AD",
  });

  // Ordina le versioni dalla più recente alla più vecchia (solo se versioning abilitato)
  const sortedVersions = [...mockVersions].sort((a, b) => b.version - a.version);

  // Determina quali versioni mostrare
  const versionsToShow = document?.versioningEnabled
    ? sortedVersions
    : document
    ? [getCurrentVersionMock(document)]
    : [];

  // Conteggio per il badge del tab
  const versionCount = document?.versioningEnabled ? versionsToShow.length : 1;

  // Prendi l'iniziale per l'avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-5xl">
      {/* Header con pulsante indietro e azioni */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={goBack} className="shrink-0">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Indietro
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <File className="h-6 w-6 text-primary" />
              {document.id.slice(0, 8)}...
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant={document.status === "ACTIVE" ? "default" : "secondary"}
                className="text-xs"
              >
                {document.status === "ACTIVE" ? "● Attivo" : "● Bozza"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Creato {formatRelativeTime(document.createdAt)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => handleDownload()}>
            <Download className="h-4 w-4 mr-2" />
            Scarica ultima versione
          </Button>
        </div>
      </div>

      {/* Informazioni documento - layout compatto */}
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

        {/* TAB VERSIONI */}
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
                      {/* Numero versione */}
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

                      {/* Info */}
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

                    {/* Azioni */}
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

        {/* TAB ACCESSO - SOLO UTENTI CHE POSSONO VEDERE */}
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
                    {/* Avatar con iniziali */}
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
    </div>
  );
}