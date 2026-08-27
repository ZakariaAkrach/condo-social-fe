// pages/private/resident/ResidentCreateTicketPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Check, ChevronRight, Upload, FileText, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useCondominium } from "@/components/residentDashboard/CondominiumContext";
import { cn } from "@/lib/utils";
import { ticketResidentApi, type CreateTicketRequest, type TicketCategory, type TicketPriority } from "@/app/api/ticketResident";
import { TicketUploadDialog } from "@/components/residentDashboard/TicketUploadDialog";

const CATEGORIES: { value: TicketCategory; label: string }[] = [
  { value: "MAINTENANCE", label: "Manutenzione" },
  { value: "CLEANING", label: "Pulizia" },
  { value: "NOISE", label: "Rumori" },
  { value: "ADMINISTRATIVE", label: "Amministrativo" },
  { value: "SECURITY", label: "Sicurezza" },
  { value: "UTILITIES", label: "Utilità" },
  { value: "COMMON_AREAS", label: "Spazi comuni" },
  { value: "OTHER", label: "Altro" },
];

const PRIORITIES: { value: TicketPriority; label: string }[] = [
  { value: "LOW", label: "Bassa" },
  { value: "MEDIUM", label: "Media" },
  { value: "HIGH", label: "Alta" },
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
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titolo *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Inserisci un titolo breve"
                className="text-base"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">Es: "Ascensore rotto", "Pulizia scale"</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={form.category}
                onValueChange={(val) => setForm({ ...form, category: val as TicketCategory })}
              >
                <SelectTrigger><SelectValue placeholder="Seleziona una categoria" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priorità</Label>
              <Select
                value={form.priority}
                onValueChange={(val) => setForm({ ...form, priority: val as TicketPriority })}
              >
                <SelectTrigger><SelectValue placeholder="Seleziona priorità" /></SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descrizione *</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Descrivi il problema in dettaglio..."
                className="min-h-[120px]"
                required
              />
              <p className="text-xs text-muted-foreground">Inserisci una descrizione chiara e dettagliata.</p>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <Card className="bg-muted/30">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Titolo</span>
                  <span className="font-medium">{form.title || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Categoria</span>
                  <span className="font-medium">
                    {CATEGORIES.find(c => c.value === form.category)?.label || "—"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Priorità</span>
                  <span className="font-medium">
                    {PRIORITIES.find(p => p.value === form.priority)?.label || "—"}
                  </span>
                </div>
                <div className="text-sm border-t pt-2 mt-2">
                  <span className="text-muted-foreground">Descrizione:</span>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{form.description}</p>
                </div>
                {form.initialMessage && (
                  <div className="text-sm border-t pt-2 mt-2">
                    <span className="text-muted-foreground">Messaggio iniziale:</span>
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
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-10 w-10">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Nuovo ticket</h1>
      </div>

      <div className="flex items-center justify-between mb-6">
        {STEPS.map((s, idx) => {
          const Icon = s.icon;
          const isActive = step === idx;
          const isCompleted = step > idx;
          return (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex items-center justify-center rounded-full w-8 h-8 text-sm font-medium transition-all",
                  isActive && "bg-primary text-primary-foreground",
                  isCompleted && "bg-green-500 text-white",
                  !isActive && !isCompleted && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <span className={cn(
                "text-xs font-medium hidden sm:block",
                isActive && "text-primary",
                isCompleted && "text-green-600",
                !isActive && !isCompleted && "text-muted-foreground"
              )}>
                {s.label}
              </span>
              {idx < STEPS.length - 1 && (
                <div className={cn(
                  "w-8 h-0.5 mx-1 hidden sm:block",
                  isCompleted ? "bg-green-500" : "bg-muted"
                )} />
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-background rounded-xl border p-4 md:p-6">
        {renderStep()}
      </div>

      <div className="flex gap-3 mt-6">
        {step > 0 && (
          <Button variant="outline" onClick={goBack} className="flex-1">Indietro</Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button onClick={goNext} disabled={!isStepValid()} className="flex-1 gap-2">
            Continua <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading} className="flex-1 gap-2">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span> Creazione...
              </span>
            ) : (
              <>
                <Send className="h-4 w-4" /> Crea ticket
              </>
            )}
          </Button>
        )}
      </div>

      {showSuccessDialog && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 bg-black/50">
          <div className="bg-background rounded-2xl max-w-md w-full p-6 animate-in slide-in-from-bottom sm:slide-in-from-top duration-300">
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/30 h-16 w-16 rounded-full flex items-center justify-center mx-auto">
                <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-bold mt-4">Ticket creato!</h2>
              <p className="text-muted-foreground mt-2">
                Il tuo ticket è stato creato con successo. Vuoi aggiungere un allegato?
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => handleSuccessAction(false)}
                className="flex-1"
              >
                Vai al ticket
              </Button>
              <Button
                onClick={() => handleSuccessAction(true)}
                className="flex-1 gap-2"
              >
                <Upload className="h-4 w-4" /> Allega file
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