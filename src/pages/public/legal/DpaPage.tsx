// pages/legal/DpaPage.tsx
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { ArrowLeft, Shield, FileText, Users, Database, Lock, CheckCircle, User, Server, Activity, Clock, Mail, Phone, MapPin, UserCog } from "lucide-react";

export default function DpaPage() {
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
          <h1 className="text-2xl md:text-3xl font-bold">Data Processing Agreement (DPA)</h1>
        </div>

        <Card className="border shadow-sm">
          <CardContent className="p-6 md:p-8 space-y-6 text-sm text-muted-foreground leading-relaxed">
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Data Processing Agreement</p>
                <p className="text-xs">Versione 2.0 - 29 agosto 2026</p>
                <p className="text-xs text-muted-foreground/70">In conformità al GDPR (UE) 2016/679</p>
              </div>
            </div>

            {/* INTRODUZIONE */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-800 dark:text-blue-300">Parti del Contratto</p>
                  <div className="mt-2 space-y-2 text-blue-700 dark:text-blue-300/80 text-sm">
                    <div className="p-2 bg-blue-100/50 dark:bg-blue-900/30 rounded-lg">
                      <p><span className="font-medium text-blue-900 dark:text-blue-200">Titolare del Trattamento (Data Controller):</span></p>
                      <p className="text-xs">L'Amministratore del condominio che utilizza CondoConnect</p>
                    </div>
                    <div className="p-2 bg-blue-100/50 dark:bg-blue-900/30 rounded-lg">
                      <p><span className="font-medium text-blue-900 dark:text-blue-200">Responsabile del Trattamento (Data Processor):</span></p>
                      <p className="text-xs">CondoConnect SaaS Provider (Via Roma, 1 - 00100 Milano, Italia)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 1. OGGETTO DEL TRATTAMENTO */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">1. Oggetto del Trattamento</h2>
              <p>
                CondoConnect fornisce strumenti SaaS per la gestione condominiale, inclusi:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-xs">
                <li><span className="font-medium text-foreground">Archiviazione e gestione di documenti</span> - Con versioning e controllo visibilità</li>
                <li><span className="font-medium text-foreground">Pubblicazione di comunicazioni</span> - Post e sondaggi</li>
                <li><span className="font-medium text-foreground">Gestione di ticket e segnalazioni</span> - Con tracciamento e messaggistica</li>
                <li><span className="font-medium text-foreground">Chat e messaggistica</span> - Tra residenti e amministratori</li>
                <li><span className="font-medium text-foreground">Audit e attività</span> - Tracciamento di tutte le operazioni</li>
              </ul>
            </section>

            {/* 2. RUOLI E RESPONSABILITÀ */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">2. Ruoli e Responsabilità</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted/30 rounded-xl p-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Titolare (Amministratore)
                  </h3>
                  <ul className="list-disc pl-5 mt-2 text-xs space-y-1">
                    <li>Determina le finalità del trattamento</li>
                    <li>Gestisce gli accessi degli utenti (ruoli)</li>
                    <li>Decide quali dati inserire e condividere</li>
                    <li>Responsabile della conformità normativa</li>
                    <li>Gestisce le richieste di cancellazione</li>
                    <li>Verifica la correttezza dei dati</li>
                    <li>Approva modifiche e cancellazioni</li>
                  </ul>
                </div>

                <div className="bg-muted/30 rounded-xl p-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary" />
                    Responsabile (CondoConnect)
                  </h3>
                  <ul className="list-disc pl-5 mt-2 text-xs space-y-1">
                    <li>Fornisce e mantiene gli strumenti software</li>
                    <li>Garantisce la sicurezza dei dati (crittografia)</li>
                    <li>Esegue backup tecnici programmati</li>
                    <li>Non accede ai dati se non per supporto</li>
                    <li>Non utilizza i dati per scopi propri</li>
                    <li>Implementa misure di sicurezza (rate limiting)</li>
                    <li>Notifica violazioni entro 72 ore</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 3. TIPOLOGIE DI DATI TRATTATI */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">3. Tipologie di Dati Trattati</h2>
              <p className="text-xs text-muted-foreground/70 mb-3">Sulla base della struttura dati di CondoConnect:</p>
              <div className="space-y-2">
                <div className="flex items-start gap-2 p-2 bg-muted/20 rounded-lg">
                  <User className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-foreground">Dati Personali:</span>
                    <span className="ml-1 text-xs">Nome, cognome, email, ID utente, ruolo</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 bg-muted/20 rounded-lg">
                  <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-foreground">Documenti:</span>
                    <span className="ml-1 text-xs">PDF, immagini, file, con versioni e metadata</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 bg-muted/20 rounded-lg">
                  <Activity className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-foreground">Dati di utilizzo:</span>
                    <span className="ml-1 text-xs">Post, ticket, messaggi, sondaggi, attività</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 bg-muted/20 rounded-lg">
                  <Lock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-foreground">Dati tecnici:</span>
                    <span className="ml-1 text-xs">IP, user-agent, timestamp, sessioni JWT</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 bg-muted/20 rounded-lg">
                  <Server className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-foreground">Dati di abbonamento:</span>
                    <span className="ml-1 text-xs">Piano, stato, storage utilizzato, storico</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. CATEGORIE DI INTERESSATI */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">4. Categorie di Interessati</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-muted/20 rounded-lg">
                  <p className="font-medium text-foreground flex items-center gap-2">
                    <UserCog className="h-4 w-4 text-primary" />
                    Amministratori
                  </p>
                  <p className="text-xs mt-1">Utenti che pagano l'abbonamento e gestiscono il condominio</p>
                </div>
                <div className="p-3 bg-muted/20 rounded-lg">
                  <p className="font-medium text-foreground flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Residenti
                  </p>
                  <p className="text-xs mt-1">Utenti invitati dall'Amministratore a partecipare</p>
                </div>
              </div>
            </section>

            {/* 5. DURATA DEL TRATTAMENTO */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">5. Durata del Trattamento</h2>
              <p>
                I dati vengono trattati fino a quando il Titolare (amministratore) o l'utente finale non richiedono la cancellazione.
              </p>
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-xl p-4 mt-2">
                <p className="text-red-800 dark:text-red-300 text-sm flex items-start gap-2">
                  <span className="text-lg">⚠️</span>
                  <span>
                    <span className="font-medium">Attenzione:</span> La cancellazione è <span className="font-medium">definitiva e irreversibile</span>. 
                    CondoConnect non conserva copie dei dati cancellati. Documenti e post eliminati rimangono nel cestino per 7 giorni 
                    prima della cancellazione definitiva.
                  </span>
                </p>
              </div>
            </section>

            {/* 6. MISURE DI SICUREZZA */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">6. Misure di Sicurezza</h2>
              <p>CondoConnect implementa le seguenti misure tecniche e organizzative:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div className="p-3 bg-muted/20 rounded-lg flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  <span className="text-xs">Crittografia TLS/HTTPS end-to-end</span>
                </div>
                <div className="p-3 bg-muted/20 rounded-lg flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-xs">Autenticazione JWT con rotazione token</span>
                </div>
                <div className="p-3 bg-muted/20 rounded-lg flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-xs">Controllo accessi basato su ruoli (RBAC)</span>
                </div>
                <div className="p-3 bg-muted/20 rounded-lg flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  <span className="text-xs">Backup giornalieri con crittografia</span>
                </div>
                <div className="p-3 bg-muted/20 rounded-lg flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-xs">Rate limiting (60 richieste/minuto)</span>
                </div>
                <div className="p-3 bg-muted/20 rounded-lg flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span className="text-xs">Audit logging e monitoraggio accessi</span>
                </div>
              </div>
            </section>

            {/* 7. SUB-RESPONSABILI DEL TRATTAMENTO */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">7. Sub-Responsabili del Trattamento</h2>
              <p>CondoConnect utilizza i seguenti sub-responsabili:</p>
              <div className="space-y-2 mt-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted/20 rounded-xl gap-2">
                  <div>
                    <span className="font-medium text-foreground">Supabase</span>
                    <p className="text-xs">Hosting, database PostgreSQL, autenticazione, storage S3</p>
                  </div>
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Conforme GDPR
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted/20 rounded-xl gap-2">
                  <div>
                    <span className="font-medium text-foreground">Cloudflare</span>
                    <p className="text-xs">CDN, protezione DDoS, sicurezza rete</p>
                  </div>
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Conforme GDPR
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted/20 rounded-xl gap-2">
                  <div>
                    <span className="font-medium text-foreground">Lemon Squeezy</span>
                    <p className="text-xs">Processore di pagamento, gestione abbonamenti</p>
                  </div>
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Conforme GDPR e PCI-DSS
                  </span>
                </div>
              </div>
            </section>

            {/* 8. DIRITTI DEGLI INTERESSATI */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">8. Diritti degli Interessati</h2>
              <p>
                Il Titolare (amministratore) è responsabile di gestire le richieste degli utenti finali (residenti) relative ai loro dati personali.
              </p>
              <p className="mt-2">
                CondoConnect fornisce gli strumenti per:
              </p>
              <ul className="list-disc pl-6 mt-1 space-y-1 text-xs">
                <li>Esportare i dati di un utente (portabilità) in formato JSON</li>
                <li>Cancellare un utente e tutti i suoi dati associati</li>
                <li>Modificare i dati personali (nome, cognome, email)</li>
                <li>Limitare l'accesso a documenti e post</li>
              </ul>
            </section>

            {/* 9. NOTIFICA DI VIOLAZIONE DEI DATI */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">9. Notifica di Violazione dei Dati</h2>
              <p>
                In caso di violazione dei dati personali, CondoConnect si impegna a:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-xs">
                <li><span className="font-medium text-foreground">Notificare il Titolare</span> entro 72 ore dalla scoperta</li>
                <li><span className="font-medium text-foreground">Fornire tutti i dettagli</span> della violazione (dati coinvolti, cause, misure)</li>
                <li><span className="font-medium text-foreground">Collaborare alla risoluzione</span> e alle comunicazioni con le autorità</li>
                <li><span className="font-medium text-foreground">Documentare la violazione</span> per audit futuri</li>
              </ul>
              <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-lg">
                <p className="text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
                  <span>📋</span>
                  <span>
                    <span className="font-medium">Contatto di emergenza:</span> In caso di violazione, contattare 
                    security@condoconnect.it (24/7)
                  </span>
                </p>
              </div>
            </section>

            {/* 10. AUDIT E ISPEZIONI */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">10. Audit e Ispezioni</h2>
              <p>
                CondoConnect si impegna a:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-xs">
                <li>Consentire audit da parte del Titolare su richiesta</li>
                <li>Fornire evidenze delle misure di sicurezza implementate</li>
                <li>Mantenere registri delle attività di trattamento</li>
                <li>Eseguire test di sicurezza periodici</li>
              </ul>
            </section>

            {/* 11. LEGGE APPLICABILE */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">11. Legge Applicabile e Foro Competente</h2>
              <p>
                Il presente DPA è regolato dalla <span className="font-medium text-foreground">legge italiana</span> 
                e dal Regolamento Generale sulla Protezione dei Dati (UE) 2016/679.
              </p>
              <p className="mt-2 text-xs">
                Foro competente: <span className="font-medium">Milano, Italia</span>
              </p>
            </section>

            {/* 12. CONTATTI */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">12. Contatti per il DPA</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <div className="p-3 bg-muted/20 rounded-lg flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-xs">dpa@condoconnect.it</span>
                </div>
                <div className="p-3 bg-muted/20 rounded-lg flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="text-xs">+39 02 1234567</span>
                </div>
                <div className="p-3 bg-muted/20 rounded-lg flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-xs">Via Roma, 1 - 00100 Milano, Italia</span>
                </div>
              </div>
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