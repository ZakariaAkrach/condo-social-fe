// src/context/NotificationContext.tsx
import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { notificationApi, type NotificationResponse } from '@/app/api/notification';
import { useAuth } from '@/auth/AuthProvider';
import { useCondominium } from '@/components/residentDashboard/CondominiumContext';
import { useCondominiumList } from '@/components/common/CondominiumListContext';
import { toast } from 'sonner';

interface NotificationContextType {
  notifications: NotificationResponse[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: (reset?: boolean) => Promise<void>;
  markAsRead: (notificationId: string, condoId: string) => Promise<boolean>;
  groupedNotifications: {
    condominiumId: string;
    condominiumName: string;
    notifications: NotificationResponse[];
    unreadCount: number;
    totalCount: number;
  }[];
  totalElements: number;
  hasMore: boolean;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children, isAdmin = false }: { children: React.ReactNode; isAdmin?: boolean }) {
  const { profile, loading: authLoading } = useAuth();
  const condominiumContext = !isAdmin ? useCondominium() : null;
  const currentCondoId = condominiumContext?.condominiumId;
  const { 
    condominiums: contextCondominiums, 
    loading: condominiumsLoading,
    initialized: condominiumsInitialized
  } = useCondominiumList();

  // State
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [groupedNotifications, setGroupedNotifications] = useState<NotificationContextType['groupedNotifications']>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  // Refs
  const loadingRef = useRef(false);
  const pollingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPollingActiveRef = useRef(true);
  const isInitializedRef = useRef(false);
  const pageRef = useRef(0);
  const lastFetchRef = useRef<string>('');
  const unreadCountRef = useRef(0);
  const mountedRef = useRef(true);
  const isFetchingCountRef = useRef(false);
  const isPollingStartedRef = useRef(false);
  const consecutiveErrorsRef = useRef(0);

  // Aggiorna il ref quando unreadCount cambia
  useEffect(() => {
    unreadCountRef.current = unreadCount;
  }, [unreadCount]);

  // Cleanup mount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Ottieni la lista dei condomini
  const getUserCondominiums = useCallback(() => {
    if (isAdmin) {
      return contextCondominiums;
    }
    return (profile?.memberships || []).map((m) => ({
      id: m.condominiumId,
      name: m.condominiumName,
    }));
  }, [isAdmin, contextCondominiums, profile]);

  // Fetch notifiche per un singolo condominio (solo prima pagina - per la UI)
  const fetchNotificationsForCondominium = useCallback(async (condoId: string, pageNum: number = 0) => {
    try {
      const response = await notificationApi.fetchNotifications(
        condoId,
        pageNum,
        10,
        false,
        "createdAt"
      );

      if (response.success) {
        return {
          notifications: response.data || [],
          total: response.totalElements || 0,
        };
      }
      return { notifications: [], total: 0 };
    } catch (error) {
      console.error(`Errore fetch notifiche per condominio ${condoId}:`, error);
      return { notifications: [], total: 0 };
    }
  }, []);

  // 🔥 Funzione per fetch del conteggio
  const refreshUnreadCount = useCallback(async () => {
    // Evita fetch concorrenti
    if (isFetchingCountRef.current) return;
    if (!mountedRef.current) return;

    try {
      const condoList = getUserCondominiums();
      if (condoList.length === 0) {
        return;
      }

      isFetchingCountRef.current = true;
      let totalUnread = 0;

      for (const condo of condoList) {
        try {
          const result = await notificationApi.getUnreadCount(condo.id);
          totalUnread += result.unreadNotifications || 0;
        } catch (error) {
          console.error(`Errore nel conteggio per ${condo.name}:`, error);
          consecutiveErrorsRef.current += 1;
        }
      }

      // Reset error counter on success
      consecutiveErrorsRef.current = 0;

      const prevUnread = unreadCountRef.current;
      
      if (mountedRef.current) {
        setUnreadCount(totalUnread);
      }
      
      if (totalUnread > prevUnread && mountedRef.current) {
        const newCount = totalUnread - prevUnread;
        toast.info(`🔔 ${newCount} nuova${newCount > 1 ? 'e' : ''} notifica${newCount > 1 ? 'e' : ''}`, {
          description: `Hai ${newCount} nuova${newCount > 1 ? 'e' : ''} notifica${newCount > 1 ? 'e' : ''} da leggere`,
          duration: 4000,
        });
        fetchNotifications(true);
      }
    } catch (error) {
      console.error("Errore nel refresh del conteggio:", error);
      consecutiveErrorsRef.current += 1;
    } finally {
      isFetchingCountRef.current = false;
    }
  }, [getUserCondominiums]);

  // Funzione principale per fetchare le notifiche (per la UI)
  const fetchNotifications = useCallback(async (reset: boolean = true) => {
    if (loadingRef.current) return;
    if (!reset && !hasMore) return;

    const fetchKey = `${reset}_${Date.now()}`;
    if (lastFetchRef.current === fetchKey) return;
    lastFetchRef.current = fetchKey;

    loadingRef.current = true;
    setLoading(true);

    try {
      const currentPage = reset ? 0 : pageRef.current;
      const condoList = getUserCondominiums();

      if (condoList.length === 0) {
        setLoading(false);
        loadingRef.current = false;
        return;
      }

      let allNotifs: NotificationResponse[] = [];
      const groups: NotificationContextType['groupedNotifications'] = [];
      let totalCount = 0;

      for (const condo of condoList) {
        const result = await fetchNotificationsForCondominium(condo.id, currentPage);
        const notifications = result.notifications;
        const unread = notifications.filter((n) => !n.read).length;

        groups.push({
          condominiumId: condo.id,
          condominiumName: condo.name,
          notifications,
          unreadCount: unread,
          totalCount: result.total,
        });

        allNotifs = [...allNotifs, ...notifications];
        totalCount += result.total;
      }

      allNotifs.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      if (reset) {
        setNotifications(allNotifs);
        pageRef.current = 1;
      } else {
        setNotifications(prev => {
          const existingIds = new Set(prev.map(n => n.id));
          const newNotifs = allNotifs.filter(n => !existingIds.has(n.id));
          return [...prev, ...newNotifs];
        });
        pageRef.current = currentPage + 1;
      }

      setGroupedNotifications(groups);
      setTotalElements(totalCount);
      setHasMore(allNotifs.length < totalCount);
      
      await refreshUnreadCount();
    } catch (error) {
      console.error("Errore nel caricamento delle notifiche:", error);
      toast.error("Errore nel caricamento delle notifiche");
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [getUserCondominiums, fetchNotificationsForCondominium, hasMore, refreshUnreadCount]);

  // 🔥 POLLING CHE FUNZIONE SEMPRE
  const startPolling = useCallback(() => {
    // Pulisci eventuale timeout esistente
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }

    if (!isPollingActiveRef.current || !mountedRef.current) return;

    // Calcola l'intervallo
    let interval = 15000; // 15 secondi di default
    
    if (unreadCountRef.current === 0) {
      interval = 30000; // 30 secondi se non ci sono notifiche
    }
    
    if (unreadCountRef.current > 5) {
      interval = 10000; // 10 secondi se ci sono molte notifiche
    }
    
    if (consecutiveErrorsRef.current > 3) {
      interval = 60000; // 60 secondi se ci sono errori
    }

    // Limiti
    const minInterval = 5000;
    const maxInterval = 120000;
    interval = Math.min(Math.max(interval, minInterval), maxInterval);

    console.log(`📊 Polling: prossimo tick tra ${interval/1000}s (notifiche: ${unreadCountRef.current})`);

    pollingTimeoutRef.current = setTimeout(async () => {
      if (!mountedRef.current || !isPollingActiveRef.current) {
        return;
      }

      // Esegui il refresh
      await refreshUnreadCount();
      
      // 🔥 RIAVVIA IL POLLING (ricorsione)
      if (mountedRef.current && isPollingActiveRef.current) {
        startPolling();
      }
    }, interval);
  }, [refreshUnreadCount]);

  // 🔥 GESTIONE VISIBILITA' TAB
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab nascosta → pausa polling
        isPollingActiveRef.current = false;
        if (pollingTimeoutRef.current) {
          clearTimeout(pollingTimeoutRef.current);
          pollingTimeoutRef.current = null;
          console.log('⏸️ Polling in pausa (tab nascosta)');
        }
      } else {
        // Tab visibile → riprendi polling
        isPollingActiveRef.current = true;
        if (isInitializedRef.current && !pollingTimeoutRef.current) {
          console.log('▶️ Polling ripreso (tab visibile)');
          // Fai subito un refresh e riavvia il polling
          refreshUnreadCount().finally(() => {
            if (mountedRef.current && isPollingActiveRef.current) {
              startPolling();
            }
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshUnreadCount, startPolling]);

  // 🔥 INIZIALIZZAZIONE
  useEffect(() => {
    console.log('🔍 useEffect init - authLoading:', authLoading, 'profile:', !!profile, 'isAdmin:', isAdmin, 'condominiumsInitialized:', condominiumsInitialized, 'condominiums length:', contextCondominiums.length);
    
    if (authLoading) {
      console.log('⏳ Attendo authLoading...');
      return;
    }
    
    if (!profile) {
      console.log('⏳ Attendo profile...');
      return;
    }
    
    if (isAdmin && !condominiumsInitialized) {
      console.log('⏳ Attendo inizializzazione condomini (admin)...');
      return;
    }
    
    if (isAdmin && contextCondominiums.length === 0) {
      console.log('⏳ Nessun condominio trovato per admin, attendo...');
      return;
    }
    
    if (!isAdmin && (!profile.memberships || profile.memberships.length === 0)) {
      console.log('⏳ Nessuna membership trovata per resident, attendo...');
      return;
    }

    if (isInitializedRef.current) {
      console.log('✅ Già inizializzato, skip');
      return;
    }

    const condoList = getUserCondominiums();
    console.log('🏢 Condomini trovati:', condoList.length, condoList.map(c => c.name).join(', '));
    
    if (condoList.length === 0) {
      console.log('⏳ Nessun condominio disponibile, attendo...');
      return;
    }

    isInitializedRef.current = true;

    console.log('🚀 INIZIALIZZAZIONE NOTIFICHE per:', isAdmin ? 'Admin' : 'Resident');

    const initialize = async () => {
      try {
        await fetchNotifications(true);
        console.log('✅ Notifiche iniziali caricate');
        
        await refreshUnreadCount();
        console.log('✅ Conteggio iniziale aggiornato');
        
        if (!isPollingStartedRef.current) {
          isPollingStartedRef.current = true;
          // Avvia il polling dopo 1 secondo
          setTimeout(() => {
            if (mountedRef.current && isPollingActiveRef.current) {
              console.log('🔄 POLLING AVVIATO');
              startPolling();
            }
          }, 1000);
        }
      } catch (error) {
        console.error('❌ Errore inizializzazione:', error);
      }
    };

    initialize();

    return () => {
      console.log('🛑 Cleanup notifiche');
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
      isPollingActiveRef.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, profile, isAdmin, condominiumsInitialized, contextCondominiums.length]);

  // 🔥 EFFETTO PER CAMBIO CONDOMINIO
  useEffect(() => {
    if (!isAdmin && currentCondoId && isInitializedRef.current) {
      console.log('🔄 Cambio condominio residente, refresh notifiche');
      fetchNotifications(true);
    }
  }, [currentCondoId, isAdmin, fetchNotifications]);

  // 🔥 EFFETTO PER CAMBIO LISTA CONDOMINI ADMIN
  useEffect(() => {
    if (isAdmin && contextCondominiums.length > 0 && isInitializedRef.current) {
      console.log('🔄 Cambio lista condomini admin, refresh notifiche');
      const timeoutId = setTimeout(() => {
        fetchNotifications(true);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [contextCondominiums.length, isAdmin, fetchNotifications]);

  // Mark as read
  const markAsRead = useCallback(async (notificationId: string, condoId: string) => {
    try {
      const response = await notificationApi.markAsRead(condoId, notificationId);
      if (response.success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          )
        );

        setGroupedNotifications((prev) =>
          prev.map((group) => {
            if (group.condominiumId === condoId) {
              const updatedNotifs = group.notifications.map((n) =>
                n.id === notificationId ? { ...n, read: true } : n
              );
              const newUnread = updatedNotifs.filter((n) => !n.read).length;
              return {
                ...group,
                notifications: updatedNotifs,
                unreadCount: newUnread,
              };
            }
            return group;
          })
        );

        setUnreadCount((prev) => Math.max(0, prev - 1));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Errore nel segnare come letta:", error);
      return false;
    }
  }, []);

  // Memoizza il valore del contesto
  const value = useMemo(() => ({
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    groupedNotifications,
    totalElements,
    hasMore,
    refreshUnreadCount,
  }), [notifications, unreadCount, loading, fetchNotifications, markAsRead, groupedNotifications, totalElements, hasMore, refreshUnreadCount]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}