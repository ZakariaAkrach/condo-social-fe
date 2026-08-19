import CreateCondominium from "./CreateCondominium";

interface AdminHeaderDashboardProps {
  onCondominiumCreated?: () => void;
}

export default function AdminHeaderDashboard({ onCondominiumCreated }: AdminHeaderDashboardProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Dashboard Admin
        </h1>
      </div>
      <CreateCondominium onCondominiumCreated={onCondominiumCreated} />
    </div>
  );
}