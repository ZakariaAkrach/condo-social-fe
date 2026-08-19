import { Separator } from "@/components/ui/separator";
import AdminHeaderDashboard from "@/components/adminDashboard/adminHeaderDashboard";
import AdminMetricsDashboard from "@/components/adminDashboard/adminMetricsDashboard";
import AdminCondominiDashboard from "@/components/adminDashboard/adminCondominiDashboard";
import AdminAnalyzTicketsDashboard from "@/components/adminDashboard/AdminAnalyzTicketsDashboard";
import AdminRecentActivities from "@/components/adminDashboard/AdminRecentActivities";
import { useState, useEffect, useCallback } from "react";
import { condominiumApi, type CondominiumDto } from "@/app/api/condominium";

export default function AdminDashboardPage() {
  const [condominiums, setCondominiums] = useState<CondominiumDto[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCondominiums = useCallback(async () => {
    try {
      setLoading(true);
      const response = await condominiumApi.fetchCondominiums({
        page: 0,
        size: 100,
        sortBy: "name",
        ascending: true,
      });
      setCondominiums(response.data || []);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error("Error fetching condominiums:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCondominiums();
  }, [fetchCondominiums]);

  const handleCondominiumCreated = useCallback(() => {
    fetchCondominiums(); // aggiorna la lista
  }, [fetchCondominiums]);

  return (
    <div className="space-y-12 max-w-350 mx-auto">
      <AdminHeaderDashboard onCondominiumCreated={handleCondominiumCreated} />
      <AdminMetricsDashboard />

      {/* Passa i condomini come prop */}
      <AdminCondominiDashboard 
        condominiums={condominiums} 
        totalElements={totalElements} 
        loading={loading}
        onRefresh={fetchCondominiums}
      />

      <Separator />

      <AdminAnalyzTicketsDashboard />

      <AdminRecentActivities condominiums={condominiums} limit={10} />
    </div>
  );
}