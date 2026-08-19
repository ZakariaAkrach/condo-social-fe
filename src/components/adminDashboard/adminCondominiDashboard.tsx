// components/admin/AdminCondominiDashboard.tsx
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Ticket,
  Users,
  Pencil,
  Trash2,
  UserPlus,
  Settings,
  Home,
  ArrowUpRight,
  Layers,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { condominiumApi, type CondominiumDto } from "@/app/api/condominium";
import { useNavigate } from "react-router";

type EditCondominiumData = {
  country: string;
  name: string;
  city: string;
  address: string;
  cap: string;
  condominiumEmail: string;
};

interface AdminCondominiDashboardProps {
  condominiums: CondominiumDto[];
  totalElements: number;
  loading?: boolean;
  onRefresh?: () => void; // per aggiornare dopo eliminazione/modifica
}

export default function AdminCondominiDashboard({
  condominiums,
  totalElements,
  loading: externalLoading,
  onRefresh,
}: AdminCondominiDashboardProps) {
  const navigate = useNavigate();

  // Dialog di eliminazione
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState("");
  const [deleteInputValue, setDeleteInputValue] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Dialog di modifica
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCondominium, setEditingCondominium] = useState<CondominiumDto | null>(null);
  const [editFormData, setEditFormData] = useState<EditCondominiumData>({
    country: "",
    name: "",
    city: "",
    address: "",
    cap: "",
    condominiumEmail: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // --- Gestione eliminazione ---
  const handleDeleteClick = (id: string, name: string) => {
    setDeleteTargetId(id);
    setDeleteTargetName(name);
    setDeleteInputValue("");
    setDeleteError(null);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId || deleteInputValue !== deleteTargetName) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await condominiumApi.deleteCondominium(deleteTargetId);
      if (onRefresh) onRefresh(); // aggiorna la lista
      setDeleteDialogOpen(false);
    } catch (err: any) {
      setDeleteError(err.message || "Errore durante l'eliminazione");
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Gestione modifica ---
  const handleEditClick = (id: string) => {
    const condominio = condominiums.find((c) => c.id === id);
    if (condominio) {
      setEditingCondominium(condominio);
      setEditFormData({
        country: condominio.country || "",
        name: condominio.name,
        city: condominio.city,
        address: condominio.address,
        cap: condominio.cap || "",
        condominiumEmail: condominio.condominiumEmail || "",
      });
      setEditError(null);
      setEditDialogOpen(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingCondominium) return;
    setIsEditing(true);
    setEditError(null);
    try {
      await condominiumApi.updateCondominium(editFormData, editingCondominium.id);
      if (onRefresh) onRefresh(); // aggiorna la lista
      setEditDialogOpen(false);
    } catch (err: any) {
      setEditError(err.message || "Errore durante il salvataggio");
    } finally {
      setIsEditing(false);
    }
  };

  const handleManageUsers = (id: string) => console.log("Utenti", id);

  const displayedCondomini = condominiums.slice(0, 3);
  const hasMore = totalElements > 3;

  if (externalLoading) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2.5 text-foreground">
            <Layers className="h-6 w-6 text-primary" />
            I tuoi condomini
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gestisci ogni edificio, i suoi residenti e le richieste aperte
          </p>
        </div>
        <Badge variant="secondary" className="text-xs px-4 py-1.5 rounded-full font-medium bg-primary/10 text-primary">
          {totalElements} attivi
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {displayedCondomini.map((c) => (
          <Card
            key={c.id}
            className="group relative border border-border bg-card hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-1.5 bg-linear-to-r from-primary to-primary/60" />
            <CardHeader className="pb-2 pt-5 px-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                    <Home className="h-5 w-5 text-primary" />
                    {c.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>{c.address}</span>
                    <span className="text-muted-foreground/30">·</span>
                    <span>{c.city}</span>
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 border-none hover:text-foreground transition-colors duration-200 data-[state=open]:text-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 active:outline-none active:ring-0">
                      <Settings className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 rounded-xl p-1 shadow-lg">
                    <DropdownMenuItem onClick={() => handleEditClick(c.id)} className="rounded-lg">
                      <Pencil className="mr-2 h-4 w-4" />
                      Modifica scheda
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleManageUsers(c.id)} className="rounded-lg">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Gestisci utenti
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteClick(c.id, c.name)} className="text-destructive focus:text-destructive rounded-lg">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Elimina condominio
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-5 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default" className="capitalize font-semibold text-xs px-2.5 py-1">
                  Amministratore
                </Badge>
                <Badge variant="outline" className="gap-1.5 text-xs px-2.5 py-1">
                  <Users className="h-3.5 w-3.5" />
                  {0}
                </Badge>
                <Badge variant="outline" className="gap-1.5 text-xs px-2.5 py-1 border-muted-foreground/30 text-muted-foreground">
                  <Ticket className="h-3.5 w-3.5" />
                  {0} ticket
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/admin/condomini/${c.id}`)}
                className="w-full justify-between group/btn font-semibold text-primary hover:bg-primary/10 hover:text-primary/90 transition-all duration-200"
              >
                <span>Entra nel condominio</span>
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" className="gap-2" onClick={() => navigate("/admin/condomini")}>
            Vedi tutti i condomini
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Dialog di eliminazione (invariato) */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Elimina condominio</DialogTitle>
            <DialogDescription>
              Questa azione è <span className="font-semibold text-destructive">irreversibile</span>.
              Tutti i dati associati verranno cancellati definitivamente.
              <br />
              <br />
              Per confermare, digita il nome del condominio:{' '}
              <span className="font-mono font-semibold text-foreground">{deleteTargetName}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="delete-confirm-input" className="text-sm font-medium">
                Nome condominio
              </Label>
              <Input
                id="delete-confirm-input"
                type="text"
                value={deleteInputValue}
                onChange={(e) => setDeleteInputValue(e.target.value)}
                placeholder="Inserisci il nome del condominio"
                className="font-mono"
                autoFocus
              />
              {deleteError && <p className="text-sm text-destructive mt-1">{deleteError}</p>}
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Annulla
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting || deleteInputValue !== deleteTargetName || !deleteTargetId}
              className="min-w-[100px]"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminazione...
                </>
              ) : (
                "Elimina condominio"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog di modifica (invariato) */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifica condominio</DialogTitle>
            <DialogDescription>Aggiorna i dati del condominio.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="edit-name">Nome condominio *</Label>
                <Input
                  id="edit-name"
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-country">Paese *</Label>
                <Input
                  id="edit-country"
                  type="text"
                  value={editFormData.country}
                  onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })}
                  placeholder="Italia"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-address">Indirizzo *</Label>
              <Input
                id="edit-address"
                type="text"
                value={editFormData.address}
                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="edit-city">Città *</Label>
                <Input
                  id="edit-city"
                  type="text"
                  value={editFormData.city}
                  onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-cap">CAP</Label>
                <Input
                  id="edit-cap"
                  type="text"
                  value={editFormData.cap}
                  onChange={(e) => setEditFormData({ ...editFormData, cap: e.target.value })}
                  placeholder="00100"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-email">Email del condominio</Label>
              <Input
                id="edit-email"
                type="email"
                value={editFormData.condominiumEmail}
                onChange={(e) => setEditFormData({ ...editFormData, condominiumEmail: e.target.value })}
                placeholder="condominio@example.com"
              />
            </div>
            {editError && <p className="text-sm text-destructive">{editError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isEditing}>
              Annulla
            </Button>
            <Button onClick={handleSaveEdit} disabled={isEditing}>
              {isEditing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvataggio...
                </>
              ) : (
                "Salva modifiche"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}