import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { Loader2, KeyRound, Eye, EyeOff, AlertTriangle } from "lucide-react"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [tokenValid, setTokenValid] = useState<boolean | null>(null) // null=caricamento, true=ok, false=errore
  const navigate = useNavigate()

  useEffect(() => {
    // Verifica che l'URL contenga il token di recovery
    const hash = window.location.hash
    if (!hash || hash === "") {
      setTokenValid(false)
      return
    }
    // Non è necessario fare nulla qui: Supabase gestirà il token quando chiamiamo updateUser?
    // In realtà dobbiamo verificare il token e autenticare l'utente.
    // Possiamo chiamare supabase.auth.verifyOtp con il token.
    // Estrai il token dall'hash: es. #access_token=xxx&refresh_token=yyy&type=recovery
    // Prendiamo solo l'access_token
    const params = new URLSearchParams(hash.substring(1))
    const access_token = params.get("access_token")
    const refresh_token = params.get("refresh_token")
    const type = params.get("type")

    if (type !== "recovery" || !access_token) {
      setTokenValid(false)
      return
    }

    // Imposta la sessione con i token ottenuti
    supabase.auth
      .setSession({
        access_token,
        refresh_token: refresh_token ?? "",
      })
      .then(({ error }) => {
        if (error) {
          setTokenValid(false)
        } else {
          setTokenValid(true)
        }
      })
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      toast.success("Password aggiornata con successo", {
        description: "Ora puoi accedere con la nuova password.",
      })
      // Reindirizza al login (o alla dashboard)
      navigate("/sign-in")
    } catch (err: any) {
      setError(err?.message || "Impossibile aggiornare la password.")
    } finally {
      setIsLoading(false)
    }
  }

  if (tokenValid === null) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (tokenValid === false) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader className="pb-2">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-7 w-7 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold">Link non valido</CardTitle>
            <CardDescription>
              Il link per il reset password è scaduto o non valido. Richiedi un nuovo link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/forgot-password")} className="w-full">
              Richiedi nuovo link
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="shadow-xl border-border/50">
          <CardHeader className="space-y-1 text-center pb-4">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <KeyRound className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Reimposta password</CardTitle>
            <CardDescription className="text-base">
              Scegli una nuova password sicura per il tuo account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium">
                  Nuova password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimo 8 caratteri"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Almeno 8 caratteri. Consigliamo lettere, numeri e simboli.
                </p>
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full h-11 text-base font-semibold gap-2" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Aggiornamento...
                  </>
                ) : (
                  "Imposta nuova password"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}