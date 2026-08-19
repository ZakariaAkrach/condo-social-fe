import { useState, useEffect } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface SpeseListProps {
    condominiumId: string;
}

export function SpeseList({ condominiumId }: SpeseListProps) {
    const [spese, setSpese] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setSpese([
                { id: "1", descrizione: "Manutenzione ascensore", importo: 450.00, data: "2026-08-01" },
                { id: "2", descrizione: "Pulizia condominiale", importo: 120.50, data: "2026-07-28" },
            ]);
            setLoading(false);
        }, 500);
    }, [condominiumId]);

    if (loading) return <Loader2 className="h-6 w-6 animate-spin text-primary" />;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Spese</h3>
                <Button size="sm" className="gap-1">
                    <Plus className="h-4 w-4" />
                    Aggiungi spesa
                </Button>
            </div>
            {spese.length === 0 ? (
                <p className="text-muted-foreground">Nessuna spesa registrata.</p>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Descrizione</TableHead>
                            <TableHead>Importo</TableHead>
                            <TableHead>Data</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {spese.map((s) => (
                            <TableRow key={s.id}>
                                <TableCell>{s.descrizione}</TableCell>
                                <TableCell>€ {s.importo.toFixed(2)}</TableCell>
                                <TableCell>{s.data}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}