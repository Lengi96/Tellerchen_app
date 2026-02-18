"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Shield, Users, Building2, Lock, Info } from "lucide-react";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const utils = trpc.useUtils();
  const [organizationName, setOrganizationName] = useState("");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [inlineFeedback, setInlineFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const isAdmin = session?.user?.role === "ADMIN";
  const { data: organization, isLoading: organizationLoading } =
    trpc.organization.get.useQuery(undefined, {
      enabled: isAdmin,
    });

  useEffect(() => {
    if (organization?.name) {
      setOrganizationName(organization.name);
    }
  }, [organization?.name]);

  const updateOrganization = trpc.organization.updateName.useMutation({
    onSuccess: (updatedOrganization) => {
      utils.organization.get.setData(undefined, updatedOrganization);
      setLastSavedAt(new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }));
      setInlineFeedback({
        type: "success",
        message: "Einrichtung wurde erfolgreich gespeichert.",
      });
      toast.success("Einrichtung wurde gespeichert.");
    },
    onError: (error) => {
      setInlineFeedback({
        type: "error",
        message: error.message || "Einrichtung konnte nicht gespeichert werden.",
      });
      toast.error(error.message || "Einrichtung konnte nicht gespeichert werden.");
    },
  });

  const trimmedName = organizationName.trim();
  const hasUnsavedChanges = useMemo(() => {
    if (!organization) return false;
    return trimmedName !== organization.name;
  }, [organization, trimmedName]);

  const saveStatus = useMemo(() => {
    if (organizationLoading) return "Lade Einrichtungsdaten…";
    if (updateOrganization.isPending) return "Speichert…";
    if (hasUnsavedChanges) return "Ungespeicherte Änderungen";
    if (lastSavedAt) return `Zuletzt gespeichert um ${lastSavedAt} Uhr`;
    return "Alle Änderungen gespeichert";
  }, [
    organizationLoading,
    updateOrganization.isPending,
    hasUnsavedChanges,
    lastSavedAt,
  ]);

  // Sicherheitshinweis: Nur Admins sehen diese Seite (Middleware + Client-Check)
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Lade Einstellungen…
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <Shield className="mx-auto h-12 w-12 mb-3 opacity-50" />
        <p>Zugriff verweigert. Diese Seite ist nur für Administratoren.</p>
      </div>
    );
  }

  function handleOrganizationSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInlineFeedback(null);
    updateOrganization.mutate({ name: trimmedName });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-main">Einstellungen</h2>
        <p className="text-muted-foreground">
          Verwaltung der Einrichtung und Mitarbeiter
        </p>
      </div>

      <Tabs defaultValue="staff" className="space-y-4">
        <TabsList className="rounded-xl">
          <TabsTrigger value="staff" className="rounded-xl">
            <Users className="mr-2 h-4 w-4" />
            Mitarbeiter
          </TabsTrigger>
          <TabsTrigger value="organization" className="rounded-xl">
            <Building2 className="mr-2 h-4 w-4" />
            Einrichtung
          </TabsTrigger>
          <TabsTrigger value="privacy" className="rounded-xl">
            <Lock className="mr-2 h-4 w-4" />
            Datenschutz
          </TabsTrigger>
        </TabsList>

        {/* Mitarbeiter verwalten */}
        <TabsContent value="staff">
          <Card className="rounded-xl shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-text-main">
                    Mitarbeiter verwalten
                  </CardTitle>
                  <CardDescription>
                    Übersicht aller Mitarbeiter Ihrer Einrichtung
                  </CardDescription>
                </div>
                <Button className="rounded-xl bg-primary hover:bg-primary-600">
                  Mitarbeiter einladen
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>E-Mail</TableHead>
                    <TableHead>Rolle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      {session.user.name}
                    </TableCell>
                    <TableCell>{session.user.email}</TableCell>
                    <TableCell>
                      <Badge className="rounded-xl bg-primary text-white">
                        Administrator
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="rounded-xl bg-secondary/20 text-secondary-600"
                      >
                        Aktiv
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-xs text-muted-foreground">
                        (Sie)
                      </span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Einrichtung */}
        <TabsContent value="organization">
          <Card className="rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-text-main">
                Einrichtungsdaten
              </CardTitle>
              <CardDescription>
                Grunddaten Ihrer Einrichtung bearbeiten
              </CardDescription>
            </CardHeader>
            <CardContent className="max-w-md">
              <form className="space-y-4" onSubmit={handleOrganizationSave}>
                <div className="space-y-2">
                  <Label htmlFor="orgName">Einrichtungsname</Label>
                  <Input
                    id="orgName"
                    name="orgName"
                    autoComplete="organization"
                    className="rounded-xl"
                    placeholder="Name der Einrichtung…"
                    value={organizationName}
                    onChange={(event) => setOrganizationName(event.target.value)}
                    disabled={organizationLoading || updateOrganization.isPending}
                  />
                </div>

                <p
                  aria-live="polite"
                  className="text-sm text-muted-foreground"
                >
                  {saveStatus}
                </p>

                {inlineFeedback && (
                  <div
                    role="status"
                    aria-live={inlineFeedback.type === "error" ? "assertive" : "polite"}
                    className={
                      inlineFeedback.type === "error"
                        ? "rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                        : "rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
                    }
                  >
                    {inlineFeedback.message}
                  </div>
                )}

                <Button
                  type="submit"
                  className="rounded-xl bg-primary hover:bg-primary-600"
                  disabled={
                    organizationLoading ||
                    updateOrganization.isPending ||
                    trimmedName.length < 2 ||
                    !hasUnsavedChanges
                  }
                >
                  {updateOrganization.isPending ? "Speichert…" : "Speichern"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Datenschutz */}
        <TabsContent value="privacy">
          <Card className="rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-text-main flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Datenschutz & DSGVO
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-xl bg-accent/50 p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-text-main mb-1">
                      Datenschutzhinweise
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      NutriKompass speichert ausschließlich pseudonymisierte
                      Daten. Es werden keine Klarnamen der betreuten
                      Jugendlichen erfasst. Alle Daten werden verschlüsselt in
                      einer sicheren Datenbank gespeichert und sind nur für
                      autorisiertes Fachpersonal Ihrer Einrichtung zugänglich.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium text-text-main mb-2">
                  Gespeicherte Daten
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Pseudonyme und Geburtsjahre der betreuten Personen</li>
                  <li>Gewichtsverlaufsdaten</li>
                  <li>
                    Allergien und Unverträglichkeiten
                  </li>
                  <li>Generierte Ernährungspläne und Einkaufslisten</li>
                  <li>Mitarbeiter-Accounts (E-Mail, Name, Rolle)</li>
                </ul>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium text-text-main mb-2">
                  Datenlöschung beantragen
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Gemäß DSGVO Art. 17 haben betroffene Personen das Recht auf
                  Löschung ihrer Daten. Patienten werden in NutriKompass
                  standardmäßig deaktiviert (Soft-Delete), um die
                  Dokumentationspflicht zu erfüllen.
                </p>
                <Button variant="outline" className="rounded-xl text-destructive border-destructive hover:bg-destructive/10">
                  Datenlöschung beantragen
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
