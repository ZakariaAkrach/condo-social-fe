import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Mail,
  MessageCircle,
  Home,
  Users,
  Ticket,
  Bell,
  Layers,
  User,
  UserCog,
  CheckCircle,
  ArrowRightCircle,
  FileText,
  Megaphone,
  ShieldCheck,
  DollarSign,
  Wrench,
  Rocket,
  Info,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Servizi attuali – solo i tre core
const services = [
  {
    id: "post",
    title: "Post",
    description: "L'amministratore pubblica un messaggio, tutti i residenti lo vedono in tempo reale. Come un social, ma solo per il tuo condominio.",
    icon: Megaphone,
  },
  {
    id: "documenti",
    title: "Documenti",
    description: "Carica regolamenti, contratti o verbali e scegli esattamente chi può vederli. Sempre a portata di click.",
    icon: Layers,
  },
  {
    id: "ticket",
    title: "Ticket",
    description: "I residenti segnalano problemi, l'amministratore riceve notifica e risponde in modo tracciato. Niente più mail perse.",
    icon: Ticket,
  },
];

// Funzionalità in arrivo – con disclaimer esplicito
const upcomingFeatures = [
  {
    id: "spese",
    title: "Gestione Spese Condominiali",
    description: "Rendiconti chiari, preventivi da approvare e budget sempre sotto controllo. Tutto digitalizzato e tracciato.",
    icon: DollarSign,
  },
  {
    id: "fornitori",
    title: "Gestione Fornitori Esterni",
    description: "Coordina giardinieri, idraulici e imprese con un pannello unico. Assegna incarichi, monitora i lavori e tieni traccia dei pagamenti.",
    icon: Wrench,
  },
];

export default function LandingPage() {
  return (
    <div className="w-4/5 mx-auto py-10 sm:py-16">
      {/* ===== HERO – focus su chiarezza e gratuità ===== */}
      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Condominio digitale
            </span>
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-none text-xs font-semibold px-3 py-1">
              🎯 30 giorni gratis – nessuna carta
            </Badge>
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.05] sm:text-6xl">
            Post, documenti e ticket: <br />
            <span className="text-primary">il condominio si connette</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Un’unica bacheca dove l’amministratore comunica con tutti, condivide documenti importanti e gestisce le segnalazioni. 
            <br className="hidden sm:block" />
            <span className="font-medium text-foreground">Prova 30 giorni, zero impegno e nessuna carta di credito.</span>
            <br />
            <span className="text-sm text-primary/80 flex items-center gap-1">
              <Info className="h-4 w-4" />
              Presto (2027) anche gestione spese e fornitori – funzionalità in sviluppo, non ancora incluse.
            </span>
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-14 px-6 text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300">
              <a href="#services">Scopri i servizi</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-6 text-lg border-2">
              <Link to="/sign-up">Inizia la prova gratuita →</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground/70 flex items-center gap-1">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            Nessuna carta richiesta – disdici quando vuoi
          </p>
        </motion.div>

        {/* Flusso visivo – aggiornato con le tre azioni */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="hidden md:flex flex-col items-center justify-center rounded-2xl border bg-gradient-to-br from-card to-primary/5 p-6 shadow-md"
        >
          <div className="flex flex-col items-center gap-2 text-sm font-medium text-muted-foreground">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="flex flex-col items-center rounded-xl bg-background px-4 py-3 shadow-sm">
                <User className="h-8 w-8 text-primary" />
                <span className="mt-1 text-xs">Residente</span>
              </div>
              <ArrowRightCircle className="h-6 w-6 text-primary/60" />
              <div className="flex flex-col items-center rounded-xl bg-background px-4 py-3 shadow-sm">
                <Megaphone className="h-8 w-8 text-primary" />
                <span className="mt-1 text-xs">Legge post</span>
              </div>
              <ArrowRightCircle className="h-6 w-6 text-primary/60" />
              <div className="flex flex-col items-center rounded-xl bg-background px-4 py-3 shadow-sm">
                <UserCog className="h-8 w-8 text-primary" />
                <span className="mt-1 text-xs">Amministratore</span>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
              <div className="flex flex-col items-center rounded-xl bg-background px-4 py-3 shadow-sm">
                <FileText className="h-8 w-8 text-blue-500" />
                <span className="mt-1 text-xs">Carica documento</span>
              </div>
              <ArrowRightCircle className="h-6 w-6 text-primary/60" />
              <div className="flex flex-col items-center rounded-xl bg-background px-4 py-3 shadow-sm">
                <Ticket className="h-8 w-8 text-orange-500" />
                <span className="mt-1 text-xs">Apre ticket</span>
              </div>
              <ArrowRightCircle className="h-6 w-6 text-primary/60" />
              <div className="flex flex-col items-center rounded-xl bg-background px-4 py-3 shadow-sm">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <span className="mt-1 text-xs">Risolve</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground/70">
              🔄 Tutto tracciato, trasparente, senza intoppi
            </p>
          </div>
        </motion.div>
      </section>

      {/* ===== SERVIZI – solo tre, con copy beneficio ===== */}
      <section id="services" className="py-14">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold sm:text-3xl">Tre strumenti per un condominio connesso</h2>
          <p className="mt-3 text-muted-foreground">
            L’amministratore comunica, condivide e gestisce; i residenti leggono, consultano e segnalano. Tutto in una bacheca chiara.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link key={service.id} to={`/servizio/${service.id}`} className="group">
              <Card className="h-full border border-black/5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-xl hover:shadow-black/10">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    <service.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-base">{service.title}</CardTitle>
                  <CardDescription className="text-sm">{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <span className="text-sm font-semibold text-primary group-hover:underline">Scopri di più →</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== PROSSIME FUNZIONALITÀ – Spese e Fornitori (con disclaimer legale) ===== */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: "-40px" }}
        className="py-14 border-t border-b border-primary/10 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-2xl"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <Badge variant="outline" className="mb-4 px-4 py-2 text-sm font-semibold border-primary/30 text-primary flex items-center justify-center gap-2 w-fit mx-auto">
              <Rocket className="h-4 w-4" />
              In arrivo nel 2027
            </Badge>
            <h2 className="text-3xl font-bold sm:text-4xl tracking-tight">
              Presto anche la gestione <br className="sm:hidden" />
              <span className="text-primary">spese e fornitori</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Stiamo sviluppando due nuovi moduli per rendere il tuo condominio ancora più autonomo. 
              Tutto integrato con la bacheca che già conosci.
            </p>
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 flex items-start gap-2 text-left">
              <Info className="h-5 w-5 flex-shrink-0 mt-0.5 text-amber-600" />
              <p>
                <span className="font-semibold">Nota importante:</span> Queste funzionalità sono in fase di sviluppo 
                e <strong>non sono incluse</strong> nel servizio attuale. Saranno disponibili a partire dal 2027. 
                Le tempistiche potrebbero variare.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {upcomingFeatures.map((feature) => (
              <Card
                key={feature.id}
                className="relative border border-dashed border-primary/30 bg-card/40 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/50"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-medium">
                      In sviluppo
                    </Badge>
                  </div>
                  <CardDescription className="text-sm mt-2">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2 text-sm text-muted-foreground/70">
                    <div className="flex items-center gap-1">
                      <Rocket className="h-4 w-4 text-primary/50" />
                      <span>Disponibile dal 2027 – non incluso al momento</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground/50">
                      <Info className="h-3 w-3" />
                      <span>Funzionalità in fase di sviluppo, soggetta a modifiche</span>
                    </div>
                  </div>
                </CardContent>
                <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-t from-white/5 to-transparent" />
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button variant="outline" className="border-primary/20 hover:bg-primary/5" asChild>
              <a href="mailto:info@condoconnect.it?subject=Voglio%20essere%20avvisato%20su%20spese%20e%20fornitori">
                <Bell className="mr-2 h-4 w-4" />
                Avvisami quando sono disponibili
              </a>
            </Button>
          </div>
        </div>
      </motion.section>

      {/* ===== COME FUNZIONA – tre passi chiari ===== */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: "-40px" }}
        className="py-16"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="outline" className="mb-5 px-5 py-4 text-md font-semibold tracking-wide uppercase text-primary">
              In tre passi
            </Badge>
            <h2 className="text-3xl font-bold sm:text-4xl tracking-tight">
              Da zero a condominio connesso in 5 minuti
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Nessuna installazione, nessuna competenza tecnica. Basta un link e sei dentro.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="relative border shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-primary/5">
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-3xl text-primary">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold">1. Registrati e invita</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  L’amministratore crea il condominio, i residenti ricevono un link e si uniscono in pochi click.
                </p>
                <div className="mt-4 hidden md:block text-xs font-medium text-primary/70">
                  <ArrowRight className="inline h-4 w-4 ml-1" />
                </div>
              </CardContent>
            </Card>

            <Card className="relative border shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-primary/5">
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-3xl text-primary">
                  <Megaphone className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold">2. Comunica e condividi</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Pubblica post, allega documenti con visibilità selettiva, apri e rispondi ai ticket. Tutto in tempo reale.
                </p>
                <div className="mt-4 hidden md:block text-xs font-medium text-primary/70">
                  <ArrowRight className="inline h-4 w-4 ml-1" />
                </div>
              </CardContent>
            </Card>

            <Card className="relative border shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-primary/5">
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-3xl text-primary">
                  <Home className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold">3. Gestisci e consulta</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Tutto rimane nella bacheca: i residenti trovano comunicazioni, documenti e lo stato dei ticket sempre aggiornato.
                </p>
                <div className="mt-4 hidden md:block text-xs font-medium text-primary/70">
                  <ArrowRight className="inline h-4 w-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </div>

          <p className="mt-10 text-center text-sm text-muted-foreground/70 max-w-md mx-auto">
            ⚡ Prova gratuita 30 giorni – nessuna carta di credito, cancellati quando vuoi.
          </p>
        </div>
      </motion.section>

      {/* ===== FAQ – con domanda sulla gratuità e sulla sicurezza ===== */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        viewport={{ once: true, margin: "-40px" }}
        className="py-12"
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl font-bold sm:text-4xl tracking-tight">
              Domande frequenti
            </h2>
            <p className="mt-3 text-muted-foreground">
              Tutto quello che devi sapere, in poche righe.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            <AccordionItem value="item-0" className="rounded-2xl border bg-card/50 px-4 transition-all data-[state=open]:bg-card data-[state=open]:shadow-sm">
              <AccordionTrigger className="py-4 text-base font-medium hover:no-underline [&>svg]:text-primary">
                La prova gratuita richiede la carta di credito?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground pb-4">
                No, assolutamente. Puoi provare tutte le funzionalità per 30 giorni senza inserire alcun dato di pagamento. 
                Se dopo il periodo di prova decidi di continuare, potrai scegliere un piano, altrimenti il tuo account verrà sospeso senza alcun addebito.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-1" className="rounded-2xl border bg-card/50 px-4 transition-all data-[state=open]:bg-card data-[state=open]:shadow-sm">
              <AccordionTrigger className="py-4 text-base font-medium hover:no-underline [&>svg]:text-primary">
                I dati sono sicuri?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground pb-4">
                I dati viaggiano e sono salvati con crittografia HTTPS/TLS. Ogni condominio ha il proprio spazio isolato: nessun dato è visibile ad altri condomini. 
                Non vendiamo i tuoi dati e puoi richiedere la cancellazione definitiva in qualsiasi momento.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="rounded-2xl border bg-card/50 px-4 transition-all data-[state=open]:bg-card data-[state=open]:shadow-sm">
              <AccordionTrigger className="py-4 text-base font-medium hover:no-underline [&>svg]:text-primary">
                Servono competenze tecniche?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground pb-4">
                No. La piattaforma è progettata per essere intuitiva: l’amministratore scrive post, carica documenti e gestisce ticket con pochi click. I residenti leggono e segnalano senza alcuna formazione.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="rounded-2xl border bg-card/50 px-4 transition-all data-[state=open]:bg-card data-[state=open]:shadow-sm">
              <AccordionTrigger className="py-4 text-base font-medium hover:no-underline [&>svg]:text-primary">
                Cosa succede dopo i 30 giorni?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground pb-4">
                Riceverai un promemoria prima della scadenza. Potrai abbonarti a uno dei piani mensili o annuali, oppure interrompere il servizio in qualsiasi momento. I tuoi dati rimarranno disponibili per il download per 30 giorni dopo la scadenza.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="rounded-2xl border bg-card/50 px-4 transition-all data-[state=open]:bg-card data-[state=open]:shadow-sm">
              <AccordionTrigger className="py-4 text-base font-medium hover:no-underline [&>svg]:text-primary">
                Le funzionalità spese e fornitori sono già disponibili?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground pb-4">
                No, sono in fase di sviluppo e saranno rilasciate a partire dal 2027. <strong>Non sono incluse</strong> nel servizio che stai acquistando oggi. 
                Tutti gli utenti attivi verranno avvisati via email non appena saranno disponibili. (<strong>le tempistiche potrebbero variare</strong>)
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </motion.section>

      {/* ===== FOOTER – aggiornato con disclaimer legale ===== */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="mt-16 border-t bg-secondary/5"
      >
        <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-extrabold tracking-tight text-foreground">
                  CondoConnect
                </span>
                <Badge variant="outline" className="text-xs font-medium border-primary/20">
                  Beta
                </Badge>
              </div>
              <p className="max-w-xs text-sm text-muted-foreground leading-relaxed">
                Post, documenti e ticket per un condominio senza attriti.
              </p>
              <p className="text-xs text-muted-foreground/60">
                <span className="font-medium">Email:</span>{" "}
                <a href="mailto:info@condoconnect.it" className="hover:text-foreground transition-colors">
                  info@condoconnect.it
                </a>
              </p>
              <div className="flex gap-3 pt-1">
                <a href="#" className="text-muted-foreground/60 hover:text-foreground transition-colors" aria-label="LinkedIn">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground/60 hover:text-foreground transition-colors" aria-label="Twitter">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground">Info legali</h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                    Termini
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" className="text-muted-foreground hover:text-foreground transition-colors">
                    Cookie
                  </Link>
                </li>
                <li>
                  <Link to="/disclaimer" className="text-muted-foreground hover:text-foreground transition-colors">
                    Disclaimer
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground">Hai domande?</h4>
              <p className="text-sm text-muted-foreground">
                Scrivici, rispondiamo in 24 ore.
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto h-12 px-6 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <a href="mailto:info@condoconnect.it?subject=Richiesta%20informazioni%20CondoConnect&body=Ciao%20CondoConnect%2C%20vorrei%20avere%20maggiori%20informazioni%20su...">
                    <Mail className="mr-2 h-5 w-5" />
                    Contattaci
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto h-12 px-6 text-base font-semibold rounded-xl border-2 hover:bg-primary/5 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <a href="mailto:info@condoconnect.it?subject=Feedback%20CondoConnect&body=Ciao%2C%20ecco%20il%20mio%20feedback%3A%0A%0A">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Feedback
                  </a>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground/60">
                ✉️ Risposta in 24 ore lavorative
              </p>
            </div>
          </div>

          <div className="my-10 h-px bg-border" />

          {/* Disclaimer legale aggiuntivo */}
          <div className="mb-6 p-4 bg-primary/5 border border-primary/10 rounded-xl text-xs text-muted-foreground/70 text-center">
            <p className="flex items-center justify-center gap-2">
              <Info className="h-4 w-4 text-primary/50" />
              <span>
                <strong>Nota informativa:</strong> Le funzionalità indicate come "in arrivo" (gestione spese e fornitori) sono in fase di sviluppo e 
                <strong> non costituiscono un obbligo contrattuale</strong>. Le tempistiche di rilascio potrebbero variare. 
                Il servizio attuale include esclusivamente le funzionalità di Post, Documenti e Ticket.
              </span>
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 text-center text-xs text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
            <p>
              &copy; {new Date().getFullYear()} CondoConnect. Tutti i diritti riservati.
            </p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
              <span>P.IVA: 01234567890</span>
              <span className="hidden sm:inline">·</span>
              <span>Via Roma, 1 – 00100 Milano</span>
            </div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Prova gratuita 30 giorni – nessuna carta richiesta
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}