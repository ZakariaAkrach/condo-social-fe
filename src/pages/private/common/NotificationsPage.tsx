// src/pages/private/common/NotificationsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCheck, BellOff, Filter, ChevronDown, Ticket, FileText, MessageSquare, Building2, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useNavigate } from 'react-router';
import { condominiumApi, type CondominiumDto } from '@/app/api/condominium';
import { notificationApi, type NotificationResponse, type PaginatedNotificationResponse } from '@/app/api/notification';
import { useAuth } from '@/auth/AuthProvider';
import { useCondominiumList } from '@/components/common/CondominiumListContext';

interface NotificationsPageProps {
  isAdmin?: boolean;
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ isAdmin = false }) => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  // Usa il context per i condomini (admin)
  const { condominiums: contextCondominiums, loading: loadingContextCondos } = useCondominiumList();
  
  // State per i condomini
  const [condominiums, setCondominiums] = useState<CondominiumDto[]>([]);
  const [selectedCondominium, setSelectedCondominium] = useState<string>('');
  const [loadingCondominiums, setLoadingCondominiums] = useState(true);
  
  // State per le notifiche
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State per la paginazione
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(20);
  
  // State per i filtri UI
  const [unreadOnly, setUnreadOnly] = useState(false);
  
  // State per il mark as read
  const [markingRead, setMarkingRead] = useState<string | null>(null);

  // Carica i condomini
  useEffect(() => {
    if (isAdmin) {
      // Usa i condomini dal context (già caricati)
      setCondominiums(contextCondominiums);
      setLoadingCondominiums(loadingContextCondos);
      if (contextCondominiums.length > 0) {
        setSelectedCondominium(contextCondominiums[0].id);
      }
    } else {
      // Per i residenti, usa i membri dal profilo
      if (profile?.memberships) {
        const condoList = profile.memberships.map(m => ({
          id: m.condominiumId,
          name: m.condominiumName,
        })) as CondominiumDto[];
        setCondominiums(condoList);
        setLoadingCondominiums(false);
        if (condoList.length > 0) {
          setSelectedCondominium(condoList[0].id);
        }
      }
    }
  }, [isAdmin, contextCondominiums, loadingContextCondos, profile]);

  // Carica le notifiche quando cambia il condominio selezionato o la pagina
  useEffect(() => {
    if (selectedCondominium) {
      loadNotifications();
    }
  }, [selectedCondominium, currentPage]);

  const loadNotifications = useCallback(async () => {
    if (!selectedCondominium) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response: PaginatedNotificationResponse = await notificationApi.fetchNotifications(
        selectedCondominium,
        currentPage,
        pageSize,
        false,
        'createdAt'
      );
      
      setNotifications(response.data || []);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err) {
      console.error('Errore nel caricamento delle notifiche:', err);
      setError('Impossibile caricare le notifiche');
    } finally {
      setLoading(false);
    }
  }, [selectedCondominium, currentPage, pageSize]);

  const handleMarkAsRead = async (notificationId: string, condominiumId: string) => {
    try {
      setMarkingRead(notificationId);
      await notificationApi.markAsRead(condominiumId, notificationId);
      
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, read: true, readAt: new Date().toISOString() }
            : n
        )
      );
    } catch (err) {
      console.error('Errore nel segnare la notifica come letta:', err);
    } finally {
      setMarkingRead(null);
    }
  };

  const handleNotificationClick = (notification: NotificationResponse) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id, notification.condominiumId);
    }
    
    const basePath = isAdmin ? '/admin' : '/resident';
    const actionId = notification.actionId;
    
    switch (notification.notificationType) {
      case 'TICKET_RESIDENT_CREATED_NEW':
      case 'TICKET_ADMIN_REPLAYED_TO_MESSAGE':
      case 'TICKET_RESIDENT_REPLAYED_TO_MESSAGE':
      case 'TICKET_ADMIN_ASSIGN':
      case 'TICKET_UPLOAD_DOCUMENT':
      case 'TICKET_CLOSED':
        if (actionId) {
          if (isAdmin) {
            navigate(`${basePath}/condomini/${notification.condominiumId}/tickets/${actionId}`);
          } else {
            navigate(`${basePath}/ticket/${actionId}`);
          }
        }
        break;
        
      case 'POST_CREATED_NEW':
      case 'POST_CREATED_NEW_NOTIFY_IMMEDIATELY':
      case 'POST_POLL_CLOSED':
      case 'POST_NEW_POLL_VOTE':
        if (actionId) {
          if (isAdmin) {
            navigate(`${basePath}/condomini/${notification.condominiumId}/posts/${actionId}`);
          } else {
            navigate(`${basePath}/post/${actionId}`);
          }
        }
        break;
        
      case 'DOCUMENT_UPLOADED_NEW_VERSION':
      case 'DOCUMENT_UPDATED_VISIBILITY':
        if (actionId) {
          if (isAdmin) {
            navigate(`${basePath}/condomini/${notification.condominiumId}/documenti/${actionId}`);
          } else {
            navigate(`${basePath}/document/${actionId}`);
          }
        }
        break;
        
      default:
        console.log('Tipo di notifica non gestito:', notification.notificationType);
    }
  };

  const getNotificationIcon = (type: string) => {
    if (type.startsWith('TICKET')) return <Ticket className="h-5 w-5 text-orange-500" />;
    if (type.startsWith('POST')) return <MessageSquare className="h-5 w-5 text-blue-500" />;
    if (type.startsWith('DOCUMENT')) return <FileText className="h-5 w-5 text-green-500" />;
    return <Bell className="h-5 w-5 text-gray-500" />;
  };

  const getNotificationColor = (type: string) => {
    if (type.startsWith('TICKET')) return 'bg-orange-50 border-orange-200';
    if (type.startsWith('POST')) return 'bg-blue-50 border-blue-200';
    if (type.startsWith('DOCUMENT')) return 'bg-green-50 border-green-200';
    return 'bg-gray-50 border-gray-200';
  };

  const getNotificationLabel = (type: string) => {
    const labels: Record<string, string> = {
      'POST_CREATED_NEW': 'Nuovo Post',
      'POST_CREATED_NEW_NOTIFY_IMMEDIATELY': 'Post Immediato',
      'POST_POLL_CLOSED': 'Sondaggio Chiuso',
      'POST_NEW_POLL_VOTE': 'Nuovo Voto al Sondaggio',
      'DOCUMENT_UPLOADED_NEW_VERSION': 'Nuova Versione Documento',
      'DOCUMENT_UPDATED_VISIBILITY': 'Visibilità Documento Aggiornata',
      'TICKET_RESIDENT_CREATED_NEW': 'Nuovo Ticket',
      'TICKET_ADMIN_REPLAYED_TO_MESSAGE': 'Risposta Admin al Ticket',
      'TICKET_RESIDENT_REPLAYED_TO_MESSAGE': 'Risposta Resident al Ticket',
      'TICKET_ADMIN_ASSIGN': 'Ticket Assegnato',
      'TICKET_UPLOAD_DOCUMENT': 'Documento Caricato nel Ticket',
      'TICKET_CLOSED': 'Ticket Chiuso'
    };
    return labels[type] || type;
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Data non disponibile';
    
    try {
      return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: it });
    } catch {
      return 'Data non valida';
    }
  };

  const filteredNotifications = unreadOnly 
    ? notifications.filter(n => !n.read)
    : notifications;

  const currentCondominium = condominiums.find(c => c.id === selectedCondominium);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Bell className="h-8 w-8 text-indigo-600" />
                Notifiche
              </h1>
              <p className="mt-2 text-gray-600">
                Gestisci le tue notifiche e rimani aggiornato sulle attività del condominio
              </p>
            </div>
            
            {/* Selettore Condominio */}
            <div className="relative">
              <select
                value={selectedCondominium}
                onChange={(e) => {
                  setSelectedCondominium(e.target.value);
                  setCurrentPage(0);
                }}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-w-[250px] text-sm"
                disabled={loadingCondominiums}
              >
                {loadingCondominiums ? (
                  <option>Caricamento condomini...</option>
                ) : condominiums.length === 0 ? (
                  <option>Nessun condominio trovato</option>
                ) : (
                  condominiums.map(condominium => (
                    <option key={condominium.id} value={condominium.id}>
                      {condominium.name}
                    </option>
                  ))
                )}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Stats Bar */}
          {currentCondominium && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Totale Notifiche</p>
                    <p className="text-2xl font-bold text-gray-900">{totalElements}</p>
                  </div>
                  <Building2 className="h-8 w-8 text-indigo-500" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Non Lette</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {notifications.filter(n => !n.read).length}
                    </p>
                  </div>
                  <BellOff className="h-8 w-8 text-orange-500" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Lette</p>
                    <p className="text-2xl font-bold text-green-600">
                      {notifications.filter(n => n.read).length}
                    </p>
                  </div>
                  <CheckCheck className="h-8 w-8 text-green-500" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filtri */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setUnreadOnly(!unreadOnly)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                unreadOnly 
                  ? "bg-indigo-600 text-white hover:bg-indigo-700" 
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              )}
            >
              <Filter className="h-4 w-4" />
              {unreadOnly ? 'Mostra Tutte' : 'Solo Non Lette'}
            </button>
          </div>
          
          {filteredNotifications.length > 0 && (
            <p className="text-sm text-gray-500">
              {filteredNotifications.length} notifiche visualizzate
            </p>
          )}
        </div>

        {/* Lista Notifiche */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <BellOff className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nessuna notifica trovata
            </h3>
            <p className="text-gray-500">
              {unreadOnly 
                ? 'Non hai notifiche non lette in questo condominio'
                : 'Non ci sono notifiche per questo condominio'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={cn(
                  "group relative bg-white rounded-xl shadow-sm border transition-all duration-200 cursor-pointer",
                  notification.read 
                    ? "border-gray-200 hover:border-gray-300" 
                    : "border-indigo-200 hover:border-indigo-300 bg-indigo-50/30",
                  "hover:shadow-md transform hover:-translate-y-0.5"
                )}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-4">
                    {/* Icona */}
                    <div className={cn(
                      "flex-shrink-0 p-3 rounded-lg border",
                      getNotificationColor(notification.notificationType)
                    )}>
                      {getNotificationIcon(notification.notificationType)}
                    </div>
                    
                    {/* Contenuto */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                              notification.read 
                                ? "bg-gray-100 text-gray-600" 
                                : "bg-indigo-100 text-indigo-700"
                            )}>
                              {getNotificationLabel(notification.notificationType)}
                            </span>
                            {!notification.read && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                Nuova
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {notification.title}
                          </h3>
                          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                            {notification.description}
                          </p>
                        </div>
                        
                        {/* Azioni */}
                        <div className="flex-shrink-0 flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDate(notification.createdAt)}
                          </div>
                          
                          {!notification.read ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id, notification.condominiumId);
                              }}
                              disabled={markingRead === notification.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {markingRead === notification.id ? (
                                <div className="w-3 h-3 border border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <CheckCheck className="h-3.5 w-3.5" />
                              )}
                              Segna come letta
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                              {formatDate(notification.readAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginazione */}
        {!loading && !error && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Precedente
              </button>
              
              <span className="px-4 py-2 text-sm text-gray-600">
                Pagina {currentPage + 1} di {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage >= totalPages - 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Successiva
              </button>
            </div>
            
            <div className="text-sm text-gray-500">
              Totale: {totalElements} notifiche
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;