import { userApi } from "@/app/api/user";
import { PageLoader } from "@/components/common/PageLoader";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { useLocation, useNavigate } from "react-router";

type Membership = {
    condominiumId: string;
    condominiumName: string;
    role: "CONDO_ADMIN" | "CONDO_RESIDENT" | "CONDO_SUB_ADMIN";
    condominiumStatus: "ACTIVE" | "DELETED";
};

type Profile = {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    memberships: Membership[];
    hasAnySubscription: boolean;
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
    initialized: boolean;
    profile: Profile | null;
    refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const navigate = useNavigate();
    const location = useLocation();

    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);

    /**
     * Evita più chiamate /me contemporaneamente.
     */
    const isSyncing = useRef(false);

    /**
     * Serve per evitare che SIGNED_IN provochi
     * una seconda chiamata /me durante il bootstrap.
     */
    const isBootstrapping = useRef(true);

    /**
     * Utente caricato durante il bootstrap.
     */
    const initializedUserId = useRef<string | null>(null);

    /**
     * Manteniamo navigate in una ref.
     *
     * In questo modo syncUser NON dipende dalla
     * reference di navigate e il bootstrap non
     * viene rieseguito ad ogni cambio pagina.
     */
    const navigateRef = useRef(navigate);

    useEffect(() => {
        navigateRef.current = navigate;
    }, [navigate]);

    /**
     * =========================================================
     * SYNC USER / PROFILE
     * =========================================================
     */
    const syncUser = useCallback(async () => {
        /**
         * Evita richieste contemporanee.
         */
        if (isSyncing.current) {
            return;
        }

        isSyncing.current = true;

        try {
            const response = await userApi.me();

            setProfile(response.data);
        } catch (error: any) {
            const status = error?.response?.status;

            if (status === 401 || status === 403) {
                setUser(null);
                setProfile(null);

                await supabase.auth.signOut();

                navigateRef.current("/sign-in", {
                    replace: true,
                });
            }
        } finally {
            isSyncing.current = false;
        }
    }, []);

    /**
     * =========================================================
     * REFRESH PROFILE
     * =========================================================
     */
    const refreshProfile = useCallback(async () => {
        setLoading(true);

        try {
            await syncUser();
        } finally {
            setLoading(false);
        }
    }, [syncUser]);

    /**
     * =========================================================
     * REDIRECT LOGIC
     * =========================================================
     */
    const handleRedirect = useCallback(
        (
            memberships: Membership[],
            currentPath: string,
            userData: Profile
        ) => {
            const isAdmin =
                memberships.some(
                    (m) => m.role === "CONDO_ADMIN"
                ) || userData.hasAnySubscription;

            const isSubAdmin = memberships.some(
                (m) => m.role === "CONDO_SUB_ADMIN"
            );

            const hasDeletedMemberships =
                memberships.some(
                    (m) =>
                        m.condominiumStatus === "DELETED"
                );

            const activeMemberships =
                memberships.filter(
                    (m) =>
                        m.condominiumStatus === "ACTIVE"
                );

            /**
             * =====================================================
             * SOLO CONDOMINI CANCELLATI
             * =====================================================
             */
            if (
                hasDeletedMemberships &&
                activeMemberships.length === 0 &&
                !isAdmin
            ) {
                if (
                    currentPath !==
                    "/deleted-condominium"
                ) {
                    navigate("/deleted-condominium", {
                        replace: true,
                    });
                }

                return;
            }

            /**
             * =====================================================
             * SUB ADMIN
             * =====================================================
             */
            if (isSubAdmin) {
                if (
                    currentPath.startsWith("/admin")
                ) {
                    return;
                }

                navigate("/admin/dashboard", {
                    replace: true,
                });

                return;
            }

            /**
             * =====================================================
             * ADMIN
             * =====================================================
             */
            if (
                isAdmin &&
                currentPath.startsWith("/admin")
            ) {
                return;
            }

            /**
             * =====================================================
             * RESIDENT
             * =====================================================
             */
            if (
                !isAdmin &&
                memberships.length > 0 &&
                currentPath.startsWith("/resident")
            ) {
                return;
            }

            /**
             * =====================================================
             * ONBOARDING
             * =====================================================
             */
            if (
                memberships.length === 0 &&
                currentPath === "/onboarding"
            ) {
                return;
            }

            /**
             * =====================================================
             * REDIRECT PRINCIPALE
             * =====================================================
             */
            if (isAdmin) {
                navigate("/admin/dashboard", {
                    replace: true,
                });
            } else if (memberships.length === 0) {
                navigate("/onboarding", {
                    replace: true,
                });
            } else {
                navigate("/resident/dashboard", {
                    replace: true,
                });
            }
        },
        [navigate]
    );

    /**
     * =========================================================
     * REDIRECT EFFECT
     * =========================================================
     *
     * Questo effect può tranquillamente reagire al cambio
     * pagina.
     *
     * IMPORTANTE:
     * qui NON viene chiamato /me.
     */
    useEffect(() => {
        if (!initialized || profile === null) {
            return;
        }

        const currentPath = location.pathname;

        const publicPaths = [
            "/",
            "/sign-up",
            "/forgot-password",
            "/reset-password",
            "/auth/callback",
        ];

        if (publicPaths.includes(currentPath)) {
            return;
        }

        handleRedirect(
            profile.memberships,
            currentPath,
            profile
        );
    }, [
        initialized,
        profile,
        location.pathname,
        handleRedirect,
    ]);

    /**
     * =========================================================
     * AUTH BOOTSTRAP
     * =========================================================
     *
     * ATTENZIONE:
     *
     * Questo effect DEVE partire una sola volta per mount.
     *
     * Non mettere navigate / location / refreshProfile
     * nelle dipendenze.
     */
    useEffect(() => {
        let mounted = true;

        async function loadSession() {
            try {
                const {
                    data,
                    error,
                } = await supabase.auth.getSession();

                if (error) {
                    throw error;
                }

                if (!mounted) {
                    return;
                }

                const currentUser =
                    data.session?.user ?? null;

                setUser(currentUser);

                if (currentUser) {
                    initializedUserId.current =
                        currentUser.id;

                    /**
                     * Prima carichiamo /me.
                     *
                     * Solo dopo rendiamo l'app disponibile.
                     */
                    await syncUser();
                } else {
                    setProfile(null);
                }
            } catch {
                if (!mounted) {
                    return;
                }

                setUser(null);
                setProfile(null);
            } finally {
                if (!mounted) {
                    return;
                }

                /**
                 * Bootstrap completato.
                 */
                isBootstrapping.current = false;

                setLoading(false);
                setInitialized(true);
            }
        }

        loadSession();

        /**
         * =====================================================
         * SUPABASE AUTH LISTENER
         * =====================================================
         */
        const {
            data: {
                subscription,
            },
        } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!mounted) {
                    return;
                }

                const currentUser =
                    session?.user ?? null;

                /**
                 * INITIAL_SESSION
                 *
                 * È già gestito da getSession().
                 */
                if (
                    event === "INITIAL_SESSION"
                ) {
                    return;
                }

                /**
                 * =================================================
                 * SIGNED_IN
                 * =================================================
                 */
                if (event === "SIGNED_IN") {
                    setUser(currentUser);

                    /**
                     * Durante il bootstrap non facciamo
                     * una seconda /me.
                     */
                    if (
                        isBootstrapping.current
                    ) {
                        return;
                    }

                    /**
                     * Se è lo stesso utente già caricato,
                     * non facciamo una seconda /me.
                     */
                    if (
                        currentUser &&
                        currentUser.id ===
                            initializedUserId.current
                    ) {
                        return;
                    }

                    if (currentUser) {
                        initializedUserId.current =
                            currentUser.id;

                        await refreshProfile();
                    }

                    return;
                }

                /**
                 * =================================================
                 * TOKEN_REFRESHED
                 * =================================================
                 *
                 * NON facciamo /me.
                 */
                if (
                    event === "TOKEN_REFRESHED"
                ) {
                    setUser(currentUser);

                    return;
                }

                /**
                 * =================================================
                 * USER_UPDATED
                 * =================================================
                 */
                if (
                    event === "USER_UPDATED"
                ) {
                    setUser(currentUser);

                    if (currentUser) {
                        await refreshProfile();
                    }

                    return;
                }

                /**
                 * =================================================
                 * SIGNED_OUT
                 * =================================================
                 */
                if (event === "SIGNED_OUT") {
                    initializedUserId.current =
                        null;

                    setUser(null);
                    setProfile(null);

                    navigateRef.current(
                        "/sign-in",
                        {
                            replace: true,
                        }
                    );

                    return;
                }

                /**
                 * =================================================
                 * PASSWORD_RECOVERY
                 * =================================================
                 */
                if (
                    event ===
                    "PASSWORD_RECOVERY"
                ) {
                    setUser(currentUser);

                    return;
                }

                /**
                 * Fallback.
                 */
                setUser(currentUser);
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [refreshProfile, syncUser]);

    /**
     * =========================================================
     * INITIAL AUTH LOADING
     * =========================================================
     *
     * Non renderizziamo App finché sessione + /me
     * non sono stati risolti.
     */
    if (!initialized) {
        return <PageLoader />;
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                initialized,
                profile,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used within AuthProvider"
        );
    }

    return context;
}