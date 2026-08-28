// src/pages/private/AdminPostCreatePage.tsx
import { useState, useRef, useCallback, useEffect } from "react";
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
  List,
  ListOrdered,
  Type,
  Heading1,
  Heading2,
  Heading3,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DialogTrigger,
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

// Funzione di sanitizzazione HTML
const sanitizeHtml = (html: string): string => {
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
};

// Funzione per convertire markdown a HTML con sanitizzazione
const renderMarkdownToHtml = (text: string): string => {
  if (!text) return "Nessun contenuto da visualizzare in anteprima";

  const sanitized = sanitizeHtml(text);

  let html = sanitized
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
      const safeText = sanitizeHtml(linkText);
      const safeUrl = sanitizeHtml(url);
      return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeText}</a>`;
    })
    .replace(/\*\*(.*?)\*\*/g, (match, content) => {
      return `<strong>${sanitizeHtml(content)}</strong>`;
    })
    .replace(/_(.*?)_/g, (match, content) => {
      return `<em>${sanitizeHtml(content)}</em>`;
    })
    .replace(/^### (.*)$/gm, (match, content) => {
      return `<h3>${sanitizeHtml(content)}</h3>`;
    })
    .replace(/^## (.*)$/gm, (match, content) => {
      return `<h2>${sanitizeHtml(content)}</h2>`;
    })
    .replace(/^# (.*)$/gm, (match, content) => {
      return `<h1>${sanitizeHtml(content)}</h1>`;
    })
    .replace(/^- (.*)$/gm, (match, content) => {
      return `<li>${sanitizeHtml(content)}</li>`;
    })
    .replace(/^\d+\. (.*)$/gm, (match, content) => {
      return `<li>${sanitizeHtml(content)}</li>`;
    })
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br />');

  if (!html.startsWith('<')) {
    html = `<p>${html}</p>`;
  }

  html = html.replace(/(<li>.*?<\/li>)/g, '<ul>$1</ul>');

  return html;
};

export default function AdminPostCreatePage() {
  const navigate = useNavigate();
  const { condominiumId } = useParams<{ condominiumId: string }>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "DRAFT">("DRAFT");

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
  const [documentsTotalElements, setDocumentsTotalElements] = useState(0);
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
      setDocumentsTotalElements(response.totalElements || 0);
      setDocumentsTotalPages(response.totalPages || 0);
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

  // Funzioni per la formattazione del testo
  const toggleFormatting = useCallback((format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = body.substring(start, end);
    
    let prefix = "";
    let suffix = "";
    let cursorOffset = 0;

    switch (format) {
      case 'bold':
        prefix = '**';
        suffix = '**';
        cursorOffset = 2;
        break;
      case 'italic':
        prefix = '_';
        suffix = '_';
        cursorOffset = 1;
        break;
      case 'heading1':
        prefix = '\n# ';
        suffix = '\n';
        cursorOffset = 3;
        break;
      case 'heading2':
        prefix = '\n## ';
        suffix = '\n';
        cursorOffset = 4;
        break;
      case 'heading3':
        prefix = '\n### ';
        suffix = '\n';
        cursorOffset = 5;
        break;
      case 'list':
        prefix = '\n- ';
        suffix = '\n';
        cursorOffset = 3;
        break;
      case 'numbered':
        prefix = '\n1. ';
        suffix = '\n';
        cursorOffset = 4;
        break;
      default:
        return;
    }

    if (selectedText) {
      const isFormatted = selectedText.startsWith(prefix) && selectedText.endsWith(suffix);
      
      if (isFormatted) {
        const innerText = selectedText.slice(prefix.length, -suffix.length);
        const newText = body.substring(0, start) + innerText + body.substring(end);
        setBody(newText);
        setTimeout(() => {
          textarea.focus();
          const newPosition = start + innerText.length;
          textarea.setSelectionRange(newPosition, newPosition);
        }, 10);
        return;
      }
    }

    if (selectedText) {
      const newText = body.substring(0, start) + prefix + selectedText + suffix + body.substring(end);
      setBody(newText);
      setTimeout(() => {
        textarea.focus();
        const newPosition = start + prefix.length + selectedText.length + suffix.length;
        textarea.setSelectionRange(newPosition, newPosition);
      }, 10);
    } else {
      const newText = body.substring(0, start) + prefix + suffix + body.substring(end);
      setBody(newText);
      setTimeout(() => {
        textarea.focus();
        const newPosition = start + prefix.length;
        textarea.setSelectionRange(newPosition, newPosition);
      }, 10);
    }
  }, [body]);

  const insertLink = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = body.substring(start, end);

    const url = window.prompt('Inserisci il link URL:', 'https://');
    if (!url) return;

    let newText;
    let cursorPos;

    if (selectedText) {
      newText = body.substring(0, start) + `[${selectedText}](${url})` + body.substring(end);
      cursorPos = start + `[${selectedText}](${url})`.length;
    } else {
      newText = body.substring(0, start) + `[Testo del link](${url})` + body.substring(end);
      cursorPos = start + 2;
    }

    setBody(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPos, cursorPos);
    }, 10);
  }, [body]);

  const validateForm = (): boolean => {
    if (!title.trim()) {
      toast.error("Il titolo è obbligatorio");
      return false;
    }
    if (title.trim().length > 255) {
      toast.error("Il titolo non può superare i 255 caratteri");
      return false;
    }
    if (!body.trim()) {
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
      const sanitizedBody = sanitizeHtml(body.trim());
      
      const data: CreatePostRequest = {
        title: sanitizeHtml(title.trim()),
        body: sanitizedBody,
        status,
      };

      if (selectedDocuments.length > 0) {
        data.documents = selectedDocuments.map(doc => doc.id);
      }

      if (hasPoll) {
        data.poll = {
          question: sanitizeHtml(pollQuestion.trim()),
          optionTexts: pollOptions
            .filter((opt) => opt.text.trim())
            .map((opt) => sanitizeHtml(opt.text.trim())),
        };
      }

      await postAdminApi.createPost(condominiumId, data);
      toast.success("Post creato con successo!");
      navigate(`/admin/condomini/${condominiumId}/posts`);
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

  const isBodyEmpty = !body || body.trim() === "";

  // Helper per formattare la dimensione
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={goBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna indietro
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Nuovo Post</h1>
            <p className="text-sm text-muted-foreground">
              Crea un nuovo annuncio per il condominio
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={goBack} disabled={loading}>
            Annulla
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creazione...
              </>
            ) : (
              "Pubblica Post"
            )}
          </Button>
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
          <CardHeader>
            <CardTitle>Informazioni del Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="required">
                Titolo
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Inserisci il titolo del post..."
                maxLength={255}
                className="text-lg font-medium"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Il titolo deve essere accattivante e chiaro</span>
                <span>{title.length}/255</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label className="required">Contenuto</Label>
                <div className="flex flex-wrap gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => toggleFormatting('bold')}
                    title="Grassetto (doppio click per disattivare)"
                  >
                    <Bold className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => toggleFormatting('italic')}
                    title="Corsivo (doppio click per disattivare)"
                  >
                    <Italic className="h-3 w-3" />
                  </Button>
                  <Separator orientation="vertical" className="h-5" />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => toggleFormatting('heading1')}
                    title="Titolo H1"
                  >
                    <Heading1 className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => toggleFormatting('heading2')}
                    title="Titolo H2"
                  >
                    <Heading2 className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => toggleFormatting('heading3')}
                    title="Titolo H3"
                  >
                    <Heading3 className="h-3 w-3" />
                  </Button>
                  <Separator orientation="vertical" className="h-5" />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => toggleFormatting('list')}
                    title="Lista puntata"
                  >
                    <List className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => toggleFormatting('numbered')}
                    title="Lista numerata"
                  >
                    <ListOrdered className="h-3 w-3" />
                  </Button>
                  <Separator orientation="vertical" className="h-5" />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={insertLink}
                    title="Inserisci link"
                  >
                    <Type className="h-3 w-3" />
                    🔗
                  </Button>
                </div>
              </div>

              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  id="body-textarea"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={`Scrivi il contenuto del post...

**Testo in grassetto** (seleziona il testo e clicca B per formattare)
*Testo in corsivo* (seleziona il testo e clicca I)

# Titolo H1
## Titolo H2
### Titolo H3

- Elemento lista
1. Elemento numerato

[Testo del link](https://esempio.it)`}
                  rows={12}
                  className="font-mono text-sm min-h-[300px]"
                />
                <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-0.5 rounded">
                  {body.length} caratteri
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                  Suggerimenti:
                </span>
                <Badge variant="outline" className="text-[10px]">Seleziona testo → clicca formato</Badge>
                <Badge variant="outline" className="text-[10px]">Doppio click per rimuovere</Badge>
              </div>

              {/* Anteprima live sanitizzata */}
              {!isBodyEmpty && (
                <div className="mt-3 p-4 rounded-lg border bg-muted/20">
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">📄 Anteprima:</h4>
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: renderMarkdownToHtml(body) 
                    }}
                  />
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="status">Stato di pubblicazione</Label>
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
                      Attivo
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-start gap-2 text-xs text-muted-foreground mt-1">
                <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                <div>
                  {status === "DRAFT"
                    ? "Il post sarà visibile solo agli amministratori. Puoi pubblicarlo in un secondo momento."
                    : "Il post sarà visibile a tutti i residenti del condominio."}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sondaggio */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Sondaggio</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Aggiungi un sondaggio al tuo post per raccogliere feedback
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="has-poll" className="text-sm font-normal cursor-pointer">
                  Attiva sondaggio
                </Label>
                <Switch
                  id="has-poll"
                  checked={hasPoll}
                  onCheckedChange={setHasPoll}
                />
              </div>
            </div>
          </CardHeader>
          {hasPoll && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="poll-question" className="required">
                  Domanda del sondaggio
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
                <Label className="required">Opzioni di risposta</Label>
                <div className="space-y-2">
                  {pollOptions.map((option, index) => (
                    <div key={option.id} className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-medium">
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
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi opzione
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  Almeno 2 opzioni obbligatorie. Gli utenti potranno votare una sola opzione.
                </p>
              </div>
            </CardContent>
          )}
          {!hasPoll && (
            <CardContent>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
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
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Documenti Allegati</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Seleziona documenti già caricati nel condominio
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
                Seleziona documenti
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {selectedDocuments.length === 0 ? (
              <div className="border-2 border-dashed rounded-lg p-8 text-center transition-colors hover:border-primary/50">
                <FolderOpen className="h-10 w-10 mx-auto text-muted-foreground" />
                <p className="text-sm font-medium mt-2">Nessun documento selezionato</p>
                <p className="text-xs text-muted-foreground">
                  Clicca su "Seleziona documenti" per allegare documenti esistenti
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <File className="h-4 w-4 text-primary flex-shrink-0" />
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
                      size="sm"
                      className="hover:text-destructive flex-shrink-0"
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
                <p className="text-sm font-semibold">Riepilogo del post</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={status === "ACTIVE" ? "default" : "secondary"}>
                    {status === "ACTIVE" ? "📢 Attivo" : "📝 Bozza"}
                  </Badge>
                  {hasPoll && (
                    <Badge variant="outline" className="gap-1">
                      📊 Sondaggio
                      <span className="text-xs text-muted-foreground">
                        ({pollOptions.filter(o => o.text.trim()).length} opzioni)
                      </span>
                    </Badge>
                  )}
                  {selectedDocuments.length > 0 && (
                    <Badge variant="outline" className="gap-1">
                      📎 {selectedDocuments.length} documenti
                    </Badge>
                  )}
                  {title && (
                    <Badge variant="outline" className="gap-1">
                      ✏️ {title.length} caratteri
                    </Badge>
                  )}
                  {!isBodyEmpty && (
                    <Badge variant="outline" className="gap-1">
                      📄 {body.length} caratteri
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Button
                  variant="outline"
                  onClick={goBack}
                  className="flex-1 md:flex-none"
                >
                  Annulla
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !title || isBodyEmpty}
                  className="flex-1 md:flex-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creazione...
                    </>
                  ) : (
                    "Pubblica Post"
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
            >
              Cerca
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {documentsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
                    <TableHead>Tipo</TableHead>
                    <TableHead>Versione</TableHead>
                    <TableHead>Dimensione</TableHead>
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
                          <File className="h-4 w-4 text-primary" />
                          <span className="truncate max-w-[200px]">{doc.originalName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {doc.contentType}
                        </Badge>
                      </TableCell>
                      <TableCell>v{doc.currentVersion}</TableCell>
                      <TableCell>{formatSize(doc.size)}</TableCell>
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
            <Button onClick={confirmDocumentSelection}>
              <Check className="h-4 w-4 mr-2" />
              Conferma selezione
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}