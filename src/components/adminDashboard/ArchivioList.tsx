import { useState, useEffect } from "react";
import { Loader2, Upload, File, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface ArchivioListProps {
    condominiumId: string;
}

export function ArchivioList({ condominiumId }: ArchivioListProps) {
    const [documenti, setDocumenti] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setDocumenti([
                { id: "1", nome: "Regolamento.pdf", dimensione: "2.4 MB", data: "2026-01-15" },
                { id: "2", nome: "Bilancio_2025.xlsx", dimensione: "1.1 MB", data: "2026-02-20" },
            ]);
            setLoading(false);
        }, 500);
    }, [condominiumId]);

    if (loading) return <Loader2 className="h-6 w-6 animate-spin text-primary" />;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Archivio documenti</h3>
                <Button size="sm" className="gap-1">
                    <Upload className="h-4 w-4" />
                    Carica documento
                </Button>
            </div>
            {documenti.length === 0 ? (
                <p className="text-muted-foreground">Nessun documento archiviato.</p>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Dimensione</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead className="text-right">Azioni</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {documenti.map((d) => (
                            <TableRow key={d.id}>
                                <TableCell className="flex items-center gap-2">
                                    <File className="h-4 w-4" />
                                    {d.nome}
                                </TableCell>
                                <TableCell>{d.dimensione}</TableCell>
                                <TableCell>{d.data}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}