import { userApi } from "@/app/api/user"
import { useAuth } from "@/auth/AuthProvider"
import { useState } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { condominiumApi } from "@/app/api/condominium"

export default function OnboardingPage() {
    const navigate = useNavigate()
    const { user, refreshProfile } = useAuth()
    const [step, setStep] = useState(1)

    // Step 1: profilo
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")

    // Step 2: condominio
    const [condoName, setCondoName] = useState("")
    const [city, setCity] = useState("")
    const [address, setAddress] = useState("")
    const [cap, setCap] = useState("")
    const [country, setCountry] = useState("Italia") // modificabile
    const [condoEmail, setCondoEmail] = useState(user?.email || "")

    const [loading, setLoading] = useState(false)

    // Step 1: salva nome/cognome
    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await userApi.updateProfileOnboarding({ firstName, lastName })
            toast.success("Profilo aggiornato!")
            setStep(2)
        } catch (error) {
            toast.error("Errore nel salvare il profilo")
        }
    }

    // Step 2: crea condominio
    const handleCondoSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await condominiumApi.createCondominium({
                name: condoName,
                city,
                address,
                cap,
                country,
                condominiumEmail: condoEmail,
            })
            toast.success("Condominio creato con successo!")

            await refreshProfile();
            
            navigate("/admin/dashboard")
        } catch (error: any) {
            const msg = error?.response?.data?.message || "Errore nella creazione del condominio"
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 p-6">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Benvenuto! {step === 1 ? "Completa il tuo profilo" : "Crea il tuo primo condominio"}</CardTitle>
                    <CardDescription>
                        {step === 1
                            ? "Inserisci il tuo nome e cognome per personalizzare l'esperienza."
                            : "Inserisci i dati del condominio che amministri."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {step === 1 ? (
                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">Nome</Label>
                                    <Input
                                        id="firstName"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Cognome</Label>
                                    <Input
                                        id="lastName"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full">
                                Continua
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleCondoSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="condoName">Nome condominio</Label>
                                <Input
                                    id="condoName"
                                    value={condoName}
                                    onChange={(e) => setCondoName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city">Città</Label>
                                <Input
                                    id="city"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Indirizzo</Label>
                                <Input
                                    id="address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cap">CAP</Label>
                                <Input
                                    id="cap"
                                    value={cap}
                                    onChange={(e) => setCap(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="country">Paese</Label>
                                <Input
                                    id="country"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="condoEmail">Email del condominio</Label>
                                <Input
                                    id="condoEmail"
                                    type="email"
                                    value={condoEmail}
                                    onChange={(e) => setCondoEmail(e.target.value)}
                                    placeholder="email@condominio.it"
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Creazione in corso..." : "Crea condominio"}
                            </Button>
                        </form>
                    )}
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">
                    {step === 1 ? "Passo 1 di 2" : "Passo 2 di 2"}
                </CardFooter>
            </Card>
        </div>
    )
}