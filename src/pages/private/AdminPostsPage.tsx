// src/pages/private/AdminPostsPage.tsx
import { useState, useEffect } from "react";
import { AdminPostsList } from "@/components/adminDashboard/AdminPostsList";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Megaphone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCondominiumList } from "@/components/common/CondominiumListContext";

export default function AdminPostsPage() {
  const { condominiums, loading } = useCondominiumList();
  const [selectedCondominiumId, setSelectedCondominiumId] = useState<string>("");

  useEffect(() => {
    if (condominiums.length > 0 && !selectedCondominiumId) {
      setSelectedCondominiumId(condominiums[0].id);
    }
  }, [condominiums, selectedCondominiumId]);

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
            <Megaphone className="h-5 w-5 text-primary" />
            Comunicazioni
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

      {/* Lista post */}
      {selectedCondominiumId && (
        <AdminPostsList condominiumId={selectedCondominiumId} />
      )}
    </div>
  );
}