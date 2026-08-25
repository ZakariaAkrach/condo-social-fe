import { useAuth } from "@/auth/AuthProvider";
import { useNavigate } from "react-router";
import { FileText, Ticket, Megaphone, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function ResidentDashboardPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const sections = [
    {
      id: "documents",
      title: "Documenti",
      description: "Visualizza e scarica i documenti del condominio",
      icon: FileText,
      color: "bg-blue-50 dark:bg-blue-950/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      path: "/resident/documents",
    },
    {
      id: "tickets",
      title: "Ticket",
      description: "Apri e gestisci le tue richieste di assistenza",
      icon: Ticket,
      color: "bg-amber-50 dark:bg-amber-950/30",
      iconColor: "text-amber-600 dark:text-amber-400",
      path: "/resident/tickets",
    },
    {
      id: "posts",
      title: "Annunci",
      description: "Leggi le comunicazioni dell'amministratore",
      icon: Megaphone,
      color: "bg-green-50 dark:bg-green-950/30",
      iconColor: "text-green-600 dark:text-green-400",
      path: "/resident/posts",
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-primary">
          Ciao, {profile?.firstName || "Residente"} 👋
        </h1>
        <p className="text-muted-foreground text-sm">
          Benvenuto nella tua area personale. Cosa vuoi fare oggi?
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card
              key={section.id}
              className="overflow-hidden cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
              onClick={() => navigate(section.path)}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className={cn("p-3 rounded-full", section.color)}>
                  <Icon className={cn("h-6 w-6", section.iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base">{section.title}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {section.description}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center text-xs text-muted-foreground pt-4">
        Hai bisogno di aiuto? Contatta l'amministratore.
      </div>
    </div>
  );
}