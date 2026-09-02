// src/pages/private/AdminPostCreatePage.tsx
import { useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Loader2,
  ArrowLeft,
  Plus,
  X,
  File,
  Search,
  Check,
  AlertCircle,
  BarChart3,
  Bold,
  Italic,
  FolderOpen,
  Pencil,
  Send,
  FileText,
  Sparkles,
  Underline,
  Undo,
  Redo,
  Strikethrough,
  Bell,
  BellOff,
  Info,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { postAdminApi, type CreatePostRequest } from "@/app/api/postAdmin";
import { documentAdminApi } from "@/app/api/documentAdmin";

interface PollOption {
  id: string;
  text: string;
}

interface AvailableDocument {
  id: string;
  originalName: string;
  contentType: string;
  currentVersion: number;
  status: string;
  size: number;
}

export default function AdminPostCreatePage() {
  const navigate = useNavigate();
  const { condominiumId } = useParams<{ condominiumId: string }>();
  const editorRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "DRAFT">("DRAFT");
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [notifyImmediately, setNotifyImmediately] = useState(false);

  const [hasPoll, setHasPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<PollOption[]>([
    { id: "1", text: "" },
    { id: "2", text: "" },
  ]);

  // Documenti selezionati
  const [selectedDocuments, setSelectedDocuments] = useState<AvailableDocument[]>([]);
  
  // Dialog per selezionare documenti
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [availableDocuments, setAvailableDocuments] = useState<AvailableDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsSearch, setDocumentsSearch] = useState("");
  const [documentsPage, setDocumentsPage] = useState(0);
  const [documentsTotalPages, setDocumentsTotalPages] = useState(0);
  const [tempSelectedIds, setTempSelectedIds] = useState<Set<string>>(new Set());

  // ========== FUNZIONI PER IL SONDAGGIO ==========
  const handleAddPollOption = () => {
    const newId = String(pollOptions.length + 1);
    setPollOptions([...pollOptions, { id: newId, text: "" }]);
  };

  const handleRemovePollOption = (id: string) => {
    if (pollOptions.length <= 2) {
      toast.warning("Il sondaggio deve avere almeno 2 opzioni");
      return;
    }
    setPollOptions(pollOptions.filter((opt) => opt.id !== id));
  };

  const handlePollOptionChange = (id: string, value: string) => {
    setPollOptions(
      pollOptions.map((opt) =>
        opt.id === id ? { ...opt, text: value } : opt
      )
    );
  };
  // =============================================

  // ========== EDITOR WYSIWYG ==========
  const updateActiveFormats = useCallback(() => {
    const formats = new Set<string>();
    
    if (document.queryCommandState('bold')) formats.add('bold');
    if (document.queryCommandState('italic')) formats.add('italic');
    if (document.queryCommandState('underline')) formats.add('underline');
    if (document.queryCommandState('strikeThrough')) formats.add('strikeThrough');
    if (document.queryCommandState('insertUnorderedList')) formats.add('insertUnorderedList');
    if (document.queryCommandState('insertOrderedList')) formats.add('insertOrderedList');
    if (document.queryCommandState('justifyLeft')) formats.add('justifyLeft');
    if (document.queryCommandState('justifyCenter')) formats.add('justifyCenter');
    if (document.queryCommandState('justifyRight')) formats.add('justifyRight');
    
    const block = document.queryCommandValue('formatBlock');
    if (block) {
      formats.add(block.toLowerCase());
    }
    
    setActiveFormats(formats);
  }, []);

  const execCommand = useCallback((command: string, value: string = "") => {
    const editor = editorRef.current;
    if (!editor) return;
    
    editor.focus();
    document.execCommand(command, false, value);
    
    setBodyHtml(editor.innerHTML);
    updateActiveFormats();
  }, [updateActiveFormats]);

  const handleEditorInput = useCallback(() => {
    const editor = editorRef.current;
    if (editor) {
      setBodyHtml(editor.innerHTML);
      updateActiveFormats();
    }
  }, [updateActiveFormats]);

  const handleEditorKeyUp = useCallback(() => {
    updateActiveFormats();
  }, [updateActiveFormats]);

  const handleEditorMouseUp = useCallback(() => {
    updateActiveFormats();
  }, [updateActiveFormats]);

  const handleEditorPaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
    }
    
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') {
        e.preventDefault();
        execCommand('bold');
      } else if (e.key === 'i') {
        e.preventDefault();
        execCommand('italic');
      } else if (e.key === 'u') {
        e.preventDefault();
        execCommand('underline');
      } else if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        execCommand('undo');
      } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
        e.preventDefault();
        execCommand('redo');
      }
    }
  }, [execCommand]);
  // =============================================

  // Fetch documenti disponibili
  const fetchAvailableDocuments = useCallback(async () => {
    if (!condominiumId) return;
    
    setDocumentsLoading(true);
    try {
      const params: any = {
        page: documentsPage,
        size: 10,
        sortBy: "createdAt",
        ascending: false,
        originalName: documentsSearch || undefined,
        status: "ACTIVE",
      };
      
      const response = await documentAdminApi.fetch(condominiumId, params);
      const data = response.data || [];
      const activeDocs = data.filter((doc: any) => doc.status === "ACTIVE");
      setAvailableDocuments(activeDocs);
    } catch (err: any) {
      console.error("Errore nel caricamento dei documenti", err);
      toast.error("Errore nel caricamento dei documenti disponibili");
    } finally {
      setDocumentsLoading(false);
    }
  }, [condominiumId, documentsPage, documentsSearch]);

  // Apri il dialog e carica i documenti
  const openDocumentDialog = () => {
    setDocumentDialogOpen(true);
    setTempSelectedIds(new Set(selectedDocuments.map(d => d.id)));
    fetchAvailableDocuments();
  };

  // Gestisci selezione documento nel dialog
  const toggleDocumentSelection = (docId: string) => {
    setTempSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(docId)) {
        newSet.delete(docId);
      } else {
        newSet.add(docId);
      }
      return newSet;
    });
  };

  // Conferma selezione documenti
  const confirmDocumentSelection = () => {
    const selected = availableDocuments.filter(doc => tempSelectedIds.has(doc.id));
    setSelectedDocuments(selected);
    setDocumentDialogOpen(false);
    toast.success(`${selected.length} documenti selezionati`);
  };

  // Rimuovi documento dalla selezione
  const removeDocument = (docId: string) => {
    setSelectedDocuments(prev => prev.filter(d => d.id !== docId));
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      toast.error("Il titolo è obbligatorio");
      return false;
    }
    if (title.trim().length > 255) {
      toast.error("Il titolo non può superare i 255 caratteri");
      return false;
    }
    const text = editorRef.current?.textContent || "";
    if (!text.trim()) {
      toast.error("Il contenuto è obbligatorio");
      return false;
    }
    if (hasPoll) {
      if (!pollQuestion.trim()) {
        toast.error("La domanda del sondaggio è obbligatoria");
        return false;
      }
      const validOptions = pollOptions.filter((opt) => opt.text.trim());
      if (validOptions.length < 2) {
        toast.error("Il sondaggio deve avere almeno 2 opzioni");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!condominiumId) {
      toast.error("ID condominio non trovato");
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const editor = editorRef.current;
      const bodyContent = editor?.innerHTML || "";
      
      const data: CreatePostRequest = {
        title: title.trim(),
        body: bodyContent,
        status,
        notifyImmediately,
      };

      if (selectedDocuments.length > 0) {
        data.documents = selectedDocuments.map(doc => doc.id);
      }

      if (hasPoll) {
        data.poll = {
          question: pollQuestion.trim(),
          optionTexts: pollOptions
            .filter((opt) => opt.text.trim())
            .map((opt) => opt.text.trim()),
        };
      }

      await postAdminApi.createPost(condominiumId, data);
      
      let notificationMessage = "";
      if (status === "ACTIVE" && notifyImmediately) {
        notificationMessage = "I residenti riceveranno una notifica immediata!";
      } else if (status === "ACTIVE" && !notifyImmediately) {
        notificationMessage = "I residenti riceveranno la notifica nel prossimo digest giornaliero.";
      } else {
        notificationMessage = "Il post è stato salvato come bozza. Le notifiche verranno inviate quando il post verrà pubblicato.";
      }
      
      toast.success(`Post creato con successo! ${notificationMessage}`);
      navigate(`/admin/condomini/${condominiumId}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Errore durante la creazione del post";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate(`/admin/condomini/${condominiumId}/posts`);
  };

  const isBodyEmpty = !editorRef.current?.textContent?.trim();

  // Helper per formattare la dimensione
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const FormatButton = ({ icon: Icon, label, onClick, active = false }: { icon: any, label: string, onClick: () => void, active?: boolean }) => (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="sm"
      className={`h-8 w-8 p-0 ${active ? 'bg-primary/20 text-primary hover:bg-primary/30' : ''}`}
      onClick={onClick}
      title={label}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  const getCharCount = () => {
    return editorRef.current?.textContent?.length || 0;
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Nuova Comunicazione</h1>
            <p className="text-sm text-muted-foreground">
              Crea un nuovo annuncio per il condominio
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={status === "ACTIVE" ? "default" : "secondary"} className="gap-1">
            {status === "ACTIVE" ? <Send className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
            {status === "ACTIVE" ? "Pubblicato" : "Bozza"}
          </Badge>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Errore</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Informazioni base */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Contenuto del Post
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Titolo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Inserisci un titolo chiaro e accattivante..."
                maxLength={255}
                className="text-base"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Il titolo deve essere chiaro e descrittivo</span>
                <span>{title.length}/255</span>
              </div>
            </div>

            <Separator />

            {/* Editor WYSIWYG con anteprima live */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Contenuto <span className="text-destructive">*</span>
              </Label>

              {/* Toolbar formattazione */}
              <div className="flex flex-wrap items-center gap-1 p-2 rounded-lg bg-muted/50 border sticky top-0 z-10">
                <FormatButton 
                  icon={Undo} 
                  label="Annulla (Ctrl+Z)" 
                  onClick={() => execCommand('undo')} 
                />
                <FormatButton 
                  icon={Redo} 
                  label="Ripeti (Ctrl+Y)" 
                  onClick={() => execCommand('redo')} 
                />
                <Separator orientation="vertical" className="h-5 mx-1" />
                <FormatButton 
                  icon={Bold} 
                  label="Grassetto (Ctrl+B)" 
                  onClick={() => execCommand('bold')} 
                  active={activeFormats.has('bold')}
                />
                <FormatButton 
                  icon={Italic} 
                  label="Corsivo (Ctrl+I)" 
                  onClick={() => execCommand('italic')} 
                  active={activeFormats.has('italic')}
                />
                <FormatButton 
                  icon={Underline} 
                  label="Sottolineato (Ctrl+U)" 
                  onClick={() => execCommand('underline')} 
                  active={activeFormats.has('underline')}
                />
                <FormatButton 
                  icon={Strikethrough} 
                  label="Barrato" 
                  onClick={() => execCommand('strikeThrough')} 
                  active={activeFormats.has('strikeThrough')}
                />
              </div>

              {/* Editor - mostra direttamente il contenuto formattato */}
              <div className="relative">
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={handleEditorInput}
                  onKeyUp={handleEditorKeyUp}
                  onMouseUp={handleEditorMouseUp}
                  onPaste={handleEditorPaste}
                  onKeyDown={handleKeyDown}
                  className="min-h-[300px] p-4 rounded-lg border bg-card text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y overflow-y-auto"
                  style={{ 
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                  data-placeholder="Scrivi il contenuto del post qui..."
                />
                <div className="absolute bottom-3 right-3 text-xs text-muted-foreground bg-background/90 backdrop-blur px-2 py-1 rounded-md border pointer-events-none">
                  {getCharCount()} caratteri
                </div>
              </div>

              {/* Suggerimenti */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg">
                <span className="font-medium">💡 Suggerimenti:</span>
                <span>Seleziona il testo e usa i pulsanti per formattare</span>
                <span>•</span>
                <span>Ctrl+B per grassetto</span>
                <span>•</span>
                <span>Ctrl+I per corsivo</span>
                <span>•</span>
                <span>Ctrl+U per sottolineato</span>
              </div>
            </div>

            <Separator />

            {/* Stato e Notifiche */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium">Stato di pubblicazione</Label>
                  <Select
                    value={status}
                    onValueChange={(val) => setStatus(val as "ACTIVE" | "DRAFT")}
                  >
                    <SelectTrigger id="status" className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Seleziona lo stato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-yellow-500" />
                          Bozza
                        </div>
                      </SelectItem>
                      <SelectItem value="ACTIVE">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500" />
                          Pubblica subito
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg flex-1">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <div>
                    {status === "DRAFT"
                      ? "Il post sarà salvato come bozza e visibile solo agli amministratori."
                      : "Il post sarà immediatamente visibile a tutti i residenti del condominio."}
                  </div>
                </div>
              </div>

              {/* Notify Immediately - visibile ma non cliccabile in DRAFT */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border-2 bg-card">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="notify-immediately"
                      checked={notifyImmediately}
                      onCheckedChange={status === "ACTIVE" ? setNotifyImmediately : undefined}
                      disabled={status === "DRAFT"}
                      className={status === "DRAFT" ? "opacity-50 cursor-not-allowed" : ""}
                    />
                    <Label 
                      htmlFor="notify-immediately" 
                      className={`text-sm font-medium cursor-pointer ${status === "DRAFT" ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                    >
                      {notifyImmediately ? (
                        <span className="flex items-center gap-1 text-primary">
                          <Bell className="h-4 w-4" />
                          Notifica immediata
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <BellOff className="h-4 w-4" />
                          Notifica nel digest
                        </span>
                      )}
                    </Label>
                  </div>
                  <div className="h-8 w-px bg-border hidden sm:block" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {notifyImmediately ? (
                        <>
                          <span className="font-medium text-primary">⚡ Notifica immediata</span>
                          <br />
                          I residenti riceveranno una notifica push subito dopo la pubblicazione.
                          <span className="block text-yellow-600 font-medium mt-1">
                            ⚠️ Utilizza solo per comunicazioni urgenti e importanti
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="font-medium">📅 Digest giornaliero</span>
                          <br />
                          I residenti riceveranno la notifica nel prossimo riepilogo giornaliero.
                          <span className="block text-muted-foreground mt-1">
                            ✓ Opzione consigliata per le comunicazioni ordinarie
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant={notifyImmediately ? "destructive" : "outline"} 
                  className={`shrink-0 gap-1 h-7 ${status === "DRAFT" ? "opacity-50" : ""}`}
                >
                  {notifyImmediately ? (
                    <>🔔 Immediata</>
                  ) : (
                    <>📅 Digest</>
                  )}
                </Badge>
              </div>

              {/* Info aggiuntiva quando è DRAFT */}
{status === "DRAFT" && (
  <>
    <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
      <div className="space-y-1">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          <span className="font-semibold">🔒 Opzioni di notifica bloccate:</span> Per configurare le notifiche, imposta lo stato su <span className="font-semibold">"Pubblica subito"</span>.
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-400">
          <span className="font-medium">📌 Nota:</span> La notifica può essere inviata <span className="font-semibold">solo al momento della creazione</span> del post.
        </p>
      </div>
    </div>

    <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
      <div className="space-y-1">
        <p className="text-xs text-amber-700 dark:text-amber-300">
          <span className="font-semibold">💡 Come funziona:</span>
        </p>
        <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1 list-disc list-inside">
          <li>
            <span className="font-medium">✅ "Pubblica subito" + "Notifica immediata" attiva:</span> i residenti ricevono <span className="font-semibold">subito</span> una notifica push
          </li>
          <li>
            <span className="font-medium">📧 "Pubblica subito" + "Notifica nel digest":</span> i residenti ricevono la notifica nel <span className="font-semibold">prossimo digest giornaliero</span> via email
          </li>
          <li>
            <span className="font-medium">📝 Se salvi come "Bozza":</span> i residenti riceveranno comunque una notifica via email nel <span className="font-semibold">digest giornaliero</span> dopo la pubblicazione, <span className="font-semibold">MA non immediatamente</span>
          </li>
        </ul>
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
          <span className="font-semibold">⚠️ Importante:</span> La notifica immediata funziona <span className="font-semibold">solo se il post viene creato direttamente come "Pubblica subito"</span> con l'opzione attivata. Se crei una bozza, anche attivando l'opzione dopo, la notifica arriverà solo via email nel digest.
        </p>
      </div>
    </div>
  </>
)}

{/* Info aggiuntiva quando è ACTIVE */}
{status === "ACTIVE" && (
  <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-800">
    <Info className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
    <div className="space-y-1">
      <p className="text-xs text-green-700 dark:text-green-300">
        <span className="font-semibold">📢 Il post verrà pubblicato subito.</span>
      </p>
      <div className="flex flex-col gap-1">
        <p className="text-xs text-green-700 dark:text-green-300">
          {notifyImmediately ? (
            <>
              <span className="font-semibold text-green-800 dark:text-green-200">⚡ Notifica immediata:</span> i residenti riceveranno <span className="font-semibold">subito</span> una notifica push.
            </>
          ) : (
            <>
              <span className="font-semibold">📅 Notifica nel digest:</span> i residenti riceveranno la notifica nel <span className="font-semibold">prossimo digest giornaliero</span> via email.
            </>
          )}
        </p>
        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
          <span className="font-medium">✅ Ricorda:</span> La scelta della notifica viene valutata <span className="font-semibold">solo al momento della creazione</span>. 
          Se crei una bozza ora, i residenti riceveranno comunque la notifica via email nel digest, <span className="font-semibold">ma non immediatamente</span>.
        </p>
      </div>
    </div>
  </div>
)}
            </div>
          </CardContent>
        </Card>

        {/* Sondaggio */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Sondaggio
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Aggiungi un sondaggio per raccogliere feedback dai residenti
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="has-poll" className="text-sm font-normal cursor-pointer">
                  Attiva
                </Label>
                <Switch
                  id="has-poll"
                  checked={hasPoll}
                  onCheckedChange={setHasPoll}
                />
              </div>
            </div>
          </CardHeader>
          {hasPoll ? (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="poll-question" className="text-sm font-medium">
                  Domanda <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="poll-question"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="Es: Quale data preferisci per l'assemblea?"
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Opzioni di risposta <span className="text-destructive">*</span>
                </Label>
                <div className="space-y-2">
                  {pollOptions.map((option, index) => (
                    <div key={option.id} className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <Input
                        value={option.text}
                        onChange={(e) =>
                          handlePollOptionChange(option.id, e.target.value)
                        }
                        placeholder={`Opzione ${String.fromCharCode(65 + index)}...`}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 hover:text-destructive"
                        onClick={() => handleRemovePollOption(option.id)}
                        disabled={pollOptions.length <= 2}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddPollOption}
                  className="mt-2 gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Aggiungi opzione
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  Almeno 2 opzioni obbligatorie. Gli utenti potranno votare una sola opzione.
                </p>
              </div>
            </CardContent>
          ) : (
            <CardContent>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-dashed">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Nessun sondaggio attivo</p>
                  <p className="text-xs text-muted-foreground">
                    Attiva il sondaggio per aggiungere una domanda con opzioni di voto
                  </p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Documenti Allegati */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-primary" />
                  Documenti Allegati
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Allega documenti già caricati nel condominio
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openDocumentDialog}
                className="gap-2"
              >
                <FolderOpen className="h-4 w-4" />
                Seleziona
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {selectedDocuments.length === 0 ? (
              <div 
                className="border-2 border-dashed rounded-lg p-6 text-center transition-colors hover:border-primary/50 cursor-pointer"
                onClick={openDocumentDialog}
              >
                <FolderOpen className="h-10 w-10 mx-auto text-muted-foreground" />
                <p className="text-sm font-medium mt-2">Nessun documento selezionato</p>
                <p className="text-xs text-muted-foreground">
                  Clicca per selezionare documenti da allegare
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                        <File className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{doc.originalName}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{doc.contentType}</span>
                          <span>•</span>
                          <span>v{doc.currentVersion}</span>
                          <span>•</span>
                          <span>{formatSize(doc.size)}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] flex-shrink-0">
                        {doc.status}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:text-destructive flex-shrink-0"
                      onClick={() => removeDocument(doc.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Riepilogo e azioni */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  Riepilogo del post
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={status === "ACTIVE" ? "default" : "secondary"} className="gap-1">
                    {status === "ACTIVE" ? <Send className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                    {status === "ACTIVE" ? "Pubblicato" : "Bozza"}
                  </Badge>
                  <Badge 
                    variant={notifyImmediately ? "destructive" : "outline"} 
                    className={`gap-1 ${status === "DRAFT" ? "opacity-50" : ""}`}
                  >
                    {notifyImmediately ? <Bell className="h-3 w-3" /> : <BellOff className="h-3 w-3" />}
                    {notifyImmediately ? "Notifica immediata" : "Digest giornaliero"}
                    {status === "DRAFT" && " (bloccato)"}
                  </Badge>
                  {hasPoll && (
                    <Badge variant="outline" className="gap-1">
                      <BarChart3 className="h-3 w-3" />
                      Sondaggio ({pollOptions.filter(o => o.text.trim()).length} opzioni)
                    </Badge>
                  )}
                  {selectedDocuments.length > 0 && (
                    <Badge variant="outline" className="gap-1">
                      <File className="h-3 w-3" />
                      {selectedDocuments.length} documenti
                    </Badge>
                  )}
                  {title && (
                    <Badge variant="outline" className="gap-1">
                      <FileText className="h-3 w-3" />
                      {title.length} caratteri titolo
                    </Badge>
                  )}
                  {!isBodyEmpty && (
                    <Badge variant="outline" className="gap-1">
                      <Pencil className="h-3 w-3" />
                      {getCharCount()} caratteri contenuto
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Button
                  variant="outline"
                  onClick={goBack}
                  className="flex-1 md:flex-none gap-2"
                >
                  <X className="h-4 w-4" />
                  Annulla
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !title.trim() || isBodyEmpty}
                  className="flex-1 md:flex-none gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creazione...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      {status === "ACTIVE" ? "Pubblica Post" : "Salva Bozza"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog per selezionare documenti */}
      <Dialog open={documentDialogOpen} onOpenChange={setDocumentDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Seleziona documenti da allegare</DialogTitle>
            <DialogDescription>
              Scegli i documenti da allegare al post. Solo i documenti attivi sono disponibili.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2 py-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca documenti..."
                value={documentsSearch}
                onChange={(e) => {
                  setDocumentsSearch(e.target.value);
                  setDocumentsPage(0);
                }}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDocumentsPage(0);
                fetchAvailableDocuments();
              }}
              className="gap-2"
            >
              <Search className="h-4 w-4" />
              Cerca
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {documentsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : availableDocuments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <File className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Nessun documento disponibile</p>
                <p className="text-sm">Non ci sono documenti attivi da allegare</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={tempSelectedIds.size === availableDocuments.length && availableDocuments.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setTempSelectedIds(new Set(availableDocuments.map(d => d.id)));
                          } else {
                            setTempSelectedIds(new Set());
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                    <TableHead className="hidden md:table-cell">Versione</TableHead>
                    <TableHead className="hidden lg:table-cell">Dimensione</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableDocuments.map((doc) => (
                    <TableRow
                      key={doc.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleDocumentSelection(doc.id)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={tempSelectedIds.has(doc.id)}
                          onCheckedChange={() => toggleDocumentSelection(doc.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4 text-primary shrink-0" />
                          <span className="truncate max-w-[150px] sm:max-w-[250px]">{doc.originalName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className="text-[10px]">
                          {doc.contentType}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">v{doc.currentVersion}</TableCell>
                      <TableCell className="hidden lg:table-cell">{formatSize(doc.size)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {documentsTotalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setDocumentsPage(prev => Math.max(0, prev - 1))}
                    className={documentsPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(5, documentsTotalPages) }, (_, i) => {
                  const pageNum = i;
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => setDocumentsPage(pageNum)}
                        isActive={documentsPage === pageNum}
                      >
                        {pageNum + 1}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setDocumentsPage(prev => Math.min(documentsTotalPages - 1, prev + 1))}
                    className={documentsPage >= documentsTotalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}

          <DialogFooter className="mt-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {tempSelectedIds.size} documenti selezionati
            </div>
            <Button variant="outline" onClick={() => setDocumentDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={confirmDocumentSelection} className="gap-2">
              <Check className="h-4 w-4" />
              Conferma selezione
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}