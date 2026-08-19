import { useEffect, useState } from "react";
import { Loader2, CheckCircle, XCircle, Mail, Building, User, Eye, EyeOff } from "lucide-react";
import { publicApi } from "@/app/api/publicApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router";

export default function InviteNewMemberPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const invitationCode = searchParams.get("invitationCode");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [invitationData, setInvitationData] = useState<{
        email: string;
        firstName: string;
        lastName: string;
        condominiumName: string;
    } | null>(null);

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!invitationCode) {
            setError("Codice di invito mancante. Verifica il link ricevuto via email.");
            setLoading(false);
            return;
        }

        const validate = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await publicApi.validate({ invitationCode });
                if (response.data) {
                    setInvitationData({
                        email: response.data.email,
                        firstName: response.data.firstName,
                        lastName: response.data.lastName,
                        condominiumName: response.data.condominiumName,
                    });
                } else {
                    setError("Codice non valido.");
                }
            } catch (err: any) {
                const msg = err?.response?.data?.message || "Errore durante la validazione.";
                setError(msg);
            } finally {
                setLoading(false);
            }
        };

        validate();
    }, [invitationCode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password.length < 8) {
            setError("La password deve contenere almeno 8 caratteri.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Le password non coincidono.");
            return;
        }

        setSubmitting(true);
        try {
            await publicApi.confirm({ invitationCode: invitationCode!, password });
            setSuccess(true);
            toast.success("Password impostata! Ora puoi accedere.");
            setTimeout(() => navigate("/login"), 3000);
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Errore durante l'impostazione della password.";
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-foreground">Verifica del tuo invito...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-background">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <XCircle className="h-6 w-6 text-destructive" />
                            Invito non valido
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{error}</p>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={() => navigate("/")}>
                            Torna alla home
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-background">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-6 w-6 text-green-500" />
                            Password impostata!
                        </CardTitle>
                        <CardDescription>
                            Ora puoi accedere alla piattaforma con la tua nuova password.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button className="w-full" onClick={() => navigate("/login")}>
                            Vai al login
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <Card className="max-w-md w-full">
                <CardHeader>
                    <CardTitle className="text-center">
                        Benvenuto in {invitationData?.condominiumName}
                    </CardTitle>
                    <CardDescription className="text-center">
                        Ciao {invitationData?.firstName}, imposta la tua password per accedere.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-3 p-4 rounded-lg bg-muted">
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <span className="text-foreground">
                                {invitationData?.firstName} {invitationData?.lastName}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <span className="text-foreground">{invitationData?.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Building className="h-5 w-5 text-muted-foreground" />
                            <span className="text-foreground">{invitationData?.condominiumName}</span>
                        </div>
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Nuova password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Minimo 8 caratteri"
                                    required
                                    disabled={submitting}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Conferma password</Label>
                            <div className="relative">
                                <Input
                                    id="confirm-password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Ripeti la password"
                                    required
                                    disabled={submitting}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={submitting}>
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Imposta password"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}