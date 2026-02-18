"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Users, Loader2 } from "lucide-react";
import { CreatePatientModal } from "@/components/modals/CreatePatientModal";

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [inlineFeedback, setInlineFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const { data: patients, isLoading, refetch } = trpc.patients.list.useQuery({
    search: search || undefined,
  });

  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-main">Patienten</h2>
          <p className="text-muted-foreground">
            Übersicht aller betreuten Personen
          </p>
        </div>
        <Button
          className="rounded-xl bg-primary hover:bg-primary-600"
          onClick={() => setModalOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Neuen Patienten anlegen
        </Button>
      </div>

      {/* Suche */}
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

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Nach Pseudonym suchen..."
          className="rounded-xl pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabelle */}
      <Card className="rounded-xl shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !patients || patients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="mx-auto h-12 w-12 mb-3 opacity-50" />
              <p className="font-medium">Keine Patienten gefunden</p>
              <p className="text-sm mt-1">
                {search
                  ? "Versuchen Sie einen anderen Suchbegriff."
                  : "Legen Sie den ersten Patienten an."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pseudonym</TableHead>
                  <TableHead>Alter</TableHead>
                  <TableHead>Akt. Gewicht</TableHead>
                  <TableHead>Zielgewicht</TableHead>
                  <TableHead>Letzter Plan</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow
                    key={patient.id}
                    className="cursor-pointer hover:bg-accent/50"
                  >
                    <TableCell>
                      <Link
                        href={`/patients/${patient.id}`}
                        className="font-medium text-text-main hover:text-primary"
                      >
                        {patient.pseudonym}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {currentYear - patient.birthYear} Jahre
                    </TableCell>
                    <TableCell>
                      {Number(patient.currentWeight).toFixed(1)} kg
                    </TableCell>
                    <TableCell>
                      {Number(patient.targetWeight).toFixed(1)} kg
                    </TableCell>
                    <TableCell>
                      {patient.mealPlans[0] ? (
                        <Badge
                          variant="secondary"
                          className="rounded-xl bg-secondary/20 text-secondary-600"
                        >
                          {new Date(
                            patient.mealPlans[0].createdAt
                          ).toLocaleDateString("de-DE")}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          Kein Plan
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/patients/${patient.id}`}>
                        <Button variant="ghost" size="sm" className="rounded-xl">
                          Details
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <CreatePatientModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={() => {
          setModalOpen(false);
          setInlineFeedback({
            type: "success",
            message: "Patient wurde erfolgreich gespeichert.",
          });
          refetch();
        }}
      />
    </div>
  );
}
