import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ArrowLeft,
    Home,
    Users,
    FileText,
    DollarSign,
    MessageSquare,
    Archive,
    AlertCircle,
    Building2,
    RefreshCw,
} from "lucide-react";
import { condominiumApi, type CondominiumDto } from "@/app/api/condominium";
import { SpeseList } from "@/components/adminDashboard/SpeseList";
import { MembriList } from "@/components/adminDashboard/MembriList";
import { ComunicazioniList } from "@/components/adminDashboard/ComunicazioniList";
import { ArchivioList } from "@/components/adminDashboard/ArchivioList";
import { AdminTicketList } from "@/components/adminDashboard/AdminTicketList";

export default function AdminCondominiumDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [condominium, setCondominium] = useState<CondominiumDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDetails = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const response = await condominiumApi.detailCondominium(id);
            const data = response.data ?? null;
            if (!data) {
                setError("NOT_FOUND");
            } else {
                setCondominium(data);
            }
        } catch (err: any) {
            // Gestione errori di rete/API
            if (err.response?.status === 404) {
                setError("NOT_FOUND");
            } else {
                setError(err.message || "ERRORE_GENERICO");
            }
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const handleBack = () => navigate("/admin/condomini");
    const handleRetry = () => fetchDetails();

    // --- STATO DI CARICAMENTO (Skeleton) ---
    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-8 w-48" />
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    // --- STATO DI ERRORE (migliorato) ---
    if (error || !condominium) {
        const isNotFound = error === "NOT_FOUND";
        const title = isNotFound ? "Condominio non trovato" : "Errore durante il caricamento";
        const description = isNotFound
            ? "Il condominio che stai cercando potrebbe essere stato eliminato o l'ID non è valido. Verifica l'indirizzo o torna alla lista."
            : "Si è verificato un problema imprevisto. Riprova più tardi o contatta il supporto.";

        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
                <Card className="w-full max-w-md shadow-lg border-destructive/20">
                    <CardHeader className="text-center">
                        <div className="mx-auto rounded-full bg-destructive/10 p-3 w-fit">
                            <AlertCircle className="h-8 w-8 text-destructive" />
                        </div>
                        <CardTitle className="text-2xl mt-2">{title}</CardTitle>
                        <CardDescription className="text-base mt-1">
                            {description}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button variant="outline" onClick={handleBack} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Torna alla lista
                        </Button>
                        <Button onClick={handleRetry} className="gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Riprova
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // --- STATO DI SUCCESSO (dettaglio) ---
    return (
        <section className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <Home className="h-6 w-6 text-primary" />
                        {condominium.name}
                    </h2>
                    {/* Badge di stato (esempio) */}
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Attivo
                    </span>
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {condominium.address}, {condominium.city} ({condominium.cap})
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Tabs defaultValue="ticket" className="w-full">
                        {/* Contenitore tab con scroll orizzontale su mobile */}
                        <div className="border-b border-border/40 px-3 pt-3 sm:px-6 sm:pt-4">
                            <div className="overflow-x-auto scrollbar-hide">
                                <TabsList className="inline-flex h-auto w-auto gap-1 rounded-full bg-muted/50 p-1 sm:gap-2">
                                    <TabsTrigger
                                        value="ticket"
                                        className="rounded-full px-3 py-1.5 text-xs font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm hover:bg-muted/80 sm:px-4 sm:py-2 sm:text-sm"
                                    >
                                        <FileText className="h-4 w-4 sm:mr-2" />
                                        <span className="hidden sm:inline">Ticket</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="spese"
                                        className="rounded-full px-3 py-1.5 text-xs font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm hover:bg-muted/80 sm:px-4 sm:py-2 sm:text-sm"
                                    >
                                        <DollarSign className="h-4 w-4 sm:mr-2" />
                                        <span className="hidden sm:inline">Spese</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="membri"
                                        className="rounded-full px-3 py-1.5 text-xs font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm hover:bg-muted/80 sm:px-4 sm:py-2 sm:text-sm"
                                    >
                                        <Users className="h-4 w-4 sm:mr-2" />
                                        <span className="hidden sm:inline">Membri</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="comunicazioni"
                                        className="rounded-full px-3 py-1.5 text-xs font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm hover:bg-muted/80 sm:px-4 sm:py-2 sm:text-sm"
                                    >
                                        <MessageSquare className="h-4 w-4 sm:mr-2" />
                                        <span className="hidden sm:inline">Comunicazioni</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="archivio"
                                        className="rounded-full px-3 py-1.5 text-xs font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm hover:bg-muted/80 sm:px-4 sm:py-2 sm:text-sm"
                                    >
                                        <Archive className="h-4 w-4 sm:mr-2" />
                                        <span className="hidden sm:inline">Archivio</span>
                                    </TabsTrigger>
                                </TabsList>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6">
                            <TabsContent value="ticket">
                                <AdminTicketList condominiumId={id!} />
                            </TabsContent>
                            <TabsContent value="spese">
                                <SpeseList condominiumId={id!} />
                            </TabsContent>
                            <TabsContent value="membri">
                                <MembriList condominiumId={id!} />
                            </TabsContent>
                            <TabsContent value="comunicazioni">
                                <ComunicazioniList condominiumId={id!} />
                            </TabsContent>
                            <TabsContent value="archivio">
                                <ArchivioList condominiumId={id!} />
                            </TabsContent>
                        </div>
                    </Tabs>
                </CardContent>
            </Card>
        </section>
    );
}