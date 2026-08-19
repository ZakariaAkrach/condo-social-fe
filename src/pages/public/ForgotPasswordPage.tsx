import { sendPasswordResetEmail } from "@/auth/resetPassword"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Link } from "react-router"
import { toast } from "sonner"
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [isSent, setIsSent] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)
        try {
            await sendPasswordResetEmail(email)
            setIsSent(true)
            toast.success("Email inviata", {
                description: "Controlla la tua casella di posta e segui le istruzioni.",
            })
        } catch (err: any) {
            toast.error("Errore", {
                description: err?.message || "Impossibile inviare l'email. Riprova.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (isSent) {
        return (
            <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="border-2 border-blue-200/60 dark:border-blue-900/40 bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-950/20 dark:to-gray-900 shadow-lg">
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
                                <CheckCircle2 className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                            </div>
                            <CardTitle className="text-2xl font-bold">Email inviata</CardTitle>
                            <CardDescription className="text-base mt-1">
                                Abbiamo inviato un link di reset a <strong className="text-foreground">{email}</strong>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                                <p>
                                    📬 Apri la tua email e clicca sul pulsante “Reimposta password”.
                                    Se non la trovi, controlla la cartella spam.
                                </p>
                            </div>
                            <div className="text-center">
                                <Link
                                    to="/sign-in"
                                    className="inline-flex items-center text-sm text-muted-foreground hover:text-primary gap-1"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Torna al login
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="shadow-xl border-border/50">
                    <CardHeader className="space-y-1 text-center pb-4">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Mail className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Password dimenticata?</CardTitle>
                        <CardDescription className="text-base">
                            Inserisci la tua email e ti invieremo un link per reimpostarla.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label htmlFor="email" className="text-sm font-medium">
                                    Email
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="nome@esempio.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-11"
                                />
                            </div>
                            <Button type="submit" className="w-full h-11 text-base font-semibold gap-2" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Invio in corso...
                                    </>
                                ) : (
                                    "Invia link di reset"
                                )}
                            </Button>
                            <p className="text-center text-sm text-muted-foreground">
                                <Link to="/sign-in" className="font-medium text-primary hover:underline underline-offset-4">
                                    Torna al login
                                </Link>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}