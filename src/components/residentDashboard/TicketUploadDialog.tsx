// src/components/ticket/TicketUploadDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, File, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTicketUpload } from "./useTicketUpload";

interface TicketUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  condominiumId: string;
  ticketId: string;
  onUploadComplete?: () => void;
  trigger?: React.ReactNode;
}

export function TicketUploadDialog({
  open,
  onOpenChange,
  condominiumId,
  ticketId,
  onUploadComplete,
  trigger,
}: TicketUploadDialogProps) {
  const {
    selectedFile,
    isUploading,
    uploadStep,
    uploadProgress,
    selectFile,
    clearFile,
    uploadFile,
    resetState,
    fileInputRef,
  } = useTicketUpload({
    condominiumId,
    ticketId,
    onUploadComplete: () => {
      onUploadComplete?.();
      onOpenChange(false);
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isUploading) resetState();
    onOpenChange(newOpen);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getStepLabel = () => {
    switch (uploadStep) {
      case "getting-url": return "Preparazione...";
      case "uploading-to-storage": return "Caricamento su storage...";
      case "confirming": return "Conferma...";
      default: return "";
    }
  };

  return (
    <>
      {trigger && <div onClick={() => handleOpenChange(true)}>{trigger}</div>}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[480px] p-4 md:p-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg md:text-xl">Carica allegato</DialogTitle>
            <DialogDescription className="text-sm">
              Seleziona un file da allegare al ticket.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div
              className={cn(
                "relative border-2 border-dashed rounded-xl p-6 md:p-8",
                "text-center hover:bg-muted/50 transition-colors",
                "cursor-pointer",
                isUploading && "pointer-events-none opacity-60",
                selectedFile && "border-primary/50 bg-muted/20"
              )}
              onClick={() => !isUploading && fileInputRef.current?.click()}
            >
              <Input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) selectFile(e.target.files[0]);
                }}
                disabled={isUploading}
              />
              {selectedFile ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-3 w-full justify-center">
                    <File className="h-8 w-8 text-primary shrink-0" />
                    <div className="text-left min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">{formatSize(selectedFile.size)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={(e) => { e.stopPropagation(); clearFile(); }}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm font-medium">Clicca per selezionare un file</p>
                  <p className="text-xs text-muted-foreground">PDF, immagini, Word, Excel, ecc.</p>
                </div>
              )}
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {getStepLabel()}
                  </span>
                  <span className="font-medium">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-300 rounded-full" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center">
              L'allegato sarà visibile a tutti i partecipanti al ticket. Dimensione massima: 10MB
            </p>
          </div>
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isUploading} className="w-full sm:w-auto">
              Annulla
            </Button>
            <Button onClick={uploadFile} disabled={!selectedFile || isUploading} className="w-full sm:w-auto gap-2">
              {isUploading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Caricamento...</>
              ) : (
                <><Upload className="h-4 w-4" /> Carica</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}