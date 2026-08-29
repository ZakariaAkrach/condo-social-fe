// pages/legal/PrivacyPage.tsx
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { ArrowLeft, Shield, Eye, Database, User, Lock, FileText, Mail, Phone, MapPin, Clock, Server, Users, Activity } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">Privacy Policy</h1>
        </div>

        <Card className="border shadow-sm">
          <CardContent className="p-6 md:p-8 space-y-6 text-sm text-muted-foreground leading-relaxed">
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Ultimo aggiornamento: 29 agosto 2026</p>
                <p className="text-xs">Versione 2.0 - In conformità al GDPR (UE) 2016/679</p>
              </div>
            </div>

            {/* 1. CHI SIAMO */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">1. Chi siamo</h2>
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Server className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-800 dark:text-blue-300">CondoConnect SaaS Provider</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300/80 mt-1">
                      CondoConnect è un SaaS (Software as a Service) che fornisce strumenti di gestione per condomini. 
                      Siamo un <span className="font-medium">fornitore di servizi</span> e agiamo come 
                      <span className="font-medium"> Responsabile del Trattamento</span> dei dati (Data Processor) 
                      per conto degli amministratori di condominio, che sono i <span className="font-medium">Titolari del Trattamento</span> (Data Controllers).
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-muted/20 rounded-lg flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-xs">privacy@condoconnect.it</span>
                </div>
                <div className="p-3 bg-muted/20 rounded-lg flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-xs">Via Roma, 1 - 00100 Milano, Italia</span>
                </div>
              </div>
            </section>

            {/* 2. DATI CHE RACCOGLIAMO */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">2. Dati che raccogliamo</h2>
              <p className="text-xs text-muted-foreground/70 mb-3">Basato sulla struttura dati di CondoConnect:</p>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl">
                  <User className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Dati degli utenti (UserEntity)</p>
                    <ul className="list-disc pl-5 mt-1 space-y-0.5 text-xs">
                      <li><strong>ID</strong> - UUID (identificativo univoco)</li>
                      <li><strong>Email</strong> - Unica, utilizzata per l'autenticazione</li>
                      <li><strong>Nome e Cognome</strong> - Opzionali, utilizzati per identificare l'utente</li>
                      <li><strong>Data di creazione e aggiornamento</strong> - Tracciamento delle attività</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl">
                  <Database className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Dati dei Condomini (CondominiumEntity)</p>
                    <ul className="list-disc pl-5 mt-1 space-y-0.5 text-xs">
                      <li><strong>Nome</strong> - Identificativo del condominio</li>
                      <li><strong>Indirizzo</strong> - Paese, città, CAP, via</li>
                      <li><strong>Email del condominio</strong> - Contatto ufficiale</li>
                      <li><strong>Stato</strong> - ATTIVO / ELIMINATO</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl">
                  <Users className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Dati di appartenenza (CondominiumUserEntity)</p>
                    <ul className="list-disc pl-5 mt-1 space-y-0.5 text-xs">
                      <li><strong>Ruolo</strong> - CONDO_ADMIN, CONDO_SUB_ADMIN, CONDO_RESIDENT</li>
                      <li><strong>Stato invito</strong> - PENDING, SUCCESS, FAILED</li>
                      <li><strong>Data invito</strong> - Tracciamento delle registrazioni</li>
                      <li><strong>Codice invito</strong> - Per l'iscrizione dei residenti</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl">
                  <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Documenti e Versioni (DocumentEntity, DocumentVersionEntity)</p>
                    <ul className="list-disc pl-5 mt-1 space-y-0.5 text-xs">
                      <li><strong>Nome originale</strong> - Nome del file caricato</li>
                      <li><strong>Versione</strong> - Numero di versione (1, 2, 3...)</li>
                      <li><strong>Dimensione</strong> - Dimensione del file</li>
                      <li><strong>Tipo di contenuto</strong> - MIME type</li>
                      <li><strong>Estensione</strong> - .pdf, .jpg, .docx, etc.</li>
                      <li><strong>Stato</strong> - ACTIVE, DELETED, ARCHIVED, DRAFT, LOCKED</li>
                      <li><strong>Versioning</strong> - Se il versioning è attivo</li>
                      <li><strong>Visibilità</strong> - Pubblica o selettiva per utenti</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl">
                  <Activity className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Ticket e Messaggi (TicketEntity, TicketMessageEntity)</p>
                    <ul className="list-disc pl-5 mt-1 space-y-0.5 text-xs">
                      <li><strong>Titolo e descrizione</strong> - Contenuto del ticket</li>
                      <li><strong>Categoria</strong> - MAINTENANCE, CLEANING, NOISE, SECURITY, etc.</li>
                      <li><strong>Priorità</strong> - LOW, MEDIUM, HIGH</li>
                      <li><strong>Stato</strong> - OPEN, IN_PROGRESS, WAITING_USER, CLOSED</li>
                      <li><strong>Messaggi</strong> - Testo, visibilità (PUBLIC/INTERNAL)</li>
                      <li><strong>Allegati</strong> - File caricati nei ticket</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl">
                  <Eye className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Dati tecnici e di tracciamento</p>
                    <ul className="list-disc pl-5 mt-1 space-y-0.5 text-xs">
                      <li><strong>Activity log</strong> - Tutte le azioni degli utenti (CREATED, UPDATED, DELETED, etc.)</li>
                      <li><strong>Outbox events</strong> - Eventi per email e notifiche</li>
                      <li><strong>Indirizzo IP</strong> - Per sicurezza e prevenzione abusi</li>
                      <li><strong>User-Agent</strong> - Browser e sistema operativo</li>
                      <li><strong>Timestamp</strong> - Data e ora di ogni operazione</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl">
                  <Lock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Dati di abbonamento e pagamenti</p>
                    <ul className="list-disc pl-5 mt-1 space-y-0.5 text-xs">
                      <li><strong>Piano</strong> - TRIAL, STARTER, PREMIUM, ENTERPRISE</li>
                      <li><strong>Stato</strong> - TRIAL, ACTIVE, INACTIVE, EXPIRED</li>
                      <li><strong>Provider ID</strong> - ID su Lemon Squeezy per tracking</li>
                      <li><strong>Storia</strong> - Upgrade, downgrade, extra acquistati</li>
                      <li><strong>Storage utilizzato</strong> - Monitoraggio spazio</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. COME USIAMO I TUOI DATI */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">3. Come usiamo i tuoi dati</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Fornire e mantenere il servizio</strong> - Gestione di post, documenti, ticket</li>
                <li><strong>Gestire autenticazione e accessi</strong> - Login, ruoli e permessi (RBAC)</li>
                <li><strong>Inviare notifiche</strong> - Email di verifica, notifiche di sistema</li>
                <li><strong>Tracciare le attività</strong> - Audit log per trasparenza</li>
                <li><strong>Migliorare la piattaforma</strong> - Analisi aggregate anonime</li>
                <li><strong>Rispettare obblighi legali</strong> - Conformità a richieste legali</li>
                <li><strong>Gestire abbonamenti e pagamenti</strong> - Tramite Lemon Squeezy</li>
              </ul>
            </section>

            {/* 4. BASE GIURIDICA DEL TRATTAMENTO */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">4. Base giuridica del trattamento</h2>
              <p>
                Trattiamo i tuoi dati personali sulla base di:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>
                  <span className="font-medium text-foreground">Esecuzione del contratto</span> – 
                  per fornire il servizio richiesto (art. 6.1.b GDPR)
                </li>
                <li>
                  <span className="font-medium text-foreground">Consenso</span> – 
                  per comunicazioni di marketing (se attivo) (art. 6.1.a GDPR)
                </li>
                <li>
                  <span className="font-medium text-foreground">Obbligo legale</span> – 
                  per conformità a normative (art. 6.1.c GDPR)
                </li>
                <li>
                  <span className="font-medium text-foreground">Interesse legittimo</span> – 
                  per il miglioramento del servizio e sicurezza (art. 6.1.f GDPR)
                </li>
              </ul>
            </section>

            {/* 5. CONDIVISIONE DEI DATI */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">5. Condivisione dei dati</h2>
              <p>
                I dati vengono condivisi esclusivamente con:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Altri utenti del tuo condominio</strong> - Residenti e amministratori</li>
                <li><strong>Fornitori di servizi tecnici</strong> - Supabase (hosting, database, auth), Cloudflare (CDN, sicurezza)</li>
                <li><strong>Fornitori di pagamento</strong> - Lemon Squeezy per la gestione degli abbonamenti</li>
                <li><strong>Autorità legali</strong> - Se richiesto dalla legge</li>
              </ul>
              <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30 rounded-xl">
                <p className="text-green-800 dark:text-green-300 text-xs flex items-start gap-2">
                  <span>✅</span>
                  <span>
                    <span className="font-medium">Nota:</span> CondoConnect <span className="font-medium">non vende</span> i tuoi dati a terze parti. 
                    Tutti i fornitori sono conformi al GDPR.
                  </span>
                </p>
              </div>
            </section>

            {/* 6. TRASFERIMENTI INTERNAZIONALI */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">6. Trasferimenti internazionali</h2>
              <p>
                I dati vengono principalmente conservati in <span className="font-medium text-foreground">Unione Europea</span> (Supabase EU). 
                In alcuni casi, i dati possono essere trasferiti verso paesi terzi con adeguate garanzie:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Cloudflare</strong> - USA (Clausole Contrattuali Standard)</li>
                <li><strong>Lemon Squeezy</strong> - USA (Clausole Contrattuali Standard)</li>
              </ul>
            </section>

            {/* 7. CONSERVAZIONE DEI DATI */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">7. Conservazione dei dati</h2>
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4">
                <p className="text-amber-800 dark:text-amber-300 text-sm">
                  <span className="font-medium">📌 Politiche di conservazione:</span>
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-amber-700 dark:text-amber-300/80 text-xs">
                  <li><strong>Dati utente:</strong> Conservati fino a richiesta di cancellazione</li>
                  <li><strong>Documenti eliminati:</strong> Spostati nel cestino per 7 giorni, poi cancellati definitivamente</li>
                  <li><strong>Post eliminati:</strong> Conservati per 7 giorni prima della cancellazione definitiva</li>
                  <li><strong>Ticket:</strong> Conservati per audit, anche dopo la chiusura</li>
                  <li><strong>Activity log:</strong> Conservati per tracciabilità e sicurezza</li>
                  <li><strong>Failed S3 deletions:</strong> Tracciate per garantire l'eliminazione dei file</li>
                </ul>
                <p className="mt-2 text-amber-800 dark:text-amber-300 text-xs">
                  <span className="font-medium">⚠️ Importante:</span> La cancellazione dei dati è <span className="font-medium">definitiva e irreversibile</span>. 
                  CondoConnect non conserva copie dei dati cancellati dagli utenti.
                </p>
              </div>
            </section>

            {/* 8. I TUOI DIRITTI (GDPR) */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">8. I tuoi diritti (GDPR)</h2>
              <p>
                Ai sensi del GDPR (artt. 15-22), hai diritto a:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div className="p-3 bg-muted/20 rounded-lg">
                  <span className="font-medium text-foreground">Diritto di accesso</span>
                  <p className="text-xs mt-1">Conoscere quali dati trattiamo e come</p>
                </div>
                <div className="p-3 bg-muted/20 rounded-lg">
                  <span className="font-medium text-foreground">Diritto di rettifica</span>
                  <p className="text-xs mt-1">Correggere dati inesatti o incompleti</p>
                </div>
                <div className="p-3 bg-muted/20 rounded-lg">
                  <span className="font-medium text-foreground">Diritto di cancellazione</span>
                  <p className="text-xs mt-1">Richiedere la cancellazione dei propri dati</p>
                </div>
                <div className="p-3 bg-muted/20 rounded-lg">
                  <span className="font-medium text-foreground">Diritto di limitazione</span>
                  <p className="text-xs mt-1">Limitare il trattamento in specifiche situazioni</p>
                </div>
                <div className="p-3 bg-muted/20 rounded-lg">
                  <span className="font-medium text-foreground">Diritto di opposizione</span>
                  <p className="text-xs mt-1">Opporsi al trattamento per motivi legittimi</p>
                </div>
                <div className="p-3 bg-muted/20 rounded-lg">
                  <span className="font-medium text-foreground">Diritto alla portabilità</span>
                  <p className="text-xs mt-1">Ricevere i dati in formato strutturato</p>
                </div>
              </div>
              <p className="mt-3">
                Per esercitare questi diritti, contattaci a: <span className="font-medium text-foreground">privacy@condoconnect.it</span>
              </p>
            </section>

            {/* 9. SICUREZZA */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">9. Sicurezza</h2>
              <p>
                Utilizziamo misure di sicurezza avanzate per proteggere i tuoi dati:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div className="p-3 bg-muted/20 rounded-lg flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  <span className="text-xs">Crittografia TLS/HTTPS</span>
                </div>
                <div className="p-3 bg-muted/20 rounded-lg flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-xs">Autenticazione JWT</span>
                </div>
                <div className="p-3 bg-muted/20 rounded-lg flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-xs">Rate limiting (60 req/min)</span>
                </div>
                <div className="p-3 bg-muted/20 rounded-lg flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  <span className="text-xs">Backup giornalieri</span>
                </div>
              </div>
            </section>

            {/* 10. COOKIE */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">10. Cookie e tecnologie di tracciamento</h2>
              <p>
                Utilizziamo cookie essenziali per il funzionamento della piattaforma:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-xs">
                <li><strong>Cookie di sessione</strong> - Per mantenere l'autenticazione</li>
                <li><strong>Cookie di preferenza</strong> - Per salvare le preferenze dell'utente</li>
                <li><strong>Cookie di sicurezza</strong> - Per prevenire attacchi CSRF</li>
              </ul>
              <p className="mt-2 text-xs text-muted-foreground/70">
                Non utilizziamo cookie di profilazione o di marketing senza consenso esplicito.
              </p>
            </section>

            {/* 11. MODIFICHE ALLA PRIVACY POLICY */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">11. Modifiche alla Privacy Policy</h2>
              <p>
                Ci riserviamo il diritto di modificare questa Privacy Policy in qualsiasi momento. 
                Le modifiche saranno comunicate via email o tramite la piattaforma.
              </p>
              <p className="mt-2 text-xs text-muted-foreground/70">
                La versione più recente è sempre disponibile su questa pagina. 
                La data di ultimo aggiornamento è indicata in alto.
              </p>
            </section>

            {/* 12. CONTATTI PER LA PRIVACY */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">12. Contatti per la Privacy</h2>
              <p>Per qualsiasi domanda sulla Privacy Policy o per esercitare i tuoi diritti GDPR:</p>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-muted/20 rounded-lg flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-xs">privacy@condoconnect.it</span>
                </div>
                <div className="p-3 bg-muted/20 rounded-lg flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="text-xs">+39 02 1234567</span>
                </div>
              </div>
              <div className="mt-3 p-3 bg-muted/20 rounded-lg">
                <p className="text-xs">
                  <span className="font-medium">Data Protection Officer (DPO):</span> 
                  Puoi contattare il nostro DPO all'indirizzo dpo@condoconnect.it
                </p>
              </div>
            </section>

            <div className="border-t pt-6 flex flex-col sm:flex-row gap-3 justify-between">
              <Button asChild variant="outline">
                <Link to="/terms">Leggi i Termini di Servizio</Link>
              </Button>
              <Button asChild>
                <Link to="/sign-up">Accetta e Registrati</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}