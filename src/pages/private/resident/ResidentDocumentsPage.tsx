// pages/private/ResidentDocumentsPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Search, FileText, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [size] = useState(10);

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
      
      // ✅ La tua API restituisce l'array in "data" e i metadati in "totalPages"
      setDocuments(response.data ?? []);
      setTotalPages(response.totalPages ?? 0);
      
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [condominiumId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDocuments(true);
  };

  const goToDetail = (documentId: string) => {
    navigate(`/resident/document/${documentId}`);
  };


  if (!condominiumId) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Seleziona un condominio per vedere i documenti.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Intestazione */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Documenti</h1>
          <p className="text-sm text-muted-foreground">
            Cerca e scarica i tuoi documenti
          </p>
        </div>
        <Badge variant="outline" className="text-sm px-3 py-1">
          {documents.length} documenti
        </Badge>
      </div>

      {/* Ricerca */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cerca per nome file..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 py-6 text-base"
          />
        </div>
        <Button type="submit" size="lg" className="px-6">
          Cerca
        </Button>
      </form>

      {/* Lista */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Nessun documento disponibile</p>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {documents.map((doc) => (
              <Card
                key={doc.id}
                className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer active:scale-[0.99]"
                onClick={() => goToDetail(doc.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base md:text-lg font-semibold truncate">
                      {doc.originalName}
                    </CardTitle>
                    <Badge variant="secondary" className="shrink-0">
                      v.{doc.currentVersion}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {doc.contentType} • {doc.status}
                  </p>
                </CardHeader>
                <CardFooter className="flex justify-end pt-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToDetail(doc.id);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Dettagli
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Paginazione */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-6">
              <Button
                variant="outline"
                size="lg"
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
                size="lg"
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