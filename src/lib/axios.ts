import axios from "axios"
import { supabase } from "./supabase"

const baseUrl = import.meta.env.VITE_SPRING_BOOT_BASE_URL

export const api = axios.create({
    baseURL: baseUrl
})

api.interceptors.request.use(
    async (config) => {
        const {
            data: {
                session
            }
        } = await supabase.auth.getSession()

        if (session?.access_token) {

            config.headers.Authorization =
                `Bearer ${session.access_token}`

        }
        return config
    }
)