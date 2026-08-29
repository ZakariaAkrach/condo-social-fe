import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
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
    Ticket,
    Megaphone,
    FolderArchive,
} from "lucide-react";
import { condominiumApi, type CondominiumDto } from "@/app/api/condominium";
import { MembriList } from "@/components/adminDashboard/MembriList";
import { ArchivioList } from "@/components/adminDashboard/ArchivioList";
import { AdminTicketList } from "@/components/adminDashboard/AdminTicketList";
import { AdminPostsList } from "@/components/adminDashboard/AdminPostsList";

type TabType = "ticket" | "membri" | "comunicazioni" | "archivio";

export default function AdminCondominiumDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const [condominium, setCondominium] = useState<CondominiumDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Recupera il tab salvato o usa "ticket" come default
    const [activeTab, setActiveTab] = useState<TabType>(() => {
        const savedTab = sessionStorage.getItem(`condominium-tab-${id}`);
        return (savedTab as TabType) || "ticket";
    });

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

    // Salva il tab attivo quando cambia
    const handleTabChange = (value: string) => {
        setActiveTab(value as TabType);
        sessionStorage.setItem(`condominium-tab-${id}`, value);
    };

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
        <section className="space-y-4 sm:space-y-6">
            {/* Header con pulsante indietro */}
            <div className="flex flex-col gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className="w-fit text-muted-foreground hover:text-foreground gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Condomini
                </Button>

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                            <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                                {condominium.name}
                            </h2>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Home className="h-3.5 w-3.5" />
                                {condominium.address}, {condominium.city} ({condominium.cap})
                            </p>
                        </div>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                        Attivo
                    </span>
                </div>
            </div>

            <Card className="overflow-hidden">
                <CardContent className="p-0">
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                        {/* Contenitore tab con scroll orizzontale su mobile */}
                        <div className="border-b border-border/40 bg-muted/20 px-2 pt-2 sm:px-4 sm:pt-3">
                            <div className="overflow-x-auto scrollbar-hide">
                                <TabsList className="inline-flex h-auto w-auto gap-1 rounded-lg bg-transparent p-1 sm:gap-2">
                                    <TabsTrigger
                                        value="ticket"
                                        className="rounded-lg px-3 py-2 text-xs font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm hover:bg-muted/80 sm:px-4 sm:py-2.5 sm:text-sm whitespace-nowrap"
                                    >
                                        <Ticket className="h-4 w-4 sm:mr-2" />
                                        <span className="hidden sm:inline">Ticket</span>
                                        <span className="sm:hidden">Ticket</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="membri"
                                        className="rounded-lg px-3 py-2 text-xs font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm hover:bg-muted/80 sm:px-4 sm:py-2.5 sm:text-sm whitespace-nowrap"
                                    >
                                        <Users className="h-4 w-4 sm:mr-2" />
                                        <span className="hidden sm:inline">Membri</span>
                                        <span className="sm:hidden">Membri</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="comunicazioni"
                                        className="rounded-lg px-3 py-2 text-xs font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm hover:bg-muted/80 sm:px-4 sm:py-2.5 sm:text-sm whitespace-nowrap"
                                    >
                                        <Megaphone className="h-4 w-4 sm:mr-2" />
                                        <span className="hidden sm:inline">Comunicazioni</span>
                                        <span className="sm:hidden">Comunicazioni</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="archivio"
                                        className="rounded-lg px-3 py-2 text-xs font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm hover:bg-muted/80 sm:px-4 sm:py-2.5 sm:text-sm whitespace-nowrap"
                                    >
                                        <FolderArchive className="h-4 w-4 sm:mr-2" />
                                        <span className="hidden sm:inline">Archivio</span>
                                        <span className="sm:hidden">Archivio</span>
                                    </TabsTrigger>
                                </TabsList>
                            </div>
                        </div>

                        <div className="p-3 sm:p-6 bg-background">
                            <TabsContent value="ticket" className="mt-0">
                                <AdminTicketList condominiumId={id!} />
                            </TabsContent>
                            <TabsContent value="membri" className="mt-0">
                                <MembriList condominiumId={id!} />
                            </TabsContent>
                            <TabsContent value="comunicazioni" className="mt-0">
                                <AdminPostsList condominiumId={id!} />
                            </TabsContent>
                            <TabsContent value="archivio" className="mt-0">
                                <ArchivioList condominiumId={id!} />
                            </TabsContent>
                        </div>
                    </Tabs>
                </CardContent>
            </Card>
        </section>
    );
}