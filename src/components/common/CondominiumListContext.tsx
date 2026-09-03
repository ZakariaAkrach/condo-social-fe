// src/components/common/CondominiumListContext.tsx
import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode, useRef } from "react";
import { condominiumApi, type CondominiumDto } from "@/app/api/condominium";
import { useAuth } from "@/auth/AuthProvider";

type CondominiumListContextType = {
  condominiums: CondominiumDto[];
  loading: boolean;
  initialized: boolean; // 🔥 Aggiunto: indica se il caricamento iniziale è completo
  refreshCondominiums: () => Promise<void>;
};

const CondominiumListContext = createContext<CondominiumListContextType | undefined>(undefined);

export function CondominiumListProvider({ children }: { children: ReactNode }) {
  const { profile, loading: authLoading } = useAuth();
  const [condominiums, setCondominiums] = useState<CondominiumDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false); // 🔥 Nuovo stato
  const isInitializedRef = useRef(false);

  const refreshCondominiums = useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await condominiumApi.fetchCondominiums({
        page: 0,
        size: 100,
        sortBy: "name",
        ascending: true,
      });
      setCondominiums(response.data || []);
    } catch (error) {
      console.error("Errore nel caricamento dei condomini:", error);
    } finally {
      setLoading(false);
      setInitialized(true); // 🔥 Segna come inizializzato
    }
  }, [loading]);

  useEffect(() => {
    if (!authLoading && profile && !isInitializedRef.current) {
      isInitializedRef.current = true;
      console.log('🏢 CondominiumListProvider - Caricamento condomini');
      refreshCondominiums();
    }
  }, [authLoading, profile, refreshCondominiums]);

  const value = useMemo(() => ({
    condominiums,
    loading,
    initialized, // 🔥 Esposto
    refreshCondominiums,
  }), [condominiums, loading, initialized, refreshCondominiums]);

  return (
    <CondominiumListContext.Provider value={value}>
      {children}
    </CondominiumListContext.Provider>
  );
}

export function useCondominiumList() {
  const context = useContext(CondominiumListContext);
  if (!context) throw new Error("useCondominiumList must be used within CondominiumListProvider");
  return context;
}