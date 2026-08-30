import { register, resendEmail } from "@/auth/register"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router"
import { toast } from "sonner"
import { Mail, ArrowLeft, Eye, EyeOff, Loader2, CheckCircle2, FileText, Shield, Lock, ChevronDown, ChevronUp } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"

// Componente per i consensi legali
function LegalConsentSection({ 
  onConsentChange, 
  error 
}: { 
  onConsentChange: (consent: boolean) => void
  error?: string 
}) {
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [dpaAccepted, setDpaAccepted] = useState(false)
  const [expanded, setExpanded] = useState(true)

  const allAccepted = termsAccepted && privacyAccepted && dpaAccepted

  useEffect(() => {
    onConsentChange(allAccepted)
  }, [allAccepted, onConsentChange])

  return (
    <div className="space-y-3">
      <div 
        className={cn(
          "p-4 rounded-xl border transition-all duration-200",
          allAccepted 
            ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20" 
            : "border-muted-foreground/20 bg-muted/30",
          error && "border-red-500/50 bg-red-50/50 dark:bg-red-950/20"
        )}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center gap-2">
                <Shield className={cn(
                  "h-4 w-4",
                  allAccepted ? "text-green-600" : "text-muted-foreground"
                )} />
                <span className="text-sm font-medium">
                  Accetto i documenti legali
                </span>
                {allAccepted && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
              </div>
              {expanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {error && !allAccepted && (
              <p className="text-xs text-red-500 mt-1">
                {error}
              </p>
            )}
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 space-y-2 overflow-hidden"
            >
              <div className="space-y-2 pl-1">
                {/* Termini di Servizio */}
                <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-background/50 transition-colors">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-muted-foreground/30 text-primary focus:ring-primary/20 focus:ring-2 transition-all shrink-0"
                  />
                  <label htmlFor="terms" className="text-xs text-muted-foreground cursor-pointer leading-relaxed">
                    Accetto i{" "}
                    <Link to="/terms" target="_blank" className="text-primary hover:underline font-medium">
                      Termini di Servizio
                    </Link>
                    {" "}— CondoConnect fornisce strumenti SaaS; l'amministratore è responsabile delle operazioni effettuate.
                  </label>
                </div>

                {/* Privacy Policy */}
                <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-background/50 transition-colors">
                  <input
                    type="checkbox"
                    id="privacy"
                    checked={privacyAccepted}
                    onChange={(e) => setPrivacyAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-muted-foreground/30 text-primary focus:ring-primary/20 focus:ring-2 transition-all shrink-0"
                  />
                  <label htmlFor="privacy" className="text-xs text-muted-foreground cursor-pointer leading-relaxed">
                    Accetto la{" "}
                    <Link to="/privacy" target="_blank" className="text-primary hover:underline font-medium">
                      Privacy Policy
                    </Link>
                    {" "}— I dati sono trattati in conformità al GDPR.
                  </label>
                </div>

                {/* DPA */}
                <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-background/50 transition-colors">
                  <input
                    type="checkbox"
                    id="dpa"
                    checked={dpaAccepted}
                    onChange={(e) => setDpaAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-muted-foreground/30 text-primary focus:ring-primary/20 focus:ring-2 transition-all shrink-0"
                  />
                  <label htmlFor="dpa" className="text-xs text-muted-foreground cursor-pointer leading-relaxed">
                    Accetto il{" "}
                    <Link to="/dpa" target="_blank" className="text-primary hover:underline font-medium">
                      Data Processing Agreement (DPA)
                    </Link>
                    {" "}— CondoConnect è Responsabile del Trattamento, l'Amministratore è Titolare.
                  </label>
                </div>
              </div>

              <div className="mt-2 p-2 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 rounded-lg">
                <p className="text-[10px] text-amber-700 dark:text-amber-400 flex items-start gap-1.5">
                  <span className="text-amber-500">⚠️</span>
                  <span>
                    <span className="font-medium">Importante:</span> La cancellazione di documenti, ticket o condomini è 
                    <span className="font-medium"> definitiva e irreversibile</span>. CondoConnect non fornisce backup 
                    dei dati cancellati dagli utenti.
                  </span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Riepilogo compatto se tutto accettato */}
      {allAccepted && !expanded && (
        <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
          <CheckCircle2 className="h-3 w-3" />
          <span>Tutti i documenti legali sono stati accettati</span>
        </div>
      )}
    </div>
  )
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [registered, setRegistered] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [isLoading, setIsLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [consentGiven, setConsentGiven] = useState(false)
  const [consentError, setConsentError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setConsentError("")

    // Verifica che i consensi siano stati accettati
    if (!consentGiven) {
      setConsentError("Devi accettare i documenti legali per proseguire")
      toast.error("Accetta i documenti legali", {
        description: "Devi accettare Termini, Privacy e DPA per registrarti.",
      })
      return
    }

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
      <div className="flex min-h-svh w-full items-center justify-center p-4 sm:p-6 md:p-10 bg-gradient-to-br from-background via-background to-primary/5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-2 border-green-200/60 dark:border-green-900/40 bg-gradient-to-b from-green-50/50 to-white dark:from-green-950/20 dark:to-gray-900 shadow-xl">
            <CardHeader className="text-center pb-2 pt-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40"
              >
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </motion.div>
              <CardTitle className="text-2xl font-bold">Verifica la tua email</CardTitle>
              <CardDescription className="text-base mt-1">
                Abbiamo inviato un link di verifica a{" "}
                <strong className="text-foreground">{email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pb-6">
              <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground">
                <p className="flex items-start gap-2">
                  <span>📬</span>
                  <span>
                    Apri la tua casella di posta e clicca sul pulsante di conferma.
                    Se non trovi l'email, controlla la cartella spam.
                  </span>
                </p>
              </div>
              <Button
                onClick={handleResendEmail}
                disabled={countdown > 0 || resending}
                className="w-full gap-2 h-12 text-base rounded-xl"
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
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-primary gap-1 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Torna al login
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Form di registrazione
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-4 sm:p-6 md:p-10 bg-gradient-to-br from-background via-background to-primary/5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-border/50 backdrop-blur-sm bg-background/95">
          <CardHeader className="space-y-1 text-center pb-3 sm:pb-4 px-4 sm:px-6 pt-6 sm:pt-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mx-auto mb-3 sm:mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 shadow-lg shadow-primary/10"
            >
              <Mail className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
            </motion.div>
            <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Crea un account
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Inserisci la tua email e scegli una password sicura
            </CardDescription>
          </CardHeader>

          <CardContent className="px-4 sm:px-6 pb-6 sm:pb-8">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <Field>
                <FieldLabel htmlFor="email" className="text-sm font-medium">
                  Email
                </FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nome@esempio.com"
                  required
                  className="h-11 sm:h-12 text-sm sm:text-base rounded-xl border-muted-foreground/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  autoFocus
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password" className="text-sm font-medium">
                  Password
                </FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    minLength={8}
                    placeholder="Minimo 8 caratteri"
                    required
                    className="h-11 sm:h-12 pr-10 text-sm sm:text-base rounded-xl border-muted-foreground/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Almeno 8 caratteri. Consigliamo lettere, numeri e simboli.
                </p>
              </Field>

              {/* Sezione Consensi Legali */}
              <LegalConsentSection 
                onConsentChange={setConsentGiven}
                error={consentError}
              />

              <Button
                type="submit"
                className="w-full h-11 sm:h-12 text-base font-semibold gap-2 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Registrazione in corso...
                  </>
                ) : (
                  "Crea profilo"
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Hai già un account?{" "}
                <Link
                  to="/sign-in"
                  className="font-medium text-primary hover:underline underline-offset-4 transition-colors"
                >
                  Accedi
                </Link>
              </p>

              <div className="flex items-center justify-center gap-2 pt-2">
                <span className="text-[10px] text-muted-foreground/50">🔒</span>
                <span className="text-[10px] text-muted-foreground/50">
                  I tuoi dati sono al sicuro con crittografia TLS
                </span>
              </div>
            </form>
          </CardContent>
        </Card>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-xs text-muted-foreground/50"
        >
          CondoConnect v1.0 • Tutti i diritti riservati
        </motion.p>
      </motion.div>
    </div>
  )
}