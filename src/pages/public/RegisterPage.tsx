import { register, resendEmail } from "@/auth/register"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { Link } from "react-router"
import { toast } from "sonner"
import { Mail, ArrowLeft, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [registered, setRegistered] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [isLoading, setIsLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const form = e.currentTarget
    const formData = new FormData(form)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const data = await register(email, password)
      if (data.user?.identities?.length === 0) {
        toast.warning("Profilo già esistente", {
          description: "Prova ad accedere o reimposta la password.",
        })
      } else {
        toast.success("Registrazione completata", {
          description: "Controlla la tua email per verificare l'account.",
        })
        setEmail(email)
        setRegistered(true)
      }
    } catch (error: any) {
      toast.error("Errore durante la registrazione", {
        description: error?.message || "Riprova più tardi",
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleResendEmail() {
    if (countdown > 0 || resending) return
    setResending(true)
    try {
      await resendEmail(email)
      toast.success("Email inviata con successo")
      setCountdown(60)
    } catch (error: any) {
      toast.error(error?.message || "Errore nell'invio della mail")
    } finally {
      setResending(false)
    }
  }

  useEffect(() => {
    if (!registered || countdown === 0) return

    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(interval)
  }, [registered, countdown])

  // Se la registrazione è avvenuta, mostra la schermata di verifica
  if (registered) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-2 border-green-200/60 dark:border-green-900/40 bg-gradient-to-b from-green-50/50 to-white dark:from-green-950/20 dark:to-gray-900 shadow-lg">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
                <CheckCircle2 className="h-7 w-7 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl font-bold">Verifica la tua email</CardTitle>
              <CardDescription className="text-base mt-1">
                Abbiamo inviato un link di verifica a{" "}
                <strong className="text-foreground">{email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                <p>
                  📬 Apri la tua casella di posta e clicca sul pulsante di conferma.
                  Se non trovi l’email, controlla la cartella spam.
                </p>
              </div>
              <Button
                onClick={handleResendEmail}
                disabled={countdown > 0 || resending}
                className="w-full gap-2"
                variant={countdown > 0 ? "outline" : "default"}
              >
                {resending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                {countdown > 0
                  ? `Rimanda email tra ${countdown}s`
                  : "Invia di nuovo l'email"}
              </Button>
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

  // Form di registrazione
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="shadow-xl border-border/50">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Crea un account</CardTitle>
            <CardDescription>
              Inserisci la tua email e scegli una password sicura
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nome@esempio.com"
                  required
                  className="h-11"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    minLength={8}
                    placeholder="Minimo 8 caratteri"
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Almeno 8 caratteri. Consigliamo lettere, numeri e simboli.
                </p>
              </Field>

              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {isLoading ? "Registrazione in corso..." : "Crea profilo"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Hai già un account?{" "}
                <Link
                  to="/sign-in"
                  className="font-medium text-primary hover:underline underline-offset-4"
                >
                  Accedi
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Registrandoti, accetti le nostre{" "}
          <a href="#" className="underline underline-offset-2 hover:text-primary">
            Condizioni di Servizio
          </a>{" "}
          e la{" "}
          <a href="#" className="underline underline-offset-2 hover:text-primary">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  )
}