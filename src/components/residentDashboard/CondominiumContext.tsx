import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useAuth } from "@/auth/AuthProvider";

type CondominiumContextType = {
  condominiumId: string | null;
  condominiumName: string | null;
  role: string | null;
  setCondominium: (id: string) => void;
};

const CondominiumContext = createContext<CondominiumContextType | undefined>(undefined);

export function CondominiumProvider({ children }: { children: ReactNode }) {
  const { profile, loading } = useAuth();
  const [condominiumId, setCondominiumId] = useState<string | null>(null);
  const [condominiumName, setCondominiumName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && profile && profile.memberships.length > 0) {
      const first = profile.memberships[0];
      setCondominiumId(first.condominiumId);
      setCondominiumName(first.condominiumName);
      setRole(first.role);
    }
  }, [loading, profile]);

  const setCondominium = (id: string) => {
    const membership = profile?.memberships.find((m) => m.condominiumId === id);
    if (membership) {
      setCondominiumId(id);
      setCondominiumName(membership.condominiumName);
      setRole(membership.role);
    }
  };

  return (
    <CondominiumContext.Provider
      value={{ condominiumId, condominiumName, role, setCondominium }}
    >
      {children}
    </CondominiumContext.Provider>
  );
}

export function useCondominium() {
  const context = useContext(CondominiumContext);
  if (!context) throw new Error("useCondominium must be used within CondominiumProvider");
  return context;
}