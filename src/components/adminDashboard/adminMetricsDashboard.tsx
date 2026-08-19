import { CheckCircle, MessageSquare, Ticket, Users } from "lucide-react";
import { MetricCard } from "./MetricCard";

export default function AdminMetricsDashboard() {

    const metrics = {
        ticketsAperti: 8,
        ticketsChiusi: 12,
        postTotali: 34,
        utentiTotali: 28,
    }

    return (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
                title="Ticket da gestire"
                value={metrics.ticketsAperti}
                icon={<Ticket className="h-5 w-5" />}
                description="+2 rispetto a ieri"
            />
            <MetricCard
                title="Ticket risolti"
                value={metrics.ticketsChiusi}
                icon={<CheckCircle className="h-5 w-5" />}
                description="+5 in 24 ore"
            />
            <MetricCard
                title="Discussioni attive"
                value={metrics.postTotali}
                icon={<MessageSquare className="h-5 w-5" />}
                description="12 nuovi messaggi"
            />
            <MetricCard
                title="Utenti coinvolti"
                value={metrics.utentiTotali}
                icon={<Users className="h-5 w-5" />}
                description="+8% questo mese"
            />
        </div>
    )
}