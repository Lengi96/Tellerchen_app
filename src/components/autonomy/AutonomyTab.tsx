"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Plus,
  Pencil,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
} from "lucide-react";
import { AutonomyModal } from "./AutonomyModal";

// Mapping der technischen Feldnamen zu lesbaren Labels
const FIELD_LABELS: Record<string, string> = {
  CREATED: "Absprache erstellt",
  canPortionSupervised: "Unter Aufsicht portionieren",
  canPortionIndependent: "Eigenständig portionieren",
  notes: "Notizen",
  validFrom: "Gültig ab",
  validUntil: "Befristet bis",
};

function formatFieldLabel(field: string): string {
  return FIELD_LABELS[field] || field;
}

function formatValue(field: string, value: string): string {
  if (value === "true") return "Ja";
  if (value === "false") return "Nein";
  if (value === "—") return "—";
  if (value === "unbefristet") return "Unbefristet";
  // Datumsformat prüfen
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(value).toLocaleDateString("de-DE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
  return value;
}

interface AutonomyTabProps {
  patientId: string;
}

export function AutonomyTab({ patientId }: AutonomyTabProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = trpc.autonomy.getByPatient.useQuery({
    patientId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const agreement = data?.agreement;
  const auditLog = data?.auditLog ?? [];

  // Leerzustand
  if (!agreement) {
    return (
      <>
        <Card className="rounded-xl shadow-sm">
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 mb-3 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground font-medium">
              Noch keine Absprachen hinterlegt
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Erstellen Sie eine Vereinbarung zur Selbstständigkeit.
            </p>
            <Button
              className="mt-4 rounded-xl bg-primary hover:bg-primary-600"
              onClick={() => setModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Absprache erstellen
            </Button>
          </CardContent>
        </Card>

        <AutonomyModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          patientId={patientId}
          existing={null}
          onSuccess={() => setModalOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Header */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm text-muted-foreground">
                Aktuelle Absprache
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Zuletzt geändert:{" "}
                {new Date(agreement.updatedAt).toLocaleDateString("de-DE", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {" Uhr"}
                {agreement.createdByUser && (
                  <> von {agreement.createdByUser.name}</>
                )}
              </p>
            </div>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setModalOpen(true)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Bearbeiten
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Status-Karten */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card
          className={`rounded-xl shadow-sm border-2 ${
            agreement.canPortionSupervised
              ? "border-emerald-200 bg-emerald-50/30"
              : "border-gray-200"
          }`}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {agreement.canPortionSupervised ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              ) : (
                <XCircle className="h-6 w-6 text-gray-400" />
              )}
              <div>
                <p className="font-medium text-sm">
                  Unter Aufsicht portionieren
                </p>
                <p className="text-xs text-muted-foreground">
                  {agreement.canPortionSupervised
                    ? "Erlaubt"
                    : "Nicht erlaubt"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`rounded-xl shadow-sm border-2 ${
            agreement.canPortionIndependent
              ? "border-emerald-200 bg-emerald-50/30"
              : "border-gray-200"
          }`}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {agreement.canPortionIndependent ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              ) : (
                <XCircle className="h-6 w-6 text-gray-400" />
              )}
              <div>
                <p className="font-medium text-sm">
                  Eigenständig portionieren
                </p>
                <p className="text-xs text-muted-foreground">
                  {agreement.canPortionIndependent
                    ? "Erlaubt"
                    : "Nicht erlaubt"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notiz + Gültigkeit */}
      <Card className="rounded-xl shadow-sm">
        <CardContent className="pt-6 space-y-3">
          {agreement.notes && (
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">
                Notizen
              </p>
              <p className="text-sm">{agreement.notes}</p>
            </div>
          )}
          <div className="flex gap-6">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">
                Gültig ab
              </p>
              <p className="text-sm">
                {new Date(agreement.validFrom).toLocaleDateString("de-DE", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">
                Befristet bis
              </p>
              <p className="text-sm">
                {agreement.validUntil
                  ? new Date(agreement.validUntil).toLocaleDateString("de-DE", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Unbefristet"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit-Log */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            Änderungsverlauf
          </CardTitle>
        </CardHeader>
        <CardContent>
          {auditLog.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Keine Einträge vorhanden.
            </p>
          ) : (
            <div className="space-y-4">
              {auditLog.map((entry) => (
                <div
                  key={entry.id}
                  className="relative pl-6 border-l-2 border-gray-200 pb-4 last:pb-0"
                >
                  {/* Dot */}
                  <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-primary" />

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="secondary"
                        className="rounded-lg text-xs"
                      >
                        {formatFieldLabel(entry.fieldChanged)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.changedAt).toLocaleDateString("de-DE", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        von {entry.changedByUser.name}
                      </span>
                    </div>

                    {entry.fieldChanged !== "CREATED" && (
                      <p className="text-sm">
                        <span className="text-muted-foreground line-through">
                          {formatValue(entry.fieldChanged, entry.oldValue)}
                        </span>
                        {" → "}
                        <span className="font-medium">
                          {formatValue(entry.fieldChanged, entry.newValue)}
                        </span>
                      </p>
                    )}

                    <p className="text-xs italic text-muted-foreground">
                      &ldquo;{entry.reason}&rdquo;
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <AutonomyModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        patientId={patientId}
        existing={agreement}
        onSuccess={() => setModalOpen(false)}
      />
    </div>
  );
}
