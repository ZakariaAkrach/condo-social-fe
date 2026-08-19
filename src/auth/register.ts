import { supabase } from "../lib/supabase"

const successRegistration = import.meta.env.VITE_SUPABASE_REDIRECT_SUCCESS_REGISTRATION

export async function register(
    email: string,
    password: string
) {

    const { data, error } =
        await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: successRegistration,
            },
        })

    if (error) {
        throw error
    }

    return data
}

export async function resendEmail(
    email: string
) {

    const { data, error } =
        await supabase.auth.resend({
            type: "signup",
            email,
            options: {
                emailRedirectTo: successRegistration,
            },
        })

    if (error) {
        throw error
    }

    return data
}