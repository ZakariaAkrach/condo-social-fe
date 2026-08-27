// src/hooks/useTicketUpload.ts
import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { uploadFileToStorage } from "@/auth/uploadStorage";
import { ticketResidentApi, type UploadAttachmentRequest } from "@/app/api/ticketResident";

interface UseTicketUploadProps {
  condominiumId: string;
  ticketId: string;
  onUploadComplete?: () => void;
}

interface UseTicketUploadReturn {
  isUploading: boolean;
  uploadStep: "idle" | "getting-url" | "uploading-to-storage" | "confirming";
  selectedFile: File | null;
  uploadProgress: number;
  selectFile: (file: File) => void;
  clearFile: () => void;
  uploadFile: () => Promise<void>;
  resetState: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export function useTicketUpload({
  condominiumId,
  ticketId,
  onUploadComplete,
}: UseTicketUploadProps): UseTicketUploadReturn {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<"idle" | "getting-url" | "uploading-to-storage" | "confirming">("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const getBaseNameWithoutExtension = (fileName: string) => {
    const lastDotIndex = fileName.lastIndexOf(".");
    const base = lastDotIndex > -1 ? fileName.substring(0, lastDotIndex) : fileName;
    return base.replace(/\./g, "");
  };

  const resetState = useCallback(() => {
    setSelectedFile(null);
    setIsUploading(false);
    setUploadStep("idle");
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const selectFile = useCallback((file: File) => {
    setSelectedFile(file);
    setUploadProgress(0);
  }, []);

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const uploadFile = useCallback(async () => {
    if (!selectedFile) {
      toast.error("Seleziona un file prima di caricare");
      return;
    }
    if (!condominiumId || !ticketId) {
      toast.error("Dati del ticket mancanti");
      return;
    }

    setIsUploading(true);
    setUploadStep("getting-url");
    setUploadProgress(10);

    try {
      const file = selectedFile;
      const extension = file.name.split(".").pop() || "";
      const originalFileName = getBaseNameWithoutExtension(file.name);

      const payload: UploadAttachmentRequest = {
        originalFileName,
        size: file.size,
        contentType: file.type || "application/octet-stream",
        extension,
        visibility: "PUBLIC",
      };

      const uploadResponse = await ticketResidentApi.upload(condominiumId, ticketId, payload);
      const { uploadUrl, ticketAttachmentId } = uploadResponse.data;

      if (!ticketAttachmentId) {
        throw new Error("ticketAttachmentId mancante nella risposta");
      }

      setUploadStep("uploading-to-storage");
      setUploadProgress(40);

      await uploadFileToStorage(file, uploadUrl);

      setUploadProgress(80);

      setUploadStep("confirming");
      setUploadProgress(90);

      await ticketResidentApi.confirmUpload(condominiumId, ticketId, ticketAttachmentId);

      setUploadProgress(100);
      toast.success("Allegato caricato con successo!");

      if (onUploadComplete) onUploadComplete();
      resetState();

    } catch (error: any) {
      console.error("Errore durante l'upload", error);
      const errorMsg = error?.response?.data?.message || error?.message || "Si è verificato un errore. Riprova più tardi.";
      toast.error(`Errore: ${errorMsg}`);
      setUploadStep("idle");
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, condominiumId, ticketId, onUploadComplete, resetState]);

  return {
    isUploading,
    uploadStep,
    selectedFile,
    uploadProgress,
    selectFile,
    clearFile,
    uploadFile,
    resetState,
    fileInputRef,
  };
}