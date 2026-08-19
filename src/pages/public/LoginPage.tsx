import { useAuth } from "@/auth/AuthProvider"
import { login } from "@/auth/login"
import { PageLoader } from "@/components/common/PageLoader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Link, Navigate } from "react-router"
import { useState } from "react"
import { toast } from "sonner"
import { Loader2, Eye, EyeOff, LogIn, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const { user, loading, profile } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  if (loading) {
    return <PageLoader />
  }

  // Se già loggato, reindirizza alla dashboard corretta
  if (user && profile) {
    // Caso 1: nessun condominio → onboarding
    if (profile.memberships.length === 0 && (!profile.firstName || !profile.lastName) && !profile.hasAnySubscription) {
      return <Navigate to="/onboarding" replace />
    }

    // Caso 2: ha condomini → dashboard in base al ruolo
    const isAdmin = profile.memberships.some(m => m.role === "CONDO_ADMIN") || profile.hasAnySubscription
    const path = isAdmin ? "/admin/dashboard" : "/resident/dashboard"
    return <Navigate to={path} replace />
  }

  // Se utente loggato ma profilo non ancora caricato, mostra loader
  if (user && !profile) {
    return <PageLoader />
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    const form = e.currentTarget
    const formData = new FormData(form)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      await login(email, password)
      // Il redirect sarà gestito da AuthProvider (onAuthStateChange -> syncUser -> handleRedirect)
    } catch (err: any) {
      console.error(err)
      const message =
        err?.message === "Invalid login credentials"
          ? "Email o password non validi."
          : "Si è verificato un errore. Riprova."
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="shadow-xl border-border/50">
          <CardHeader className="space-y-1 text-center pb-4">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Bentornato</CardTitle>
            <CardDescription className="text-base">
              Accedi al tuo account per continuare
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nome@esempio.com"
                  required
                  className="h-11"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium leading-none">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-muted-foreground hover:text-primary underline-offset-4 hover:underline transition-colors"
                  >
                    Password dimenticata?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    className="h-11 pr-10"
                    autoComplete="current-password"
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
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Accesso in corso...
                  </>
                ) : (
                  <>
                    Accedi
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Non hai un account?{" "}
                <Link
                  to="/sign-up"
                  className="font-medium text-primary hover:underline underline-offset-4"
                >
                  Registrati
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}