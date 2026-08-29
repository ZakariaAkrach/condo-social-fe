// src/pages/private/resident/ResidentDocumentsPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Search, FileText, Eye, FolderOpen, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { documentResidentApi } from "@/app/api/documentResident";
import { useCondominium } from "@/components/residentDashboard/CondominiumContext";

interface Document {
  id: string;
  versioningEnabled: boolean;
  currentVersion: number;
  status: string;
  originalName: string;
  contentType: string;
}

export default function ResidentDocumentsPage() {
  const navigate = useNavigate();
  const { condominiumId } = useCondominium();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [size] = useState(10);
  const [showSearch, setShowSearch] = useState(false);

  const fetchDocuments = async (resetPage = true) => {
    if (!condominiumId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await documentResidentApi.fetch(condominiumId, {
        originalName: searchTerm || undefined,
        page: resetPage ? 0 : page,
        size,
        sortBy: "createdAt",
        ascending: false,
      });
      
      setDocuments(response.data ?? []);
      setTotalPages(response.totalPages ?? 0);
      setTotalElements(response.totalElements ?? 0);
      
      if (resetPage) setPage(0);
    } catch (error) {
      toast.error("Errore nel caricamento dei documenti");
      console.error(error);
      setDocuments([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments(true);
  }, [condominiumId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDocuments(true);
  };

  const goToDetail = (documentId: string) => {
    navigate(`/resident/document/${documentId}`);
  };

  const formatContentType = (contentType: string) => {
    const map: Record<string, string> = {
      "application/pdf": "PDF",
      "image/jpeg": "JPEG",
      "image/png": "PNG",
      "application/msword": "Word",
      "application/vnd.ms-excel": "Excel",
      "text/plain": "TXT",
    };
    return map[contentType] || contentType;
  };

  if (!condominiumId) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Seleziona un condominio per vedere i documenti.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <FolderOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Documenti</h1>
            <p className="text-sm text-muted-foreground">
              {totalElements} documenti disponibili
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSearch(!showSearch)}
          className="gap-2"
        >
          {showSearch ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          {showSearch ? "Chiudi" : "Cerca"}
        </Button>
      </div>

      {/* Search */}
      {showSearch && (
        <Card>
          <CardContent className="p-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Cerca per nome file..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="submit" size="sm" className="gap-2">
                <Search className="h-4 w-4" />
                Cerca
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : documents.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-3">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-medium text-muted-foreground">Nessun documento disponibile</p>
            <p className="text-sm text-muted-foreground mt-1">
              Non ci sono documenti da visualizzare
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {documents.map((doc) => (
              <Card
                key={doc.id}
                className="cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
                onClick={() => goToDetail(doc.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">{doc.originalName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px]">
                            {formatContentType(doc.contentType)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            v{doc.currentVersion}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Eye className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Paginazione */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => {
                  setPage((p) => p - 1);
                  fetchDocuments(false);
                }}
              >
                Precedente
              </Button>
              <span className="text-sm">
                Pagina {page + 1} di {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => {
                  setPage((p) => p + 1);
                  fetchDocuments(false);
                }}
              >
                Successiva
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}