import { useState } from "react";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { documentAdminApi } from "@/app/api/documentAdmin";
import { uploadFileToStorage } from "@/auth/uploadStorage";

interface ArchivioListProps {
    condominiumId: string;
}

export function ArchivioList({ condominiumId }: ArchivioListProps) {
    const [documenti, setDocumenti] = useState<any[]>([
        { id: "1", nome: "Regolamento.pdf", dimensione: "2.4 MB", data: "2026-01-15" },
        { id: "2", nome: "Bilancio_2025.xlsx", dimensione: "1.1 MB", data: "2026-02-20" },
    ]);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [documentName, setDocumentName] = useState("");
    const [versioningEnabled, setVersioningEnabled] = useState(false);
    const [documentStatus, setDocumentStatus] = useState<"DRAFT" | "ACTIVE">("DRAFT");
    const [uploading, setUploading] = useState(false);

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        try {
            const file = selectedFile;
            const extension = file.name.split(".").pop() || "";
            const finalName = documentName.trim() || file.name;

            const payload = {
                versioningEnabled,
                originalFileName: finalName,
                size: file.size,
                contentType: file.type || "application/octet-stream",
                extension,
                status: documentStatus,
            };

            const response = await documentAdminApi.upload(payload, condominiumId);
            const { uploadUrl } = response.data;

            await uploadFileToStorage(file, uploadUrl);

            const newDocument = {
                id: response.data.documentVersionId || Date.now().toString(),
                nome: finalName,
                dimensione: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                data: new Date().toLocaleDateString(),
                stato: documentStatus,
            };
            setDocumenti((prev) => [newDocument, ...prev]);

            setUploadDialogOpen(false);
            setSelectedFile(null);
            setDocumentName("");
            setVersioningEnabled(false);
            setDocumentStatus("DRAFT");
        } catch (error) {
            console.error("Errore durante l'upload", error);
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            if (!documentName) {
                setDocumentName(file.name);
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Archivio documenti</h3>
                <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-1">
                            <Upload className="h-4 w-4" />
                            Carica documento
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[520px]">
                        <DialogHeader>
                            <DialogTitle>Carica un nuovo documento</DialogTitle>
                            <DialogDescription>
                                Seleziona il file e imposta le opzioni.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-3 py-2">
                            {/* File picker */}
                            <div
                                className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-muted/50 transition cursor-pointer"
                                onClick={() => document.getElementById("file-upload")?.click()}
                            >
                                <Input
                                    id="file-upload"
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                {selectedFile ? (
                                    <div className="flex items-center justify-center gap-2 text-sm">
                                        <File className="h-4 w-4 text-primary" />
                                        <span className="font-medium">{selectedFile.name}</span>
                                        <span className="text-muted-foreground text-xs">
                                            ({(selectedFile.size / 1024).toFixed(0)} KB)
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-0.5">
                                        <Upload className="h-8 w-8 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">
                                            Trascina un file qui o clicca
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Nome documento */}
                            <div className="space-y-1">
                                <Label htmlFor="doc-name" className="text-xs font-medium">
                                    Nome documento
                                </Label>
                                <Input
                                    id="doc-name"
                                    value={documentName}
                                    onChange={(e) => setDocumentName(e.target.value)}
                                    placeholder="Lascia vuoto per usare il nome del file"
                                    className="h-8 text-sm"
                                />
                            </div>

                            <Separator className="my-1" />

                            {/* Stato iniziale */}
                            <div className="space-y-1">
                                <Label className="text-xs font-medium">Stato iniziale</Label>
                                <RadioGroup
                                    value={documentStatus}
                                    onValueChange={(value) => setDocumentStatus(value as "DRAFT" | "ACTIVE")}
                                    className="space-y-1"
                                >
                                    <div className="flex items-start space-x-2">
                                        <RadioGroupItem value="DRAFT" id="draft" className="mt-0.5" />
                                        <div className="grid gap-0">
                                            <Label htmlFor="draft" className="text-sm font-medium cursor-pointer">
                                                Bozza (DRAFT)
                                            </Label>
                                            <p className="text-[11px] text-muted-foreground">
                                                Visibile solo a te.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <RadioGroupItem value="ACTIVE" id="active" className="mt-0.5" />
                                        <div className="grid gap-0">
                                            <Label htmlFor="active" className="text-sm font-medium cursor-pointer">
                                                Attivo (ACTIVE)
                                            </Label>
                                            <p className="text-[11px] text-muted-foreground">
                                                Visibile a tutti i membri autorizzati.
                                            </p>
                                        </div>
                                    </div>
                                </RadioGroup>
                            </div>

                            <Separator className="my-1" />

                            {/* Versioning */}
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="versioning"
                                        checked={versioningEnabled}
                                        onCheckedChange={(checked) => setVersioningEnabled(!!checked)}
                                    />
                                    <Label htmlFor="versioning" className="text-sm font-medium">
                                        Abilita versioning
                                    </Label>
                                </div>
                                <p className="text-[11px] text-muted-foreground pl-6">
                                    Se abilitato, potrai caricare nuove versioni. Se disabilitato, non potrai più abilitarlo.
                                </p>
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => setUploadDialogOpen(false)} disabled={uploading} size="sm">
                                Annulla
                            </Button>
                            <Button onClick={handleUpload} disabled={!selectedFile || uploading} size="sm">
                                {uploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Caricamento...
                                    </>
                                ) : (
                                    "Carica"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
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