import { userApi } from "@/app/api/user";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router";

type Membership = {
    condominiumId: string;
    condominiumName: string;
    role: "CONDO_ADMIN" | "CONDO_RESIDENT" | "CONDO_SUB_ADMIN";
};

type Profile = {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    memberships: Membership[];
    hasAnySubscription: boolean;
};

// 👇 Aggiungiamo refreshProfile al tipo del contesto
const AuthContext = createContext<{
    user: User | null;
    loading: boolean;
    profile: Profile | null;
    refreshProfile: () => Promise<void>;
} | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    const location = useLocation();

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<Profile | null>(null);
    const isSyncing = useRef(false);

    // Sincronizza il profilo (chiamata a /me)
    async function syncUser() {
        if (isSyncing.current) return;
        isSyncing.current = true;
        try {
            const response = await userApi.me();
            setProfile(response.data);
        } catch (error: any) {
            console.error("❌ Errore syncUser:", error);
            if (error?.response?.status === 401 || error?.response?.status === 403) {
                await supabase.auth.signOut();
                setUser(null);
                setProfile(null);
                navigate("/sign-in");
            }
        } finally {
            isSyncing.current = false;
        }
    }

    // 👇 Esponiamo syncUser come refreshProfile
    const refreshProfile = async () => {
        await syncUser();
    };

    // Logica di redirect (con controlli per evitare loop)
    function handleRedirect(memberships: Membership[], currentPath: string, userData: Profile) {
        const isAdmin = memberships.some((m) => m.role === "CONDO_ADMIN") || userData.hasAnySubscription;

        const isSubAdmin = memberships.some((m) => m.role === "CONDO_SUB_ADMIN");

        if (isSubAdmin && currentPath.startsWith("/admin")) return;

        if(isSubAdmin) {
            navigate("/admin/dashboard");
            return
        }

        // Se siamo già sulla rotta giusta, non fare nulla
        if (isAdmin && currentPath.startsWith("/admin")) return;
        if (!isAdmin && memberships.length > 0 && currentPath.startsWith("/resident")) return;
        if (memberships.length === 0 && currentPath === "/onboarding") return;

        // Altrimenti reindirizza
        if (isAdmin) {
            navigate("/admin/dashboard");
        } else if (memberships.length === 0) {
            navigate("/onboarding");
        } else {
            navigate("/resident/dashboard");
        }
    }

    // Effetto che reagisce a profile e percorso
    useEffect(() => {
        if (profile === null) return;
        const currentPath = location.pathname;
        const publicPaths = [
            "/",
            "/sign-up",
            "/forgot-password",
            "/reset-password",
            "/auth/callback",
        ];
        if (publicPaths.includes(currentPath)) return;
        handleRedirect(profile.memberships, currentPath, profile);
    }, [profile, location.pathname]);

    // Inizializzazione
    useEffect(() => {
        async function loadSession() {
            const { data } = await supabase.auth.getSession();
            const currentUser = data.session?.user ?? null;
            setUser(currentUser);
            if (currentUser) await syncUser();
            setLoading(false);
        }
        loadSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                await syncUser();
            } else {
                setProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, profile, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
}