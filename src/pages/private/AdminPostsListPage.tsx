// src/pages/private/AdminPostsListPage.tsx
import { AdminPostsList } from "@/components/adminDashboard/AdminPostsList";
import { useParams } from "react-router";

export default function AdminPostsListPage() {
  const { condominiumId } = useParams<{ condominiumId: string }>();
  
  if (!condominiumId) {
    return <div>ID condominio non trovato</div>;
  }
  
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <AdminPostsList condominiumId={condominiumId} />
    </div>
  );
}