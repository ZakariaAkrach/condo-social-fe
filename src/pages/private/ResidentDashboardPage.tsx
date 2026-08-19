import { useAuth } from "@/auth/AuthProvider"

export default function ResidentDashboardPage() {
    const { profile } = useAuth()
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold">Dashboard Resident</h1>
            <p className="text-muted-foreground">Benvenuto, {profile?.firstName || "Residente"}!</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">I tuoi ticket</div>
                <div className="rounded-lg border p-4">Annunci recenti</div>
            </div>
        </div>
    )
}