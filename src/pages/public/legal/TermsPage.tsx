// pages/legal/TermsPage.tsx
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { ArrowLeft, Shield, FileText, Users, Database, AlertTriangle, Server, UserCog, Clock, Trash2, Scale, RefreshCw } from "lucide-react";

export default function TermsPage() {
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
          <h1 className="text-2xl md:text-3xl font-bold">Termini di Servizio</h1>
        </div>

        <Card className="border shadow-sm">
          <CardContent className="p-6 md:p-8 space-y-6 text-sm text-muted-foreground leading-relaxed">
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Ultimo aggiornamento: 29 agosto 2026</p>
                <p className="text-xs">Versione 2.0 - Documento valido dal 29 agosto 2026</p>
              </div>
            </div>

            {/* 1. INTRODUZIONE */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">1. Introduzione</h2>
              <p>
                Benvenuto su <span className="font-medium text-foreground">CondoConnect</span>, una piattaforma SaaS (Software as a Service) 
                progettata per facilitare la comunicazione e la gestione tra amministratori e residenti di condomini.
              </p>
              <p className="mt-2">
                Utilizzando il nostro servizio, accetti i presenti Termini di Servizio. Ti invitiamo a leggerli attentamente.
              </p>
            </section>

            {/* 2. DEFINIZIONI */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">2. Definizioni</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-muted/30 rounded-xl">
                  <p className="font-medium text-foreground flex items-center gap-2">
                    <Server className="h-4 w-4 text-primary" />
                    Piattaforma / Servizio
                  </p>
                  <p className="text-xs mt-1">CondoConnect SaaS</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-xl">
                  <p className="font-medium text-foreground flex items-center gap-2">
                    <UserCog className="h-4 w-4 text-primary" />
                    Amministratore
                  </p>
                  <p className="text-xs mt-1">Utente che paga l'abbonamento e gestisce il condominio. È il <strong>Titolare del Trattamento</strong> dei dati.</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-xl">
                  <p className="font-medium text-foreground flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Residente
                  </p>
                  <p className="text-xs mt-1">Utente invitato dall'Amministratore a partecipare al condominio.</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-xl">
                  <p className="font-medium text-foreground flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary" />
                    Dati Personali
                  </p>
                  <p className="text-xs mt-1">Qualsiasi informazione relativa a una persona fisica identificata o identificabile.</p>
                </div>
              </div>
            </section>

            {/* 3. DESCRIZIONE DEL SERVIZIO */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">3. Descrizione del Servizio</h2>
              <p>
                CondoConnect è un <span className="font-medium text-foreground">tool SaaS</span> che fornisce strumenti per:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Pubblicazione di <span className="font-medium text-foreground">post</span> e comunicazioni</li>
                <li>Gestione e archiviazione di <span className="font-medium text-foreground">documenti</span> con versioning</li>
                <li>Creazione e tracciamento di <span className="font-medium text-foreground">ticket</span> di segnalazione</li>
                <li>Comunicazione tra amministratori e residenti</li>
                <li>Creazione di <span className="font-medium text-foreground">sondaggi</span> e votazioni</li>
                <li>Tracciamento delle <span className="font-medium text-foreground">attività</span> e audit log</li>
              </ul>
            </section>

            {/* 4. RUOLO DI CONDOCONNECT */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">4. Ruolo di CondoConnect (SaaS Provider)</h2>
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-amber-800 dark:text-amber-300 text-sm">
                    <p className="font-semibold">Importante:</p>
                    <p>
                      CondoConnect fornisce esclusivamente <span className="font-medium">strumenti software</span> per la gestione 
                      condominiale. <span className="font-medium">Non siamo responsabili</span> per:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Le decisioni amministrative prese dagli amministratori</li>
                      <li>La correttezza dei dati inseriti dagli utenti</li>
                      <li>Le conseguenze della cancellazione di documenti o dati</li>
                      <li>La mancata conformità a normative locali</li>
                      <li>Le comunicazioni tra residenti e amministratore</li>
                      <li>Le azioni dei residenti sulla Piattaforma</li>
                    </ul>
                    <div className="mt-3 p-2 bg-amber-100/50 dark:bg-amber-900/30 rounded-lg">
                      <p className="text-xs">
                        <span className="font-medium">Nota:</span> CondoConnect agisce come <strong>Responsabile del Trattamento</strong> (Data Processor) 
                        dei dati personali, mentre l'Amministratore è il <strong>Titolare del Trattamento</strong> (Data Controller).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. RESPONSABILITÀ DELL'AMMINISTRATORE */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">5. Responsabilità dell'Amministratore</h2>
              <p>
                L'<span className="font-medium text-foreground">amministratore del condominio</span> è il titolare del trattamento 
                dei dati e ha la piena responsabilità per:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Le operazioni di <span className="font-medium">cancellazione definitiva</span> di documenti, ticket o interi condomini</li>
                <li>La gestione degli accessi e dei permessi degli utenti (ruoli: CONDO_ADMIN, CONDO_SUB_ADMIN, CONDO_RESIDENT)</li>
                <li>La verifica della correttezza dei dati inseriti</li>
                <li>La conformità alle leggi locali sulla privacy (GDPR, etc.)</li>
                <li>La conservazione e l'archiviazione dei documenti</li>
                <li>La gestione delle richieste di cancellazione dei residenti</li>
              </ul>
              <div className="mt-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 rounded-xl p-3">
                <p className="text-blue-800 dark:text-blue-300 text-sm flex items-start gap-2">
                  <span>ℹ️</span>
                  <span>
                    <span className="font-medium">Nota:</span> Prima di eseguire operazioni irreversibili (come la cancellazione definitiva), 
                    la piattaforma mostra un <span className="font-medium">dialog di conferma</span>. L'amministratore è tenuto a leggere 
                    attentamente gli avvisi prima di procedere.
                  </span>
                </p>
              </div>
            </section>

            {/* 6. REGISTRAZIONE E ACCOUNT */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">6. Registrazione e Account</h2>
              <h3 className="font-medium text-foreground mt-3">6.1 Creazione Account</h3>
              <p>Per utilizzare la Piattaforma è necessario registrarsi fornendo:</p>
              <ul className="list-disc pl-6 mt-1 space-y-0.5">
                <li><strong>Email</strong> (obbligatoria, unica)</li>
                <li><strong>Password</strong> (minimo 8 caratteri)</li>
                <li><strong>Nome e Cognome</strong> (opzionali ma consigliati)</li>
              </ul>

              <h3 className="font-medium text-foreground mt-3">6.2 Verifica Email</h3>
              <p>Al momento della registrazione, viene inviata un'email di verifica. L'account è attivo solo dopo la conferma.</p>

              <h3 className="font-medium text-foreground mt-3">6.3 Sicurezza Account</h3>
              <p>L'utente è responsabile della sicurezza delle proprie credenziali. La piattaforma implementa:</p>
              <ul className="list-disc pl-6 mt-1 space-y-0.5">
                <li>Autenticazione JWT (JSON Web Token) con rotazione dei token</li>
                <li>Rate limiting per prevenire attacchi brute force (60 richieste/minuto)</li>
                <li>Scadenza delle sessioni</li>
              </ul>
            </section>

            {/* 7. PROPRIETÀ INTELLETTUALE */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">7. Proprietà Intellettuale</h2>
              <p>
                Tutti i contenuti, il codice, il design, il database schema e i marchi di CondoConnect sono di proprietà esclusiva della nostra azienda. 
                È vietato copiare, modificare, decompilare o distribuire il software senza autorizzazione.
              </p>
              <div className="mt-2 p-3 bg-muted/20 rounded-xl">
                <p className="text-xs">
                  <span className="font-medium">Tecnologie utilizzate:</span> Spring Boot, Java, PostgreSQL, Supabase, 
                  Lemon Squeezy per i pagamenti, S3 per lo storage.
                </p>
              </div>
            </section>

            {/* 8. LIMITAZIONE DI RESPONSABILITÀ */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">8. Limitazione di Responsabilità</h2>
              <p>
                CondoConnect non è responsabile per danni diretti, indiretti, incidentali o consequenziali derivanti da:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Interruzioni del servizio (manutenzione programmata o emergenze)</li>
                <li>Perdita di dati dovuta a cancellazioni da parte dell'utente</li>
                <li>Uso improprio della piattaforma</li>
                <li>Decisioni prese sulla base delle informazioni fornite dalla piattaforma</li>
                <li>Errori di configurazione da parte dell'Amministratore</li>
                <li>Accessi non autorizzati dovuti a credenziali compromesse</li>
              </ul>
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-xl">
                <p className="text-red-800 dark:text-red-300 text-xs flex items-start gap-2">
                  <span>⚠️</span>
                  <span>
                    <span className="font-medium">Massimo risarcimento:</span> In ogni caso, la responsabilità di CondoConnect 
                    è limitata all'importo totale pagato dall'utente nei 12 mesi precedenti il reclamo.
                  </span>
                </p>
              </div>
            </section>

            {/* 9. CANCELLAZIONE E CONSERVAZIONE DEI DATI */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">9. Cancellazione e Conservazione dei Dati</h2>
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div className="text-red-800 dark:text-red-300 text-sm">
                    <p className="font-semibold">Attenzione:</p>
                    <p>
                      La cancellazione di documenti, ticket, post o l'eliminazione di un condominio è <span className="font-medium">definitiva e irreversibile</span>. 
                      CondoConnect <span className="font-medium">non fornisce backup</span> dei dati cancellati dagli utenti.
                    </p>
                    <div className="mt-3 p-2 bg-red-100/50 dark:bg-red-900/30 rounded-lg space-y-1">
                      <p className="text-xs">
                        <span className="font-medium">Documenti:</span> Quando un documento viene eliminato, viene spostato nel cestino 
                        per 7 giorni prima della cancellazione definitiva. Durante questo periodo, solo l'Amministratore può recuperarlo.
                      </p>
                      <p className="text-xs">
                        <span className="font-medium">Ticket:</span> I ticket chiusi vengono mantenuti per audit e tracciabilità.
                      </p>
                      <p className="text-xs">
                        <span className="font-medium">Post:</span> I post eliminati vengono conservati per 7 giorni prima della cancellazione definitiva.
                      </p>
                    </div>
                    <p className="mt-2">
                      Prima di ogni cancellazione, la piattaforma mostrerà un <span className="font-medium">avviso di conferma</span> 
                      che l'utente deve accettare esplicitamente.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 10. ABBONAMENTI E PAGAMENTI */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">10. Abbonamenti e Pagamenti</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-muted/30 rounded-xl">
                  <p className="font-medium text-foreground">Piani disponibili</p>
                  <ul className="list-disc pl-5 mt-1 text-xs space-y-0.5">
                    <li><strong>TRIAL</strong> - 3 condomini, 5 GB (30 giorni)</li>
                    <li><strong>STARTER</strong> - 5 condomini, 7 GB</li>
                    <li><strong>PREMIUM</strong> - 10 condomini, 15 GB</li>
                    <li><strong>ENTERPRISE</strong> - 20 condomini, 50 GB</li>
                  </ul>
                </div>
                <div className="p-3 bg-muted/30 rounded-xl">
                  <p className="font-medium text-foreground">Stati abbonamento</p>
                  <ul className="list-disc pl-5 mt-1 text-xs space-y-0.5">
                    <li><strong>TRIAL</strong> - Periodo di prova</li>
                    <li><strong>ACTIVE</strong> - Abbonamento attivo</li>
                    <li><strong>INACTIVE</strong> - Pagamento non riuscito</li>
                    <li><strong>EXPIRED</strong> - Abbonamento scaduto</li>
                    <li><strong>PENDING_PAYMENT</strong> - In attesa di conferma</li>
                  </ul>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground/70">
                I pagamenti sono gestiti da <span className="font-medium">Lemon Squeezy</span>, un processore di pagamento conforme a GDPR e PCI-DSS.
              </p>
            </section>

            {/* 11. LEGGE APPLICABILE */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">11. Legge Applicabile e Foro Competente</h2>
              <p>
                I presenti Termini sono regolati dalla <span className="font-medium">legge italiana</span>. 
                Qualsiasi controversia sarà di competenza esclusiva del <span className="font-medium">foro di Milano</span>.
              </p>
              <div className="mt-2 p-3 bg-muted/20 rounded-xl flex items-center gap-2">
                <Scale className="h-4 w-4 text-primary" />
                <p className="text-xs">
                  <span className="font-medium">GDPR:</span> CondoConnect è conforme al Regolamento Generale sulla Protezione dei Dati (UE) 2016/679.
                </p>
              </div>
            </section>

            {/* 12. MODIFICHE AI TERMINI */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">12. Modifiche ai Termini</h2>
              <p>
                Ci riserviamo il diritto di modificare questi Termini in qualsiasi momento. Le modifiche saranno comunicate 
                via email o tramite la piattaforma con almeno <span className="font-medium">30 giorni di preavviso</span>.
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground/70">
                <RefreshCw className="h-3 w-3" />
                <span>La versione più recente è sempre disponibile su questa pagina.</span>
              </div>
            </section>

            {/* 13. CONTATTI */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">13. Contatti</h2>
              <p>Per qualsiasi domanda sui Termini di Servizio, contattaci a:</p>
              <ul className="list-none mt-2 space-y-1 text-sm">
                <li>📧 <span className="font-medium text-foreground">Email:</span> <a href="mailto:legal@condoconnect.it" className="text-primary hover:underline">legal@condoconnect.it</a></li>
                <li>📍 <span className="font-medium text-foreground">Indirizzo:</span> Via Roma, 1 - 00100 Milano, Italia</li>
                <li>📞 <span className="font-medium text-foreground">Telefono:</span> +39 02 1234567</li>
              </ul>
            </section>

            <div className="border-t pt-6 flex flex-col sm:flex-row gap-3 justify-between">
              <Button asChild variant="outline">
                <Link to="/privacy">Leggi la Privacy Policy</Link>
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