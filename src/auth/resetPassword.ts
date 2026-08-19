import { supabase } from "@/lib/supabase"

const successRegistration = import.meta.env.VITE_SUPABASE_REDIRECT_RESET_PASSWORD

export async function sendPasswordResetEmail(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: successRegistration,
  })
  if (error) throw error
}