import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { condominiumApi } from "@/app/api/condominium";

interface CreateCondominiumProps {
  onCondominiumCreated?: () => void;
}

export default function CreateCondominium({ onCondominiumCreated }: CreateCondominiumProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    country: "Italia",
    nome: "",
    citta: "",
    indirizzo: "",
    cap: "",
    condominioEmail: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, country: value }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nome) newErrors.nome = "Il nome è obbligatorio";
    if (!formData.citta) newErrors.citta = "La città è obbligatoria";
    if (!formData.indirizzo) newErrors.indirizzo = "L'indirizzo è obbligatorio";
    if (formData.cap.length < 5) newErrors.cap = "Il CAP deve avere almeno 5 caratteri";
    if (!formData.condominioEmail.includes("@"))
      newErrors.condominioEmail = "Email non valida";
    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      country: formData.country,
      name: formData.nome,
      city: formData.citta,
      address: formData.indirizzo,
      cap: formData.cap,
      condominiumEmail: formData.condominioEmail,
    };

    try {
      const response = await condominiumApi.createCondominium(payload);
      console.log(response);

      // ✅ Chiama la callback per aggiornare la lista
      if (onCondominiumCreated) {
        onCondominiumCreated();
      }

      setErrors({});
      setOpen(false);
      setFormData({
        country: "Italia",
        nome: "",
        citta: "",
        indirizzo: "",
        cap: "",
        condominioEmail: "",
      });
    } catch (error) {
      console.error("Errore durante la creazione:", error);
      // Gestisci eventuale errore
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
      <Button
        className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold rounded-xl"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4" />
        Nuovo condominio
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nuovo condominio</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* ... campi invariati ... */}
            <div>
              <label className="block text-sm font-medium">Paese</label>
              <Select value={formData.country} onValueChange={handleSelectChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Italia">Italia</SelectItem>
                  <SelectItem value="Francia">Francia</SelectItem>
                  <SelectItem value="Germania">Germania</SelectItem>
                  <SelectItem value="Spagna">Spagna</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium">Nome condominio</label>
              <Input
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Es. Condominio Rosa"
              />
              {errors.nome && <p className="text-sm text-red-500">{errors.nome}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">Città</label>
              <Input
                name="citta"
                value={formData.citta}
                onChange={handleChange}
                placeholder="Milano"
              />
              {errors.citta && <p className="text-sm text-red-500">{errors.citta}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">Indirizzo</label>
              <Input
                name="indirizzo"
                value={formData.indirizzo}
                onChange={handleChange}
                placeholder="Via Roma, 12"
              />
              {errors.indirizzo && <p className="text-sm text-red-500">{errors.indirizzo}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">CAP</label>
              <Input
                name="cap"
                value={formData.cap}
                onChange={handleChange}
                placeholder="20100"
              />
              {errors.cap && <p className="text-sm text-red-500">{errors.cap}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">Email condominio</label>
              <Input
                name="condominioEmail"
                type="email"
                value={formData.condominioEmail}
                onChange={handleChange}
                placeholder="condominio@email.it"
              />
              {errors.condominioEmail && (
                <p className="text-sm text-red-500">{errors.condominioEmail}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Annulla
              </Button>
              <Button onClick={handleSubmit}>Crea condominio</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}