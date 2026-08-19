import { useState, useEffect } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ComunicazioniListProps {
    condominiumId: string;
}

export function ComunicazioniList({ condominiumId }: ComunicazioniListProps) {
    const [comunicazioni, setComunicazioni] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setComunicazioni([
                { id: "1", titolo: "Avviso manutenzione", data: "2026-08-09", contenuto: "Intervento previsto per domani." },
                { id: "2", titolo: "Convocazione assemblea", data: "2026-08-01", contenuto: "Assemblea ordinaria il 20/08." },
            ]);
            setLoading(false);
        }, 500);
    }, [condominiumId]);

    if (loading) return <Loader2 className="h-6 w-6 animate-spin text-primary" />;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Comunicazioni</h3>
                <Button size="sm" className="gap-1">
                    <Send className="h-4 w-4" />
                    Nuova comunicazione
                </Button>
            </div>
            {comunicazioni.length === 0 ? (
                <p className="text-muted-foreground">Nessuna comunicazione.</p>
            ) : (
                <div className="space-y-3">
                    {comunicazioni.map((c) => (
                        <Card key={c.id}>
                            <CardContent className="p-4">
                                <div className="flex justify-between">
                                    <h4 className="font-semibold">{c.titolo}</h4>
                                    <span className="text-sm text-muted-foreground">{c.data}</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{c.contenuto}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}