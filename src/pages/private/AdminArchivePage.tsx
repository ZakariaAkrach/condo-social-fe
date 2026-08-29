// src/pages/private/AdminArchivePage.tsx
import { useState, useEffect, useCallback } from "react";
import { ArchivioList } from "@/components/adminDashboard/ArchivioList";
import { condominiumApi, type CondominiumDto } from "@/app/api/condominium";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, FolderOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminArchivePage() {
  const [condominiums, setCondominiums] = useState<CondominiumDto[]>([]);
  const [selectedCondominiumId, setSelectedCondominiumId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchCondominiums = useCallback(async () => {
    setLoading(true);
    try {
      const response = await condominiumApi.fetchCondominiums({
        page: 0,
        size: 100,
        sortBy: "name",
        ascending: true,
      });
      const data = response.data || [];
      setCondominiums(data);
      if (data.length > 0) {
        setSelectedCondominiumId(data[0].id);
      }
    } catch (error) {
      console.error("Errore nel caricamento dei condomini", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCondominiums();
  }, [fetchCondominiums]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selettore condominio */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            Archivio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Condominio:</span>
            </div>
            <Select
              value={selectedCondominiumId}
              onValueChange={setSelectedCondominiumId}
            >
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue placeholder="Seleziona condominio" />
              </SelectTrigger>
              <SelectContent>
                {condominiums.map((condo) => (
                  <SelectItem key={condo.id} value={condo.id}>
                    {condo.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista archivio */}
      {selectedCondominiumId && (
        <ArchivioList condominiumId={selectedCondominiumId} />
      )}
    </div>
  );
}