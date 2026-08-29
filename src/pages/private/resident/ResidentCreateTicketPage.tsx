// pages/private/resident/ResidentCreateTicketPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Check, ChevronRight, Upload, FileText, MessageSquare, Send, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useCondominium } from "@/components/residentDashboard/CondominiumContext";
import { cn } from "@/lib/utils";
import { ticketResidentApi, type CreateTicketRequest, type TicketCategory, type TicketPriority } from "@/app/api/ticketResident";
import { TicketUploadDialog } from "@/components/residentDashboard/TicketUploadDialog";

const CATEGORIES: { value: TicketCategory; label: string; icon: string }[] = [
  { value: "MAINTENANCE", label: "Manutenzione", icon: "🔧" },
  { value: "CLEANING", label: "Pulizia", icon: "🧹" },
  { value: "NOISE", label: "Rumori", icon: "🔊" },
  { value: "ADMINISTRATIVE", label: "Amministrativo", icon: "📋" },
  { value: "SECURITY", label: "Sicurezza", icon: "🔒" },
  { value: "UTILITIES", label: "Utilità", icon: "💡" },
  { value: "COMMON_AREAS", label: "Spazi comuni", icon: "🏢" },
  { value: "OTHER", label: "Altro", icon: "📌" },
];

const PRIORITIES: { value: TicketPriority; label: string; color: string; description: string }[] = [
  { value: "LOW", label: "Bassa", color: "bg-blue-500", description: "Non urgente" },
  { value: "MEDIUM", label: "Media", color: "bg-amber-500", description: "Normale urgenza" },
  { value: "HIGH", label: "Alta", color: "bg-red-500", description: "Urgente" },
];

const STEPS = [
  { id: 0, label: "Dettagli", icon: FileText },
  { id: 1, label: "Descrizione", icon: MessageSquare },
  { id: 2, label: "Riepilogo", icon: Check },
];

export default function ResidentCreateTicketPage() {
  const { condominiumId } = useCondominium();
  const navigate = useNavigate();

  const [form, setForm] = useState<CreateTicketRequest & { initialMessage: string }>({
    title: "",
    description: "",
    category: "OTHER",
    priority: "MEDIUM",
    initialMessage: "",
  });
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const isStepValid = () => {
    if (step === 0) return form.title.trim().length > 0;
    if (step === 1) return form.description.trim().length > 0;
    return true;
  };

  const goNext = () => { if (step < STEPS.length - 1) setStep(step + 1); };
  const goBack = () => { if (step > 0) setStep(step - 1); };

  const handleSubmit = async () => {
    if (!condominiumId) {
      toast.error("Condominio non selezionato");
      return;
    }
    if (!form.title.trim()) {
      toast.error("Inserisci un titolo");
      return;
    }
    if (!form.description.trim()) {
      toast.error("Inserisci una descrizione");
      return;
    }

    setLoading(true);
    try {
      const createPayload: CreateTicketRequest = {
        title: form.title,
        description: form.description,
        category: form.category,
        priority: form.priority,
      };
      const createRes = await ticketResidentApi.create(condominiumId, createPayload);
      const ticketId = createRes.data.ticketId;
      if (!ticketId) throw new Error("ID ticket non valido");
      setCreatedTicketId(ticketId);

      if (form.initialMessage.trim()) {
        await ticketResidentApi.createMessage(condominiumId, ticketId, {
          message: form.initialMessage,
        });
      }

      toast.success("Ticket creato con successo!");
      setShowSuccessDialog(true);
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Errore nella creazione del ticket";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
    if (createdTicketId) {
      navigate(`/resident/ticket/${createdTicketId}`);
    } else {
      navigate("/resident/tickets");
    }
  };

  const handleSuccessAction = (withUpload: boolean) => {
    setShowSuccessDialog(false);
    if (withUpload && createdTicketId) {
      setUploadDialogOpen(true);
    } else if (createdTicketId) {
      navigate(`/resident/ticket/${createdTicketId}`);
    } else {
      toast.error("Errore: ID ticket mancante");
      navigate("/resident/tickets");
    }
  };

  const handleUploadComplete = () => {
    if (createdTicketId) navigate(`/resident/ticket/${createdTicketId}`);
  };

  const handleUploadDialogClose = (open: boolean) => {
    if (!open && createdTicketId) {
      navigate(`/resident/ticket/${createdTicketId}`);
    }
    setUploadDialogOpen(open);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Titolo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Es: Ascensore rotto al piano 3"
                className="text-base h-12"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Usa un titolo breve e descrittivo
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Categoria</Label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat.value })}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-xl border transition-all text-left",
                      form.category === cat.value
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-sm font-medium">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Priorità</Label>
              <div className="space-y-2">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setForm({ ...form, priority: p.value })}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                      form.priority === p.value
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <span className={cn("h-3 w-3 rounded-full", p.color)} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{p.label}</p>
                      <p className="text-xs text-muted-foreground">{p.description}</p>
                    </div>
                    {form.priority === p.value && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Descrizione <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Descrivi il problema in dettaglio..."
                className="min-h-[160px] text-base"
                required
              />
              <p className="text-xs text-muted-foreground">
                Inserisci tutti i dettagli utili per risolvere il problema
              </p>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <Card className="bg-muted/30">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Titolo</span>
                </div>
                <p className="font-semibold text-base">{form.title || "—"}</p>

                <div className="border-t pt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-muted-foreground">Dettagli</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {CATEGORIES.find(c => c.value === form.category)?.icon}{" "}
                      {CATEGORIES.find(c => c.value === form.category)?.label}
                    </Badge>
                    <Badge variant="outline">
                      {PRIORITIES.find(p => p.value === form.priority)?.label}
                    </Badge>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <span className="text-sm text-muted-foreground">Descrizione:</span>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{form.description}</p>
                </div>

                {form.initialMessage && (
                  <div className="border-t pt-3">
                    <span className="text-sm text-muted-foreground">Messaggio iniziale:</span>
                    <p className="mt-1 text-sm whitespace-pre-wrap">{form.initialMessage}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            <p className="text-xs text-muted-foreground text-center">
              Controlla i dati e premi "Crea ticket" per completare.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-9 w-9 shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold">Nuovo ticket</h1>
          <Badge variant="secondary" className="ml-auto text-xs">
            Passo {step + 1} di {STEPS.length}
          </Badge>
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Step labels */}
        <div className="flex justify-between mt-2">
          {STEPS.map((s, idx) => {
            const isActive = step === idx;
            const isCompleted = step > idx;
            return (
              <span
                key={s.id}
                className={cn(
                  "text-xs font-medium transition-colors",
                  isActive && "text-primary",
                  isCompleted && "text-green-600",
                  !isActive && !isCompleted && "text-muted-foreground"
                )}
              >
                {s.label}
              </span>
            );
          })}
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-4">
        {/* Content */}
        <Card>
          <CardContent className="p-5">
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation buttons */}
        <div className="flex gap-3">
          {step > 0 && (
            <Button variant="outline" onClick={goBack} className="flex-1 gap-2 h-12">
              <ArrowLeft className="h-4 w-4" />
              Indietro
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button onClick={goNext} disabled={!isStepValid()} className="flex-1 gap-2 h-12">
              Continua
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading} className="flex-1 gap-2 h-12">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creazione...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Crea ticket
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Success Dialog */}
      {showSuccessDialog && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={handleCloseSuccessDialog}
        >
          <div 
            className="bg-background rounded-2xl max-w-md w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseSuccessDialog}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/30 h-20 w-20 rounded-full flex items-center justify-center mx-auto">
                <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mt-4">Ticket creato!</h2>
              <p className="text-muted-foreground mt-2">
                Il tuo ticket è stato creato con successo.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => handleSuccessAction(false)}
                className="flex-1 gap-2"
              >
                Vai al ticket
              </Button>
              <Button
                onClick={() => handleSuccessAction(true)}
                className="flex-1 gap-2"
              >
                <Upload className="h-4 w-4" />
                Allega file
              </Button>
            </div>
          </div>
        </div>
      )}

      {createdTicketId && (
        <TicketUploadDialog
          open={uploadDialogOpen}
          onOpenChange={handleUploadDialogClose}
          condominiumId={condominiumId!}
          ticketId={createdTicketId}
          onUploadComplete={handleUploadComplete}
          trigger={null}
        />
      )}
    </div>
  );
}