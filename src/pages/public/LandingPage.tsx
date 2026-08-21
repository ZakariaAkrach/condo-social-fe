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
  DollarSign,
  Wrench,
  Bell,
  Layers,
  User,
  UserCog,
  CheckCircle,
  ArrowRightCircle,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Servizi – titoli e descrizioni orientati al beneficio
const services = [
  {
    id: "ticket",
    title: "Ticket",
    description: "Segnala problemi e ricevi risposte in tempo reale. Niente più email perse.",
    icon: Ticket,
  },
  {
    id: "spese",
    title: "Spese",
    description: "Rendiconti chiari, preventivi da approvare, budget sempre sotto controllo.",
    icon: DollarSign,
  },
  {
    id: "manutenzione",
    title: "Fornitori",
    description: "Coordina giardinieri, idraulici e imprese con un pannello unico.",
    icon: Wrench,
  },
  {
    id: "comunicazioni",
    title: "Comunicazioni",
    description: "Post e notifiche per tenere tutti aggiornati, come sui social.",
    icon: Bell,
  },
  {
    id: "documenti",
    title: "Archivio",
    description: "Regolamenti, contratti e verbali sempre a portata di click.",
    icon: Layers,
  },
];

export default function LandingPage() {
  return (
    <div className="w-4/5 mx-auto py-10 sm:py-16">
      {/* ===== HERO – copy diretto ===== */}
      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <h1 className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Condominio digitale
          </h1>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.05] sm:text-6xl">
            Amministratore e residenti: <br />
            <span className="text-primary">connessi in un click</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Addio a email perse, chat confuse e fogli volanti. <br />
            Ticket, comunicazioni, spese e fornitori: tutto in una piattaforma chiara, per condomini senza stress.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-14 px-5 text-lg">
              <a href="#services">Scopri i servizi</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-5 text-lg">
              <Link to="/sign-up">Prova la demo</Link>
            </Button>
          </div>
        </motion.div>

        {/* Flusso visivo – rimasto uguale ma con copy più scarno */}
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
                <Ticket className="h-8 w-8 text-primary" />
                <span className="mt-1 text-xs">Apre ticket</span>
              </div>
              <ArrowRightCircle className="h-6 w-6 text-primary/60" />
              <div className="flex flex-col items-center rounded-xl bg-background px-4 py-3 shadow-sm">
                <UserCog className="h-8 w-8 text-primary" />
                <span className="mt-1 text-xs">Amministratore</span>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
              <div className="flex flex-col items-center rounded-xl bg-background px-4 py-3 shadow-sm">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <span className="mt-1 text-xs">Risposta</span>
              </div>
              <ArrowRightCircle className="h-6 w-6 text-primary/60" />
              <div className="flex flex-col items-center rounded-xl bg-background px-4 py-3 shadow-sm">
                <Bell className="h-8 w-8 text-primary" />
                <span className="mt-1 text-xs">Notifica</span>
              </div>
              <ArrowRightCircle className="h-6 w-6 text-primary/60" />
              <div className="flex flex-col items-center rounded-xl bg-background px-4 py-3 shadow-sm">
                <Home className="h-8 w-8 text-primary" />
                <span className="mt-1 text-xs">Risolto</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground/70">
              🔄 Tracciato, trasparente, senza intoppi
            </p>
          </div>
        </motion.div>
      </section>

      {/* ===== SERVIZI – copy beneficio ===== */}
      <section id="services" className="py-14">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold sm:text-3xl">Tutto per un condominio connesso</h2>
          <p className="mt-3 text-muted-foreground">
            Dalle segnalazioni ai pagamenti, fino ai fornitori: una sola piattaforma per tutti.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {services.map((service) => (
            <Link key={service.id} to={`/servizio/${service.id}`} className="group">
              <Card className="h-full border border-black/5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-xl hover:shadow-black/10">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <service.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-base">{service.title}</CardTitle>
                  <CardDescription className="text-sm">{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <span className="text-sm font-semibold text-primary">Scopri</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== COME FUNZIONA – 3 passi asciutti ===== */}
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
              Come funziona CondoConnect
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Amministratori e residenti: collaborazione trasparente, zero perdite di tempo.
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
                  L’amministratore crea il condominio, i residenti entrano con un link. In 2 minuti sei online.
                </p>
                <div className="mt-4 hidden md:block text-xs font-medium text-primary/70">
                  <ArrowRight className="inline h-4 w-4 ml-1" />
                </div>
              </CardContent>
            </Card>

            <Card className="relative border shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-primary/5">
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-3xl text-primary">
                  <Ticket className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold">2. Ticket e post</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  I residenti segnalano, l’amministratore risponde e pubblica aggiornamenti in tempo reale.
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
                <h3 className="text-xl font-semibold">3. Gestisci e cresci</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Monitora spese, approva preventivi, coordina i fornitori. Tutto in dashboard.
                </p>
                <div className="mt-4 hidden md:block text-xs font-medium text-primary/70">
                  <ArrowRight className="inline h-4 w-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </div>

          <p className="mt-10 text-center text-sm text-muted-foreground/70 max-w-md mx-auto">
            ⚡ In arrivo: assemblee digitali e archivio avanzato.
          </p>
        </div>
      </motion.section>

      {/* ===== FAQ – risposte concise ===== */}
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
            <AccordionItem value="item-1" className="rounded-2xl border bg-card/50 px-4 transition-all data-[state=open]:bg-card data-[state=open]:shadow-sm">
              <AccordionTrigger className="py-4 text-base font-medium hover:no-underline [&>svg]:text-primary">
                È gratuito?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground pb-4">
                Sì, hai 30 giorni di prova gratuita con tutte le funzionalità, senza impegno.
                Dopo la prova puoi scegliere il piano più adatto al tuo condominio.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="rounded-2xl border bg-card/50 px-4 transition-all data-[state=open]:bg-card data-[state=open]:shadow-sm">
              <AccordionTrigger className="py-4 text-base font-medium hover:no-underline [&>svg]:text-primary">
                I dati sono sicuri?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground pb-4">
                I dati viaggiano e sono salvati con crittografia: HTTPS/TLS in transito.
                <br/> Ogni condominio ha il proprio spazio separato: i dati di un condominio non sono visibili agli altri.
                <br/> Non vendiamo dati a terzi. Puoi richiedere in ogni momento l’eliminazione definitiva dei dati del tuo condominio.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="rounded-2xl border bg-card/50 px-4 transition-all data-[state=open]:bg-card data-[state=open]:shadow-sm">
              <AccordionTrigger className="py-4 text-base font-medium hover:no-underline [&>svg]:text-primary">
                Servono competenze tecniche?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground pb-4">
                No. È pensato per essere usato da chiunque, anche senza esperienza.
                L’amministratore può invitare residenti e collaboratori in pochi click.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="rounded-2xl border bg-card/50 px-4 transition-all data-[state=open]:bg-card data-[state=open]:shadow-sm">
              <AccordionTrigger className="py-4 text-base font-medium hover:no-underline [&>svg]:text-primary">
                Come gestisco le spese?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground pb-4">
                Puoi registrare le spese, caricare allegati e inviare notifiche ai residenti.
                I pagamenti online arriveranno a breve.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </motion.section>

      {/* ===== FOOTER – alleggerito ma completo ===== */}
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
                Ticket, comunicazioni, spese e fornitori: tutto in una dashboard.
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
              Strumento informativo – verifica con il tuo amministratore
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}