import { Spinner } from "@/components/ui/spinner"
import { supabase } from "@/lib/supabase"
import { useEffect } from "react"
import { useNavigate } from "react-router"

export default function AuthCallbackRegistrationPage() {
  const navigate = useNavigate()

  useEffect(() => {
    async function verifyAccount() {
      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)
      const access_token = params.get("access_token")
      const refresh_token = params.get("refresh_token")

      if (!access_token || !refresh_token) {
        navigate("/sign-in")
        return
      }

      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      })

      if (error) {
        console.error(error)
        navigate("/sign-in")
        return
      }
      
      navigate("/dashboard")
    }
    verifyAccount()
  }, [navigate])

  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner className="size-6 text-primary" />
        <div className="text-center">
          <h2 className="text-lg font-semibold">Verifica in corso…</h2>
          <p className="text-sm text-muted-foreground">
            Conferma del profilo, attendi un momento.
          </p>
        </div>
      </div>
    </div>
  )
}