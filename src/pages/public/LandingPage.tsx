import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Users,
  Ticket,
  Layers,
  User,
  UserCog,
  CheckCircle,
  FileText,
  Megaphone,
  ShieldCheck,
  DollarSign,
  Wrench,
  Rocket,
  Info,
  Zap,
  Building2,
  Database,
  Check,
  Clock,
  Mail,
  MessageCircle,
  ChevronRight,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const services = [
  {
    id: "post",
    title: "Post – Comunicazioni chiare e tracciabili",
    description: "Pubblica messaggi visibili a tutti i residenti in tempo reale. Niente più chat disperse o comunicazioni perse.",
    icon: Megaphone,
  },
  {
    id: "documenti",
    title: "Documenti – Archiviazione sicura e condivisa",
    description: "Carica e gestisci documenti con controllo granulare degli accessi. Ogni residente vede solo ciò che gli compete.",
    icon: Layers,
  },
  {
    id: "ticket",
    title: "Ticket – Segnalazioni gestite con precisione",
    description: "I residenti segnalano problemi, l'amministratore riceve notifiche e risponde in modo tracciato. Fine delle comunicazioni perse.",
    icon: Ticket,
  },
];

const upcomingFeatures = [
  {
    id: "spese",
    title: "Gestione Spese Condominiali",
    description: "Rendiconti trasparenti, preventivi da approvare e budget sotto controllo. Tutto digitalizzato e tracciato.",
    icon: DollarSign,
  },
  {
    id: "fornitori",
    title: "Gestione Fornitori Esterni",
    description: "Coordina manutentori e fornitori con un pannello unico. Assegna incarichi, monitora i lavori e tieni traccia dei pagamenti.",
    icon: Wrench,
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function LandingPage() {
  return (
    <div className="w-full px-4 sm:px-6 md:px-8 lg:w-4/5 lg:mx-auto py-4 sm:py-6 md:py-8">
      {/* HERO */}
      <section className="relative overflow-hidden py-4 md:py-8">
        <div className="grid gap-8 md:gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-3 md:mb-4 bg-primary/5 text-primary hover:bg-primary/10 border border-primary/20 text-xs md:text-sm font-medium px-3 md:px-4 py-1 md:py-1.5">
              Prova gratuita 30 giorni
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
              Addio WhatsApp e mail perse:{' '}
              <span className="text-primary">tutto il condominio in una bacheca</span>
            </h1>
            <p className="mt-4 md:mt-6 text-base md:text-lg text-muted-foreground max-w-xl">
              Immagina: niente più WhatsApp con 50 chat, niente mail che si perdono, niente fogli attaccati in bacheca.
              Tutto in un'unica bacheca digitale. Post, documenti, ticket. In tempo reale. Per tutti.
            </p>

            <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 md:gap-4">
              <Button asChild size="lg" className="h-12 md:h-14 px-6 md:px-8 text-sm md:text-base font-medium shadow-lg shadow-primary/20 w-full sm:w-auto">
                <Link to="/sign-up">Prova gratuita 30 giorni</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 md:h-14 px-6 md:px-8 text-sm md:text-base font-medium w-full sm:w-auto">
                <a href="#services">Scopri come funziona</a>
              </Button>
            </div>
            <p className="mt-3 md:mt-4 text-xs md:text-sm text-muted-foreground/70 flex items-center gap-2 justify-center sm:justify-start">
              <ShieldCheck className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-600 shrink-0" />
              Registrati in pochi secondi. Nessuna carta di credito richiesta.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center justify-center rounded-2xl border bg-gradient-to-br from-card to-primary/5 p-4 md:p-6 shadow-sm"
          >
            <div className="grid grid-cols-3 gap-2 md:gap-4 text-sm font-medium text-muted-foreground w-full">
              <div className="flex flex-col items-center rounded-xl bg-background px-2 py-3 shadow-sm border">
                <User className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                <span className="mt-1 text-[10px] md:text-xs">Residente</span>
              </div>
              <div className="flex flex-col items-center rounded-xl bg-background px-2 py-3 shadow-sm border">
                <Megaphone className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                <span className="mt-1 text-[10px] md:text-xs">Legge post</span>
              </div>
              <div className="flex flex-col items-center rounded-xl bg-background px-2 py-3 shadow-sm border">
                <UserCog className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                <span className="mt-1 text-[10px] md:text-xs">Amministratore</span>
              </div>
            </div>
            <div className="mt-3 md:mt-4 grid grid-cols-3 gap-2 md:gap-4 w-full">
              <div className="flex flex-col items-center rounded-xl bg-background px-2 py-3 shadow-sm border">
                <FileText className="h-6 w-6 md:h-8 md:w-8 text-blue-500" />
                <span className="mt-1 text-[10px] md:text-xs">Carica doc</span>
              </div>
              <div className="flex flex-col items-center rounded-xl bg-background px-2 py-3 shadow-sm border">
                <Ticket className="h-6 w-6 md:h-8 md:w-8 text-orange-500" />
                <span className="mt-1 text-[10px] md:text-xs">Apre ticket</span>
              </div>
              <div className="flex flex-col items-center rounded-xl bg-background px-2 py-3 shadow-sm border">
                <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-green-500" />
                <span className="mt-1 text-[10px] md:text-xs">Risolve</span>
              </div>
            </div>
            <p className="mt-3 md:mt-4 text-[10px] md:text-xs text-muted-foreground/70">
              Tutto tracciato e trasparente
            </p>
          </motion.div>
        </div>
      </section>

      {/* SERVIZI */}
      <section id="services" className="py-8 md:py-10">
        <div className="max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold">Tre strumenti per una gestione efficace</h2>
          <p className="mt-2 md:mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">
            L'amministratore comunica senza perdere tempo, i residenti trovano tutto senza cercare.
          </p>
        </div>
        <div className="mt-6 md:mt-8 grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              variants={{cardVariants}}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full border border-black/5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:shadow-black/5">
                <CardHeader className="p-4 md:p-6">
                  <div className="mb-2 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-primary/5 text-primary border border-primary/10">
                    <service.icon className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <CardTitle className="text-sm md:text-base">{service.title}</CardTitle>
                  <CardDescription className="text-xs md:text-sm leading-relaxed">{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0 mt-auto">
                  <span className="text-xs md:text-sm font-medium text-primary hover:underline flex items-center gap-1">
                    Scopri di più <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
                  </span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PROSSIME FUNZIONALITÀ */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: "-40px" }}
        className="py-10 md:py-14 border-t border-b border-primary/5 bg-gradient-to-r from-primary/[0.02] via-transparent to-primary/[0.02] rounded-2xl mt-10 md:mt-16"
      >
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-8 md:mb-10">
            <Badge variant="outline" className="mb-3 md:mb-4 px-3 md:px-4 py-1 md:py-1.5 text-xs md:text-sm font-medium border-primary/20 text-primary flex items-center justify-center gap-2 w-fit mx-auto">
              <Rocket className="h-3 w-3 md:h-4 md:w-4" />
              In fase di sviluppo
            </Badge>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
              Nuove funzionalità in arrivo
            </h2>
            <p className="mt-3 md:mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
              Il servizio attuale risolve già le principali esigenze di comunicazione condominiale.
              Presto introdurremo strumenti aggiuntivi per una gestione ancora più completa.
            </p>
          </div>

          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
            {upcomingFeatures.map((feature) => (
              <Card
                key={feature.id}
                className="relative border border-dashed border-primary/20 bg-card/40 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md"
              >
                <CardHeader className="p-4 md:p-6">
                  <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-3">
                    <div className="flex items-center gap-2 md:gap-3 w-full">
                      <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-primary/5 text-primary border border-primary/10 shrink-0">
                        <feature.icon className="h-5 w-5 md:h-6 md:w-6" />
                      </div>
                      <CardTitle className="text-sm md:text-lg flex-1">{feature.title}</CardTitle>
                    </div>
                    <Badge className="bg-primary/5 text-primary border-primary/20 text-[10px] md:text-xs font-medium shrink-0">
                      In sviluppo
                    </Badge>
                  </div>
                  <CardDescription className="text-xs md:text-sm mt-2 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <div className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground/70">
                    <Clock className="h-3 w-3 md:h-4 md:w-4 text-primary/50" />
                    <span>Disponibile entro fine 2027</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 md:mt-8 text-center">
            <Button variant="outline" className="border-primary/20 hover:bg-primary/5 text-sm md:text-base" asChild>
              <a href="mailto:info@condoconnect.it?subject=Avvisami%20su%20nuove%20funzionalit%C3%A0&body=Quale%20funzionalit%C3%A0%20ti%20interessa%20di%20pi%C3%B9%3F%0A%0A%5B%20%5D%20Gestione%20spese%0A%5B%20%5D%20Gestione%20fornitori%0A%5B%20%5D%20Entrambe">
                <Mail className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                Avvisami quando saranno disponibili
              </a>
            </Button>
          </div>
        </div>
      </motion.section>

      {/* COME FUNZIONA */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: "-40px" }}
        className="py-10 md:py-16"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
            <Badge variant="outline" className="mb-3 md:mb-5 px-4 md:px-5 py-1 md:py-1.5 text-xs md:text-sm font-medium tracking-wide uppercase text-primary border-primary/20">
              In tre passi
            </Badge>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
              Da zero a condominio connesso in 5 minuti
            </h2>
            <p className="mt-3 md:mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
              Nessuna installazione, nessuna competenza tecnica. Basta un link e sei operativo.
            </p>
          </div>

          <div className="grid gap-4 md:gap-8 grid-cols-1 md:grid-cols-3">
            {[
              { step: "1", title: "Registrati e invita", desc: "L'amministratore crea il condominio in pochi minuti. I residenti ricevono un link e si uniscono con un click.", icon: Users },
              { step: "2", title: "Comunica e condividi", desc: "Pubblica post, allega documenti con visibilità selettiva, apri e rispondi ai ticket. Tutto in tempo reale e tracciato.", icon: Megaphone },
              { step: "3", title: "Gestisci e consulta", desc: "Tutto rimane nella bacheca: i residenti trovano comunicazioni, documenti e lo stato dei ticket sempre aggiornato.", icon: Home },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="relative border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:shadow-primary/5">
                  <CardContent className="p-4 md:p-6 text-center">
                    <div className="mx-auto mb-3 md:mb-4 flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-primary/5 text-2xl md:text-3xl font-bold text-primary border border-primary/10">
                      {item.step}
                    </div>
                    <div className="mx-auto mb-3 md:mb-4 flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-2xl bg-primary/5 text-primary border border-primary/10">
                      <item.icon className="h-6 w-6 md:h-7 md:w-7" />
                    </div>
                    <h3 className="text-base md:text-xl font-semibold">{item.title}</h3>
                    <p className="mt-1 md:mt-2 text-xs md:text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    <div className="mt-3 md:mt-4 flex justify-center gap-2">
                      <Button variant="ghost" size="sm" className="text-[10px] md:text-xs text-muted-foreground/70 h-7 md:h-8">
                        <Clock className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" /> Circa 2 minuti
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <p className="mt-8 md:mt-10 text-center text-xs md:text-sm text-muted-foreground/70 max-w-md mx-auto">
            Prova gratuita 30 giorni – Nessuna carta di credito richiesta, cancella quando vuoi.
          </p>
        </div>
      </motion.section>

      {/* FAQ */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        viewport={{ once: true, margin: "-40px" }}
        className="py-10 md:py-12"
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-8 md:mb-10">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
              Domande frequenti
            </h2>
            <p className="mt-2 md:mt-3 text-sm md:text-base text-muted-foreground">
              Le risposte che cerchi prima di iniziare.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-2 md:space-y-3">
            {[
              {
                value: "item-0",
                question: "La prova gratuita richiede la carta di credito?",
                answer: "No. Puoi provare tutte le funzionalità per 30 giorni senza inserire alcun dato di pagamento. Se dopo il periodo di prova decidi di continuare, potrai scegliere un piano. In caso contrario, il tuo account verrà sospeso senza alcun addebito."
              },
              {
                value: "item-1",
                question: "I dati sono al sicuro?",
                answer: "I dati sono crittografati con protocolli HTTPS/TLS, lo stesso standard utilizzato dalle banche. Ogni condominio ha il proprio spazio isolato: nessun dato è visibile ad altri condomini. Non vendiamo i tuoi dati e puoi richiedere la cancellazione definitiva in qualsiasi momento."
              },
              {
                value: "item-2",
                question: "Servono competenze tecniche?",
                answer: "No. La piattaforma è progettata per essere intuitiva: l'amministratore scrive post, carica documenti e gestisce ticket con pochi click. I residenti leggono e segnalano senza alcuna formazione."
              },
              {
                value: "item-3",
                question: "Cosa succede dopo i 30 giorni di prova?",
                answer: "Al termine del periodo di prova, puoi scegliere uno dei piani disponibili per continuare a utilizzare il servizio. I tuoi dati rimarranno tutti al sicuro e non dovrai riconfigurare nulla. Se decidi di non proseguire, il tuo account verrà sospeso senza costi."
              },
              {
                value: "item-4",
                question: "Posso cambiare piano in qualsiasi momento?",
                answer: "Sì. Puoi passare da un piano all'altro in qualsiasi momento con un semplice click. I tuoi dati rimangono tutti al sicuro e nessuna configurazione aggiuntiva è necessaria."
              }
            ].map((item) => (
              <AccordionItem key={item.value} value={item.value} className="rounded-xl md:rounded-2xl border bg-card/50 px-3 md:px-4 transition-all data-[state=open]:bg-card data-[state=open]:shadow-sm">
                <AccordionTrigger className="py-3 md:py-4 text-sm md:text-base font-medium hover:no-underline [&>svg]:text-primary text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-xs md:text-sm text-muted-foreground pb-3 md:pb-4 leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </motion.section>

      {/* PRICING */}
      <section className="py-10 md:py-16 bg-background" id="pricing">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
            <Badge variant="outline" className="mb-3 md:mb-4 px-3 md:px-4 py-1 md:py-1.5 text-xs md:text-sm font-medium border-primary/20 text-primary">
              Pricing trasparente
            </Badge>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-2 md:mb-3">
              Paga solo per ciò che usi
            </h2>
            <p className="text-sm md:text-lg text-muted-foreground leading-relaxed">
              Tutti partono con 30 giorni di prova gratuita.
              Scegli poi il piano più adatto al tuo condominio.
            </p>
          </div>

          {/* Mese gratuito in evidenza */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
            className="mb-8 md:mb-10 max-w-2xl mx-auto"
          >
            <Card className="border-2 border-green-500/30 bg-gradient-to-r from-green-50/50 to-primary/5 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 p-4 md:p-6">
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="inline-flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-green-100 text-green-600 text-xs md:text-sm font-bold">30</span>
                    <span className="text-xs md:text-sm font-semibold text-green-700 uppercase tracking-wide">Giorni di prova gratuita</span>
                  </div>
                  <p className="text-[10px] md:text-sm text-muted-foreground mt-1">
                    Include <span className="font-medium text-foreground">5 GB</span> di spazio e <span className="font-medium text-foreground">3 condomini</span>
                  </p>
                </div>
                <div className="flex-shrink-0 w-full sm:w-auto">
                  <Button asChild size="lg" className="h-10 md:h-12 px-6 md:px-8 text-sm md:text-base font-medium shadow-md shadow-primary/20 w-full sm:w-auto">
                    <Link to="/sign-up">Inizia la prova gratuita</Link>
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Piani */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Starter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <Card className="flex flex-col h-full border shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="pb-3 md:pb-4 p-4 md:p-6">
                  <CardTitle className="text-lg md:text-xl font-semibold">Starter</CardTitle>
                  <CardDescription className="text-xs md:text-sm">Per piccoli condomini</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 p-4 md:p-6 pt-0">
                  <div className="mb-4 md:mb-6">
                    <span className="text-3xl md:text-4xl font-bold">9€</span>
                    <span className="text-sm md:text-base font-normal text-muted-foreground ml-1">/mese</span>
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-center justify-between border-b border-border/50 pb-2 md:pb-3">
                      <span className="text-xs md:text-sm text-muted-foreground">Condomini</span>
                      <span className="text-xs md:text-sm font-semibold">Fino a 5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm text-muted-foreground">Spazio</span>
                      <span className="text-xs md:text-sm font-semibold">7 GB</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 p-4 md:p-6">
                  <Button asChild className="w-full" variant="outline" size="lg">
                    <Link to="/sign-up">Scegli Starter</Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>

            {/* Premium */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative"
            >
              <Card className="flex flex-col h-full border-2 border-primary shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute -top-2 md:-top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 md:px-4 py-0.5 md:py-1 text-[10px] md:text-sm font-medium shadow-sm">
                    Più scelto
                  </Badge>
                </div>
                <CardHeader className="pb-3 md:pb-4 pt-5 md:pt-6 p-4 md:p-6">
                  <CardTitle className="text-lg md:text-xl font-semibold text-primary">Premium</CardTitle>
                  <CardDescription className="text-xs md:text-sm">La soluzione più equilibrata</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 p-4 md:p-6 pt-0">
                  <div className="mb-4 md:mb-6">
                    <span className="text-3xl md:text-4xl font-bold text-primary">19€</span>
                    <span className="text-sm md:text-base font-normal text-muted-foreground ml-1">/mese</span>
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-center justify-between border-b border-border/50 pb-2 md:pb-3">
                      <span className="text-xs md:text-sm text-muted-foreground">Condomini</span>
                      <span className="text-xs md:text-sm font-semibold">Fino a 10</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm text-muted-foreground">Spazio</span>
                      <span className="text-xs md:text-sm font-semibold">15 GB</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 p-4 md:p-6">
                  <Button asChild className="w-full" size="lg">
                    <Link to="/sign-up">Scegli Premium</Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>

            {/* Enterprise */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <Card className="flex flex-col h-full border shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="pb-3 md:pb-4 p-4 md:p-6">
                  <CardTitle className="text-lg md:text-xl font-semibold">Enterprise</CardTitle>
                  <CardDescription className="text-xs md:text-sm">Per grandi complessi</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 p-4 md:p-6 pt-0">
                  <div className="mb-4 md:mb-6">
                    <span className="text-3xl md:text-4xl font-bold">39€</span>
                    <span className="text-sm md:text-base font-normal text-muted-foreground ml-1">/mese</span>
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-center justify-between border-b border-border/50 pb-2 md:pb-3">
                      <span className="text-xs md:text-sm text-muted-foreground">Condomini</span>
                      <span className="text-xs md:text-sm font-semibold">Illimitati</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm text-muted-foreground">Spazio</span>
                      <span className="text-xs md:text-sm font-semibold">50 GB</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 p-4 md:p-6">
                  <Button asChild className="w-full" variant="outline" size="lg">
                    <Link to="/contact">Contattaci</Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </div>

          {/* Tabella comparativa - responsive */}
          <div className="mt-10 md:mt-12 max-w-3xl mx-auto overflow-x-auto">
            <div className="border rounded-xl overflow-hidden shadow-sm bg-card min-w-[300px]">
              <div className="grid grid-cols-4 gap-0 divide-x divide-border">
                <div className="p-2 md:p-4 bg-muted/30">
                  <div className="font-medium text-[10px] md:text-sm">Piano</div>
                </div>
                <div className="p-2 md:p-4 bg-muted/30 text-center">
                  <div className="font-medium text-[10px] md:text-sm">Starter</div>
                </div>
                <div className="p-2 md:p-4 bg-muted/30 text-center bg-primary/5">
                  <div className="font-medium text-[10px] md:text-sm text-primary">Premium</div>
                </div>
                <div className="p-2 md:p-4 bg-muted/30 text-center">
                  <div className="font-medium text-[10px] md:text-sm">Enterprise</div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-0 divide-x divide-border border-t">
                <div className="p-2 md:p-4 text-[10px] md:text-sm font-medium text-muted-foreground">Prezzo</div>
                <div className="p-2 md:p-4 text-[10px] md:text-sm text-center font-medium">9€</div>
                <div className="p-2 md:p-4 text-[10px] md:text-sm text-center font-medium text-primary bg-primary/5">19€</div>
                <div className="p-2 md:p-4 text-[10px] md:text-sm text-center font-medium">39€</div>
              </div>

              <div className="grid grid-cols-4 gap-0 divide-x divide-border border-t">
                <div className="p-2 md:p-4 text-[10px] md:text-sm font-medium text-muted-foreground">Condomini</div>
                <div className="p-2 md:p-4 text-[10px] md:text-sm text-center">Fino a 5</div>
                <div className="p-2 md:p-4 text-[10px] md:text-sm text-center bg-primary/5 font-medium text-primary">Fino a 10</div>
                <div className="p-2 md:p-4 text-[10px] md:text-sm text-center">Illimitati</div>
              </div>

              <div className="grid grid-cols-4 gap-0 divide-x divide-border border-t">
                <div className="p-2 md:p-4 text-[10px] md:text-sm font-medium text-muted-foreground">Spazio</div>
                <div className="p-2 md:p-4 text-[10px] md:text-sm text-center">7 GB</div>
                <div className="p-2 md:p-4 text-[10px] md:text-sm text-center bg-primary/5 font-medium text-primary">15 GB</div>
                <div className="p-2 md:p-4 text-[10px] md:text-sm text-center">50 GB</div>
              </div>

              <div className="grid grid-cols-4 gap-0 divide-x divide-border border-t">
                <div className="p-2 md:p-4 text-[10px] md:text-sm font-medium text-muted-foreground">Prova</div>
                <div className="p-2 md:p-4 text-[10px] md:text-sm text-center text-green-600 font-medium">30 gg</div>
                <div className="p-2 md:p-4 text-[10px] md:text-sm text-center text-green-600 font-medium bg-primary/5">30 gg</div>
                <div className="p-2 md:p-4 text-[10px] md:text-sm text-center text-green-600 font-medium">30 gg</div>
              </div>
            </div>
          </div>

          {/* Come funziona */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-10 md:mt-12 max-w-3xl mx-auto"
          >
            <Card className="bg-muted/20 border-dashed">
              <CardContent className="p-4 md:p-6">
                <h4 className="text-sm md:text-base font-semibold mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary shrink-0" />
                  Come funziona
                </h4>
                <ol className="space-y-2 md:space-y-3 text-xs md:text-sm text-muted-foreground">
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] md:text-xs font-bold shrink-0">1</span>
                    <span>Ti registri e inizi subito con <span className="font-medium text-foreground">30 giorni di prova gratuita</span></span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] md:text-xs font-bold shrink-0">2</span>
                    <span>Durante la prova hai a disposizione <span className="font-medium text-foreground">5 GB</span> e <span className="font-medium text-foreground">3 condomini</span></span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] md:text-xs font-bold shrink-0">3</span>
                    <span>Alla fine del periodo di prova, scegli il piano più adatto alle tue esigenze</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] md:text-xs font-bold shrink-0">4</span>
                    <span>Puoi anche <span className="font-medium text-foreground">passare a un piano superiore</span> in qualsiasi momento se il tuo condominio cresce</span>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </motion.div>

          {/* Domande frequenti sul pricing */}
          <div className="mt-8 md:mt-10 max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="space-y-2">
              {[
                {
                  value: "price-1",
                  question: "Cosa succede dopo i 30 giorni di prova?",
                  answer: "Al termine del periodo di prova, puoi scegliere uno dei piani disponibili per continuare a utilizzare il servizio. I tuoi dati rimarranno tutti al sicuro e non dovrai riconfigurare nulla."
                },
                {
                  value: "price-2",
                  question: "Posso cambiare piano in qualsiasi momento?",
                  answer: "Sì. Puoi passare da un piano all'altro in qualsiasi momento con un semplice click. Se il tuo condominio cresce, passi a un piano superiore senza perdere dati o configurazioni."
                },
                {
                  value: "price-3",
                  question: "Cosa succede se supero il limite di condomini o spazio?",
                  answer: "Riceverai una notifica quando ti stai avvicinando al limite. Puoi sempre passare a un piano superiore per aumentare la capacità, oppure contattarci per una soluzione personalizzata."
                }
              ].map((item) => (
                <AccordionItem key={item.value} value={item.value} className="rounded-xl border bg-card/50 px-3 md:px-4 transition-all data-[state=open]:bg-card data-[state=open]:shadow-sm">
                  <AccordionTrigger className="py-2.5 md:py-3 text-xs md:text-sm font-medium hover:no-underline [&>svg]:text-primary text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs md:text-sm text-muted-foreground pb-2.5 md:pb-4 leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="mt-10 md:mt-16 border-t bg-secondary/5"
      >
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 sm:py-16">
          <div className="grid gap-8 md:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-3 md:space-y-4 text-center sm:text-left">
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                <span className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                  CondoConnect
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto sm:mx-0">
                Post, documenti e ticket per un condominio senza attriti.
              </p>
              <p className="text-xs text-muted-foreground/60">
                <span className="font-medium">Email:</span>{" "}
                <a href="mailto:info@condoconnect.it" className="hover:text-foreground transition-colors">
                  info@condoconnect.it
                </a>
              </p>
              <div className="flex gap-3 pt-1 justify-center sm:justify-start">
                <a href="#" className="text-muted-foreground/60 hover:text-foreground transition-colors" aria-label="LinkedIn">
                  <svg className="h-4 w-4 md:h-5 md:w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground/60 hover:text-foreground transition-colors" aria-label="Twitter">
                  <svg className="h-4 w-4 md:h-5 md:w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="space-y-3 md:space-y-4 text-center sm:text-left">
              <h4 className="text-sm font-semibold text-foreground">Informazioni legali</h4>
              <ul className="space-y-2 md:space-y-2.5 text-sm">
                <li>
                  <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors text-xs md:text-sm">
                    Termini di servizio
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors text-xs md:text-sm">
                    Privacy policy
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" className="text-muted-foreground hover:text-foreground transition-colors text-xs md:text-sm">
                    Cookie policy
                  </Link>
                </li>
                <li>
                  <Link to="/disclaimer" className="text-muted-foreground hover:text-foreground transition-colors text-xs md:text-sm">
                    Disclaimer
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3 md:space-y-4 text-center sm:text-left">
              <h4 className="text-sm font-semibold text-foreground">Hai domande?</h4>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                Scrivici, rispondiamo entro 24 ore.
              </p>
              <div className="flex flex-col gap-2 md:gap-3">
                <Button
                  asChild
                  size="lg"
                  className="w-full h-10 md:h-12 px-4 md:px-6 text-xs md:text-base font-medium rounded-xl shadow-md shadow-primary/15 hover:shadow-primary/25 transition-all duration-300"
                >
                  <a href="mailto:info@condoconnect.it?subject=Richiesta%20informazioni%20CondoConnect&body=Ciao%20CondoConnect%2C%20vorrei%20avere%20maggiori%20informazioni%20su...">
                    <Mail className="mr-2 h-3 w-3 md:h-5 md:w-5" />
                    Contattaci
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full h-10 md:h-12 px-4 md:px-6 text-xs md:text-base font-medium rounded-xl border-2 hover:bg-primary/5 transition-all duration-300"
                >
                  <a href="mailto:info@condoconnect.it?subject=Feedback%20CondoConnect&body=Ciao%2C%20ecco%20il%20mio%20feedback%3A%0A%0A">
                    <MessageCircle className="mr-2 h-3 w-3 md:h-5 md:w-5" />
                    Invia feedback
                  </a>
                </Button>
              </div>
              <p className="text-[10px] md:text-xs text-muted-foreground/60">
                Risposta entro 24 ore lavorative
              </p>
            </div>
          </div>

          <div className="my-8 md:my-10 h-px bg-border" />

          <div className="mb-4 md:mb-6 p-3 md:p-4 bg-primary/5 border border-primary/10 rounded-xl text-[10px] md:text-xs text-muted-foreground/70 text-center">
            <p className="flex items-center justify-center gap-1.5 md:gap-2">
              <Info className="h-3 w-3 md:h-4 md:w-4 text-primary/50 shrink-0" />
              <span>
                <strong>Nota informativa:</strong> Le funzionalità indicate come "in sviluppo" (gestione spese e fornitori)
                sono in fase di realizzazione e saranno disponibili entro fine 2027.
                Il servizio attuale include già completamente le funzionalità di Post, Documenti e Ticket.
              </span>
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 md:gap-4 text-center text-[10px] md:text-xs text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
            <p>
              &copy; {new Date().getFullYear()} CondoConnect. Tutti i diritti riservati.
            </p>
            <div className="flex flex-wrap justify-center gap-x-3 md:gap-x-4 gap-y-1">
              <span>P.IVA: 12345678901</span>
              <span className="hidden sm:inline">·</span>
              <span>Via Roma, 1 – 00100 Milano</span>
            </div>
            <p className="text-[8px] md:text-[10px] uppercase tracking-wider text-muted-foreground/60">
              Prova gratuita 30 giorni
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}