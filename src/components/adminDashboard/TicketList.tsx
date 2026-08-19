import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
// import { ticketApi, TicketDto } from "@/app/api/ticket";

interface TicketListProps {
    condominiumId: string;
}

export function TicketList({ condominiumId }: TicketListProps) {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simula fetch ticket
        setTimeout(() => {
            setTickets([
                { id: "1", title: "Riparazione ascensore", status: "aperto", date: "2026-08-10" },
                { id: "2", title: "Pulizia scale", status: "chiuso", date: "2026-08-05" },
            ]);
            setLoading(false);
        }, 500);
    }, [condominiumId]);

    if (loading) return <Loader2 className="h-6 w-6 animate-spin text-primary" />;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Ticket</h3>
                <Button size="sm" className="gap-1">
                    <Plus className="h-4 w-4" />
                    Nuovo ticket
                </Button>
            </div>
            {tickets.length === 0 ? (
                <p className="text-muted-foreground">Nessun ticket presente.</p>
            ) : (
                <div className="space-y-2">
                    {tickets.map((ticket) => (
                        <Card key={ticket.id}>
                            <CardContent className="flex justify-between items-center p-4">
                                <div>
                                    <p className="font-medium">{ticket.title}</p>
                                    <p className="text-sm text-muted-foreground">{ticket.date}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                    ticket.status === "aperto" ? "bg-destructive/10 text-destructive" : "bg-muted"
                                }`}>
                                    {ticket.status}
                                </span>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}