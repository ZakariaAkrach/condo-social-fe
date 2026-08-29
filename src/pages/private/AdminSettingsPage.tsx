// src/pages/private/AdminSettingsPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router";
import {
  User,
  CreditCard,
  Bell,
  Trash2,
  Check,
  Moon,
  Sun,
  AlertCircle,
  Loader2,
  CheckCircle,
  Crown,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";

export default function AdminSettingsPage() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

  // Profile states
  const [profileData, setProfileData] = useState({
    firstName: profile?.firstName || "",
    lastName: profile?.lastName || "",
    email: profile?.email || user?.email || "",
  });

  // Notification states
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    ticketUpdates: true,
    postUpdates: true,
    documentUpdates: true,
  });

  // Subscription mock data
  const [subscription, setSubscription] = useState({
    plan: "Professional",
    status: "active",
    price: "€49/mese",
    nextBilling: "31 Dicembre 2025",
    features: [
      "Condomini illimitati",
      "Ticket illimitati",
      "Documenti illimitati",
      "Supporto prioritario",
      "Backup automatico",
      "API access",
    ],
  });

  const handleSaveProfile = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    toast.success("Profilo aggiornato con successo");
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoading(false);
    toast.success("Preferenze notifiche aggiornate");
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    setDeleteDialogOpen(false);
    toast.success("Account eliminato. Arrivederci!");
    navigate("/");
  };

  const handleChangePlan = (plan: string) => {
    setSubscription((prev) => ({
      ...prev,
      plan,
      price: plan === "Enterprise" ? "€99/mese" : plan === "Professional" ? "€49/mese" : "€19/mese",
      features:
        plan === "Enterprise"
          ? [
              "Tutto di Professional",
              "Condomini illimitati",
              "Supporto dedicato 24/7",
              "Personalizzazione avanzata",
              "SLA garantito",
              "Multi-tenant",
            ]
          : plan === "Professional"
          ? [
              "Condomini illimitati",
              "Ticket illimitati",
              "Documenti illimitati",
              "Supporto prioritario",
              "Backup automatico",
              "API access",
            ]
          : [
              "1 condominio",
              "Ticket limitati",
              "Documenti limitati",
              "Supporto email",
            ],
    }));
    toast.success(`Piano aggiornato a ${plan}`);
  };

  const handleCancelSubscription = () => {
    setSubscription((prev) => ({
      ...prev,
      status: "cancelled",
    }));
    toast.info("Abbonamento cancellato. Puoi riattivarlo in qualsiasi momento.");
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Impostazioni</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestisci il tuo account e le preferenze
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full sm:w-auto flex-wrap h-auto gap-1">
          <TabsTrigger value="profile" className="flex items-center gap-2 flex-1 sm:flex-none justify-center">
            <User className="h-4 w-4" />
            Profilo
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 flex-1 sm:flex-none justify-center">
            <Bell className="h-4 w-4" />
            Notifiche
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2 flex-1 sm:flex-none justify-center">
            <CreditCard className="h-4 w-4" />
            Abbonamento
          </TabsTrigger>
          <TabsTrigger value="danger" className="flex items-center gap-2 flex-1 sm:flex-none justify-center text-destructive">
            <AlertCircle className="h-4 w-4" />
            Elimina account
          </TabsTrigger>
        </TabsList>

        {/* Profilo */}
        <TabsContent value="profile" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Informazioni personali
              </CardTitle>
              <CardDescription>
                Aggiorna le tue informazioni personali
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/avatars/01.png" alt={profile?.firstName || "User"} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {profile?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {profile?.firstName} {profile?.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{profile?.email || user?.email}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nome</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Mario"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Cognome</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Rossi"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  disabled
                  className="bg-muted/50"
                />
                <p className="text-xs text-muted-foreground">
                  L'email non può essere modificata.
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setActiveTab("notifications")}>
                  Annulla
                </Button>
                <Button onClick={handleSaveProfile} disabled={loading} className="gap-2">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Salva modifiche
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preferenze app */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sun className="h-5 w-5 text-primary" />
                Preferenze applicazione
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  <div>
                    <p className="font-medium">Tema scuro</p>
                    <p className="text-xs text-muted-foreground">Attiva il tema scuro per l'applicazione</p>
                  </div>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifiche */}
        <TabsContent value="notifications" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Preferenze notifiche
              </CardTitle>
              <CardDescription>
                Scegli quali notifiche vuoi ricevere
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notifiche email</p>
                  <p className="text-xs text-muted-foreground">Ricevi notifiche via email</p>
                </div>
                <Switch
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, emailNotifications: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Aggiornamenti ticket</p>
                  <p className="text-xs text-muted-foreground">Quando un ticket viene aggiornato</p>
                </div>
                <Switch
                  checked={notifications.ticketUpdates}
                  onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, ticketUpdates: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Nuove comunicazioni</p>
                  <p className="text-xs text-muted-foreground">Quando viene pubblicato un nuovo post</p>
                </div>
                <Switch
                  checked={notifications.postUpdates}
                  onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, postUpdates: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Aggiornamenti documenti</p>
                  <p className="text-xs text-muted-foreground">Quando un documento viene caricato o modificato</p>
                </div>
                <Switch
                  checked={notifications.documentUpdates}
                  onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, documentUpdates: checked }))}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications} disabled={loading} className="gap-2">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Salva preferenze
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Abbonamento */}
        <TabsContent value="subscription" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Il tuo abbonamento
              </CardTitle>
              <CardDescription>
                Gestisci il tuo piano di abbonamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Piano attuale */}
              <div className="p-6 rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <Crown className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold">{subscription.plan}</h3>
                        <Badge variant={subscription.status === "active" ? "default" : "destructive"}>
                          {subscription.status === "active" ? "Attivo" : "Cancellato"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Rinnovo: {subscription.nextBilling}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{subscription.price}</p>
                    <p className="text-xs text-muted-foreground">fatturazione mensile</p>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div>
                <h4 className="font-medium mb-3">Funzionalità incluse:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {subscription.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Cambia piano */}
              <div>
                <h4 className="font-medium mb-3">Cambia piano:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleChangePlan("Basic")}
                    className={`p-4 rounded-lg border transition-all ${
                      subscription.plan === "Basic"
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <p className="font-semibold">Basic</p>
                    <p className="text-xl font-bold mt-1">€19/mese</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Per piccoli condomini
                    </p>
                  </button>
                  <button
                    onClick={() => handleChangePlan("Professional")}
                    className={`p-4 rounded-lg border transition-all ${
                      subscription.plan === "Professional"
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <p className="font-semibold">Professional</p>
                      <Sparkles className="h-3 w-3 text-primary" />
                    </div>
                    <p className="text-xl font-bold mt-1">€49/mese</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Per amministratori
                    </p>
                  </button>
                  <button
                    onClick={() => handleChangePlan("Enterprise")}
                    className={`p-4 rounded-lg border transition-all ${
                      subscription.plan === "Enterprise"
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <p className="font-semibold">Enterprise</p>
                    <p className="text-xl font-bold mt-1">€99/mese</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Per grandi organizzazioni
                    </p>
                  </button>
                </div>
              </div>

              {subscription.status === "active" && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    onClick={handleCancelSubscription}
                  >
                    Cancella abbonamento
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Elimina account */}
        <TabsContent value="danger" className="space-y-4 pt-4">
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Elimina account
              </CardTitle>
              <CardDescription>
                Azione irreversibile. Procedi con cautela.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="font-medium">Elimina definitivamente il tuo account</p>
                  <p className="text-xs text-muted-foreground">
                    Tutti i dati associati verranno eliminati definitivamente
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Elimina account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog elimina account */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Elimina account
            </DialogTitle>
            <DialogDescription>
              Questa azione è <span className="font-semibold text-destructive">irreversibile</span>.
              Tutti i tuoi dati verranno eliminati definitivamente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-sm font-medium">
                Per confermare, digita: <span className="font-mono">ELIMINA</span>
              </Label>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="ELIMINA"
                className="font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium">Password</Label>
              <Input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Inserisci la tua password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annulla
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== "ELIMINA" || !deletePassword || loading}
              className="gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Elimina definitivamente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}